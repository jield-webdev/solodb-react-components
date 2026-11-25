import { useEffect, useState, type ReactNode } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Run, TrayType } from "@jield/solodb-typescript-core";
import { RunContext } from "../../../../contexts/runContext";
import { getRunQueryKey } from "../../../../utils/runCache";
import type { RunTray } from "../../../../utils/runTrays";
import AddExtraTrayButton from "./addExtraTrayButton";
import RunLayoutTrayActions from "./runLayoutTrayActions";

const api = vi.hoisted(() => ({ post: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
vi.mock("axios", async (importOriginal) => {
  const original = await importOriginal<typeof import("axios")>();
  return { ...original, default: { ...original.default, create: () => api } };
});

const trayType = { id: 1, rows: 2, columns: 2 } as TrayType;
const physicalTray: RunTray = {
  id: 1,
  name: "Tray 1",
  sequence: 1,
  label: "T1",
  extra_tray_id: 0,
  tray_type: trayType,
};
const extraTray: RunTray = { ...physicalTray, id: 2, name: "Extra Tray 1", label: "E1", extra_tray_id: 1 };
const initialRun = { id: 10, tray_type: trayType, run_trays: [physicalTray, extraTray] } as Run;

function renderControls(children: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  queryClient.setQueryData(getRunQueryKey(10), initialRun);
  function Harness() {
    const [run, setRun] = useState(initialRun);
    useEffect(
      () =>
        queryClient.getQueryCache().subscribe(() => {
          setRun(queryClient.getQueryData<Run>(getRunQueryKey(10))!);
        }),
      []
    );
    return <RunContext.Provider value={{ run, reloadRun: vi.fn() }}>{children}</RunContext.Provider>;
  }
  render(
    <QueryClientProvider client={queryClient}>
      <Harness />
    </QueryClientProvider>
  );
  return queryClient;
}

afterEach(cleanup);
beforeEach(() => vi.resetAllMocks());

describe("extra tray controls", () => {
  it("adds an empty tray while another extra tray has free slots and updates the run cache", async () => {
    const created = { ...extraTray, id: 3, name: "Extra Tray 2", extra_tray_id: 2 };
    api.post.mockResolvedValue({ data: created });
    const client = renderControls(<AddExtraTrayButton />);

    await userEvent.click(screen.getByRole("button", { name: "Add extra tray" }));

    await waitFor(() =>
      expect(client.getQueryData<Run>(getRunQueryKey(10))?.run_trays).toEqual([physicalTray, extraTray, created])
    );
    expect(api.post).toHaveBeenCalledWith("create/run/tray", { run_id: 10 });
  });

  it("disables adding during a request and preserves existing trays when creation fails", async () => {
    let rejectRequest!: (error: Error) => void;
    api.post.mockReturnValue(
      new Promise((_, reject) => {
        rejectRequest = reject;
      })
    );
    const client = renderControls(<AddExtraTrayButton />);
    await userEvent.click(screen.getByRole("button", { name: "Add extra tray" }));
    expect(await screen.findByRole("button", { name: "Adding tray…" })).toBeDisabled();
    rejectRequest(new Error("Offline"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to update the extra tray");
    expect(client.getQueryData<Run>(getRunQueryKey(10))?.run_trays).toEqual(initialRun.run_trays);
  });

  it("renames a populated tray and closes the editor after saving", async () => {
    api.patch.mockResolvedValue({ data: { ...extraTray, name: "Rework" } });
    const client = renderControls(<RunLayoutTrayActions tray={extraTray} hasParts />);
    await userEvent.click(screen.getByRole("button", { name: "Edit Extra Tray 1" }));
    expect(screen.getByRole("button", { name: "Remove tray" })).toBeDisabled();
    await userEvent.clear(screen.getByLabelText("Tray name"));
    await userEvent.type(screen.getByLabelText("Tray name"), "  Rework  ");
    await userEvent.click(screen.getByRole("button", { name: "Save", exact: true }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(api.patch).toHaveBeenCalledWith("update/run/tray/2", { name: "Rework" });
    expect(client.getQueryData<Run>(getRunQueryKey(10))?.run_trays[1].name).toBe("Rework");
  });

  it("does not save blank names or cancelled edits", async () => {
    renderControls(<RunLayoutTrayActions tray={extraTray} hasParts={false} />);
    await userEvent.click(screen.getByRole("button", { name: "Edit Extra Tray 1" }));
    await userEvent.clear(screen.getByLabelText("Tray name"));
    await userEvent.type(screen.getByLabelText("Tray name"), "   ");
    expect(screen.getByRole("button", { name: "Save", exact: true })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: "Edit Extra Tray 1" }));
    expect(screen.getByLabelText("Tray name")).toHaveValue("Extra Tray 1");
    expect(api.patch).not.toHaveBeenCalled();
  });

  it("keeps the tray and displays the API explanation when a different step still uses it", async () => {
    api.delete.mockRejectedValue(
      new axios.AxiosError("In use", "400", undefined, undefined, {
        data: { detail: "This tray still contains parts in another step" },
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: { headers: {} },
      })
    );
    const client = renderControls(<RunLayoutTrayActions tray={extraTray} hasParts={false} />);
    await userEvent.click(screen.getByRole("button", { name: "Edit Extra Tray 1" }));
    await userEvent.click(screen.getByRole("button", { name: "Remove tray" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("This tray still contains parts in another step");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(client.getQueryData<Run>(getRunQueryKey(10))?.run_trays).toEqual(initialRun.run_trays);
  });

  it("removes an empty tray from the cached run without changing other runs", async () => {
    api.delete.mockResolvedValue({ status: 204 });
    const client = renderControls(<RunLayoutTrayActions tray={extraTray} hasParts={false} />);
    const otherRun = { ...initialRun, id: 11 };
    client.setQueryData(getRunQueryKey(11), otherRun);
    await userEvent.click(screen.getByRole("button", { name: "Edit Extra Tray 1" }));
    await userEvent.click(screen.getByRole("button", { name: "Remove tray" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(api.delete).toHaveBeenCalledWith("delete/run/tray/2");
    expect(client.getQueryData<Run>(getRunQueryKey(10))?.run_trays).toEqual([physicalTray]);
    expect(client.getQueryData<Run>(getRunQueryKey(11))).toEqual(otherRun);
  });
});
