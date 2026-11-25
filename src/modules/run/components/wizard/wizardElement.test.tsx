import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Run } from "@jield/solodb-typescript-core";
import { initSolodbComponents } from "../../../core/config/runtimeConfig";
import type { ParentRunSelection } from "../../hooks/useParentRunSelection";
import RunPartPicker from "../shared/parentRuns/runPartPicker";
import NewRunWizard from "./wizardElement";

const api = vi.hoisted(() => ({
  createRun: vi.fn(),
  createRunParent: vi.fn(),
  createRunSubstrate: vi.fn(),
  listOrganisationGroups: vi.fn(),
  listOrganisationTeams: vi.fn(),
  listOrganisationProjects: vi.fn(),
}));
vi.mock("@jield/solodb-typescript-core", async (original) => ({
  ...(await original<typeof import("@jield/solodb-typescript-core")>()),
  ...api,
}));
const parent = { id: 10, label: "RUN-10", name: "Parent" } as Run;
const otherParent = { id: 20, label: "RUN-20", name: "Other parent" } as Run;
vi.mock("../shared/parentRuns/parentRunSelect", () => ({
  default: ({ selection }: { selection: ParentRunSelection }) => (
    <>
      <button
        onClick={() => {
          selection.selectRun(parent);
          selection.selectRun(otherParent);
          selection.setRunPartIds(20, [201]);
        }}
      >
        Add parents
      </button>
      <RunPartPicker
        run={parent}
        selection={selection}
        isLoadingParts={false}
        experimentalEdit={true}
        onToggleExperimentalEdit={() => {}}
        partGroups={[
          {
            level: 0,
            parts: [
              { id: 101, label: "Part A" },
              { id: 102, label: "Part B" },
            ] as import("@jield/solodb-typescript-core").RunPart[],
          },
        ]}
      />
    </>
  ),
}));
vi.mock("./substrateSelect", () => ({ default: () => null }));

beforeEach(() => {
  vi.clearAllMocks();
  for (const fn of [api.listOrganisationGroups, api.listOrganisationTeams, api.listOrganisationProjects]) {
    fn.mockResolvedValue({ items: [{ id: 1, label: "Option" }] });
  }
  api.createRun.mockResolvedValue({ id: 2086 });
  api.createRunParent.mockResolvedValue({});
  initSolodbComponents({ serverUri: "https://solodb-qutech.docker.localhost" });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  initSolodbComponents({ serverUri: "" });
});

function openWizard() {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={["/default/run/new/wizard.html"]}>
        <Routes>
          <Route path="/:environment/run/new/wizard.html" element={<NewRunWizard />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

it("sums only selected parent splits, preserves details on edit, and redirects to the server after creation", async () => {
  openWizard();
  fireEvent.click(screen.getByText("Add parents"));
  fireEvent.click(screen.getByRole("checkbox", { name: "Select Part A" }));
  fireEvent.change(screen.getByLabelText("Experimental split amount for Part A"), { target: { value: "12" } });
  fireEvent.change(screen.getByLabelText("Experimental split amount for Part B"), { target: { value: "50" } });
  fireEvent.click(screen.getByText("Continue"));
  expect(screen.getByText("13", { selector: "output" })).toBeInTheDocument();
  expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/Run name/), { target: { value: "New run" } });
  fireEvent.change(screen.getByLabelText(/Motivation/), { target: { value: "Research" } });
  await waitFor(() => expect(screen.getAllByRole("option", { name: "Option" })).toHaveLength(3));
  for (const label of [/^Group/, /^Team/, /^Project/])
    fireEvent.change(screen.getByLabelText(label), { target: { value: "1" } });
  fireEvent.click(screen.getByText("Edit parent parts"));
  fireEvent.change(screen.getByLabelText("Experimental split amount for Part A"), { target: { value: "14" } });
  fireEvent.click(screen.getByText("Continue"));
  expect(screen.getByLabelText(/Run name/)).toHaveValue("New run");
  expect(screen.getByText("15", { selector: "output" })).toBeInTheDocument();
  const assign = vi.fn();
  const realWindow = window;
  vi.stubGlobal(
    "window",
    new Proxy(realWindow, { get: (target, prop) => (prop === "location" ? { assign } : Reflect.get(target, prop)) })
  );
  let resolveFirstParent!: (value: object) => void;
  api.createRunParent.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveFirstParent = resolve;
      })
  );
  fireEvent.click(screen.getByText("Create Run"));
  await waitFor(() => expect(api.createRunParent).toHaveBeenCalledTimes(1));
  expect(assign).not.toHaveBeenCalled();
  resolveFirstParent({});
  await waitFor(() =>
    expect(assign).toHaveBeenCalledWith("https://solodb-qutech.docker.localhost/default/run/2086/information.html")
  );
  expect(api.createRun).toHaveBeenCalledTimes(1);
  expect(api.createRun).toHaveBeenCalledWith(expect.objectContaining({ parts: 0 }));
  expect(api.createRunParent).toHaveBeenCalledTimes(2);
  expect(api.createRunParent).toHaveBeenCalledWith(
    expect.objectContaining({ parent_run_id: 20, part_ids: [201], amount_per_part: { 201: 1 } })
  );
  expect(api.createRunParent).toHaveBeenCalledWith(
    expect.objectContaining({ parent_run_id: 10, part_ids: [101], amount_per_part: { 101: 14 } })
  );
});

it("keeps a manual split for a run without selected parent parts", async () => {
  openWizard();
  fireEvent.click(screen.getByText("Continue"));
  expect(screen.getByRole("spinbutton", { name: "Experimental split" })).toHaveValue(1);
  fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "6" } });
  fireEvent.click(screen.getByText("Back"));
  fireEvent.click(screen.getByText("Continue"));
  expect(screen.getByRole("spinbutton")).toHaveValue(6);
  fireEvent.change(screen.getByLabelText(/Run name/), { target: { value: "Standalone run" } });
  fireEvent.change(screen.getByLabelText(/Motivation/), { target: { value: "Research" } });
  await waitFor(() => expect(screen.getAllByRole("option", { name: "Option" })).toHaveLength(3));
  for (const label of [/^Group/, /^Team/, /^Project/])
    fireEvent.change(screen.getByLabelText(label), { target: { value: "1" } });
  const assign = vi.fn();
  const realWindow = window;
  vi.stubGlobal(
    "window",
    new Proxy(realWindow, {
      get: (target, prop) => (prop === "location" ? { assign } : Reflect.get(target, prop)),
    })
  );
  fireEvent.click(screen.getByText("Create Run"));
  await waitFor(() => expect(assign).toHaveBeenCalled());
  expect(api.createRun).toHaveBeenCalledWith(expect.objectContaining({ parts: 6 }));
  expect(api.createRunParent).not.toHaveBeenCalled();
});
