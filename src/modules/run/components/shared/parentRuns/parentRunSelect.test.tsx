import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Run } from "@jield/solodb-typescript-core";
import { useParentRunSelection } from "../../../hooks/useParentRunSelection";
import ParentRunSelect from "./parentRunSelect";

const api = vi.hoisted(() => ({ listRuns: vi.fn(), listRunParts: vi.fn() }));
vi.mock("@jield/solodb-typescript-core", () => api);
vi.mock("./runPartPicker", () => ({ default: () => null }));

const initialRun = { id: 1, label: "RUN-1", name: "Initial suggestion" } as Run;
const remoteRun = { id: 2001, label: "RUN-2001", name: "Older run" } as Run;
const editedRun = { id: 3000 } as Run;

function page(items: Run[], currentPage = 1, hasMore = false) {
  return { items, currentPage, hasMore, amountOfPages: hasMore ? currentPage + 1 : currentPage, totalItems: 100 };
}

function scrollToBottom() {
  fireEvent.wheel(screen.getByRole("listbox"), { deltaY: 500 });
}

function renderSelector(run?: Run) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Harness() {
    const selection = useParentRunSelection();
    return <ParentRunSelect selection={selection} run={run} />;
  }
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/default"]}>
        <Routes>
          <Route path="/:environment" element={<Harness />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
  api.listRuns.mockImplementation(({ query }: { query?: string }) =>
    Promise.resolve(page(query ? [remoteRun] : [initialRun]))
  );
  api.listRunParts.mockResolvedValue({ items: [] });
});

describe("ParentRunSelect", () => {
  it.each([undefined, editedRun])("searches beyond initial suggestions with the current scope (%j)", async (run) => {
    const user = userEvent.setup();
    renderSelector(run);
    await waitFor(() =>
      expect(api.listRuns).toHaveBeenCalledWith({
        environment: "default",
        availableAsParentForRun: run,
        query: undefined,
        pageSize: 50,
        page: 1,
      })
    );

    const input = screen.getByRole("combobox");
    await user.click(input);
    expect(await screen.findByRole("option", { name: "RUN-1 — Initial suggestion" })).toBeInTheDocument();
    await user.type(input, "RUN-2001");

    expect(await screen.findByRole("option", { name: "RUN-2001 — Older run" })).toBeInTheDocument();
    expect(api.listRuns).toHaveBeenCalledWith({
      environment: "default",
      availableAsParentForRun: run,
      query: "RUN-2001",
      pageSize: 50,
      page: 1,
    });
    expect(screen.queryByRole("option", { name: "RUN-1 — Initial suggestion" })).not.toBeInTheDocument();

    await user.clear(input);
    expect(await screen.findByRole("option", { name: "RUN-1 — Initial suggestion" })).toBeInTheDocument();
    await user.type(input, "RUN-2001");
    await user.click(await screen.findByRole("option", { name: "RUN-2001 — Older run" }));
    expect(await screen.findByRole("button", { name: "RUN-2001" })).toBeInTheDocument();
    expect(api.listRunParts).toHaveBeenCalledWith({ run: remoteRun });
  });

  it("keeps server matches even when the search text is absent from the option label", async () => {
    const user = userEvent.setup();
    renderSelector();
    await user.type(screen.getByRole("combobox"), "project keyword");
    expect(await screen.findByRole("option", { name: "RUN-2001 — Older run" })).toBeInTheDocument();
  });

  it.each(["", "project"])("appends pages on scroll and stops at the last page (search: %j)", async (search) => {
    api.listRuns.mockImplementation(({ page: pageNumber }: { page: number }) =>
      Promise.resolve(page(pageNumber === 1 ? [initialRun] : [initialRun, remoteRun], pageNumber, pageNumber === 1))
    );
    const user = userEvent.setup();
    renderSelector(editedRun);
    const input = screen.getByRole("combobox");
    await user.click(input);
    if (search) await user.type(input, search);
    await screen.findByRole("option", { name: "RUN-1 — Initial suggestion" });
    scrollToBottom();

    expect(await screen.findByRole("option", { name: "RUN-2001 — Older run" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(api.listRuns).toHaveBeenCalledWith({
      environment: "default",
      availableAsParentForRun: editedRun,
      query: search || undefined,
      pageSize: 50,
      page: 2,
    });
    const calls = api.listRuns.mock.calls.length;
    fireEvent.wheel(screen.getByRole("listbox"), { deltaY: -500 });
    scrollToBottom();
    expect(api.listRuns).toHaveBeenCalledTimes(calls);
  });

  it("isolates a new search from a pending next page and prevents duplicate page requests", async () => {
    let resolveNextPage!: (result: ReturnType<typeof page>) => void;
    api.listRuns.mockImplementation(({ page: pageNumber, query }: { page: number; query?: string }) => {
      if (query) return Promise.resolve(page([remoteRun]));
      if (pageNumber === 1) return Promise.resolve(page([initialRun], 1, true));
      return new Promise<ReturnType<typeof page>>((resolve) => {
        resolveNextPage = resolve;
      });
    });
    const user = userEvent.setup();
    renderSelector();
    const input = screen.getByRole("combobox");
    await user.click(input);
    await screen.findByRole("option", { name: "RUN-1 — Initial suggestion" });
    scrollToBottom();
    await waitFor(() => expect(resolveNextPage).toBeDefined());
    fireEvent.wheel(screen.getByRole("listbox"), { deltaY: -500 });
    scrollToBottom();
    expect(api.listRuns.mock.calls.filter(([params]) => params.page === 2)).toHaveLength(1);

    await user.type(input, "new search");
    await screen.findByRole("option", { name: "RUN-2001 — Older run" });
    await act(async () => resolveNextPage(page([initialRun], 2)));
    expect(screen.queryByRole("option", { name: "RUN-1 — Initial suggestion" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(1);
  });
});
