import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { Run, TrayType } from "@jield/solodb-typescript-core";
import { getRunQueryKey, upsertRunTrayCache } from "./runCache";
import type { RunTray } from "./runTrays";

const makeTray = (overrides: Partial<RunTray>): RunTray =>
  ({
    id: 1,
    name: "Tray 1",
    label: "",
    sequence: 1,
    tray_type: { id: 1, rows: 2, columns: 2 } as TrayType,
    extra_tray_id: 0,
    ...overrides,
  }) as RunTray;

const makeRun = (runTrays: RunTray[]): Run =>
  ({
    id: 10,
    run_trays: runTrays,
  }) as Run;

describe("upsertRunTrayCache", () => {
  it("appends a tray that is not in the cached run", () => {
    const queryClient = new QueryClient();
    const physicalTray = makeTray({});
    const extraTray = makeTray({ id: 20, name: "Extra Tray 1", extra_tray_id: 1 });
    queryClient.setQueryData(getRunQueryKey(10), makeRun([physicalTray]));

    upsertRunTrayCache(queryClient, 10, extraTray);

    expect(queryClient.getQueryData<Run>(getRunQueryKey(10))?.run_trays).toEqual([physicalTray, extraTray]);
  });

  it("replaces an existing tray with the same extra tray id", () => {
    const queryClient = new QueryClient();
    const staleExtraTray = makeTray({ id: -1, name: "Extra Tray 1", extra_tray_id: 1 });
    const persistedExtraTray = makeTray({ id: 20, name: "Extra Tray 1", extra_tray_id: 1 });
    queryClient.setQueryData(getRunQueryKey(10), makeRun([staleExtraTray]));

    upsertRunTrayCache(queryClient, 10, persistedExtraTray);

    expect(queryClient.getQueryData<Run>(getRunQueryKey(10))?.run_trays).toEqual([persistedExtraTray]);
  });

  it("replaces a tray matched by its own id without duplicating it", () => {
    const queryClient = new QueryClient();
    const physicalTray = makeTray({});
    const renamedTray = makeTray({ label: "Renamed" });
    queryClient.setQueryData(getRunQueryKey(10), makeRun([physicalTray]));

    upsertRunTrayCache(queryClient, 10, renamedTray);

    expect(queryClient.getQueryData<Run>(getRunQueryKey(10))?.run_trays).toEqual([renamedTray]);
  });

  it("does not match unrelated trays on extra_tray_id 0", () => {
    const queryClient = new QueryClient();
    const firstPhysicalTray = makeTray({ id: 1 });
    const secondPhysicalTray = makeTray({ id: 2, name: "Tray 2" });
    queryClient.setQueryData(getRunQueryKey(10), makeRun([firstPhysicalTray]));

    upsertRunTrayCache(queryClient, 10, secondPhysicalTray);

    expect(queryClient.getQueryData<Run>(getRunQueryKey(10))?.run_trays).toEqual([
      firstPhysicalTray,
      secondPhysicalTray,
    ]);
  });

  it("treats a run without run_trays as empty", () => {
    const queryClient = new QueryClient();
    const extraTray = makeTray({ id: 20, extra_tray_id: 1 });
    queryClient.setQueryData(getRunQueryKey(10), { id: 10 } as Run);

    upsertRunTrayCache(queryClient, 10, extraTray);

    expect(queryClient.getQueryData<Run>(getRunQueryKey(10))?.run_trays).toEqual([extraTray]);
  });

  it("leaves other runs in the cache untouched", () => {
    const queryClient = new QueryClient();
    const otherRun = makeRun([makeTray({ id: 99 })]);
    queryClient.setQueryData(getRunQueryKey(10), makeRun([]));
    queryClient.setQueryData(getRunQueryKey(11), otherRun);

    upsertRunTrayCache(queryClient, 10, makeTray({ id: 20, extra_tray_id: 1 }));

    expect(queryClient.getQueryData<Run>(getRunQueryKey(11))).toBe(otherRun);
  });

  it("ignores runs that are not cached", () => {
    const queryClient = new QueryClient();

    upsertRunTrayCache(queryClient, 10, makeTray({}));

    expect(queryClient.getQueryData<Run>(getRunQueryKey(10))).toBeUndefined();
  });
});
