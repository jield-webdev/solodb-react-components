import { describe, expect, it } from "vitest";
import { Run, RunPart, RunStepPart, TrayType } from "@jield/solodb-typescript-core";
import {
  buildPlaceholderExtraTray,
  buildTraySlots,
  getExtraTrays,
  getNextExtraTrayId,
  getNormalTrays,
  getOrderedTrays,
  isPlaceholderExtraTray,
  isTrayFull,
  PLACEHOLDER_EXTRA_TRAY_ID,
  resolveTrayForUpdate,
  type RunTray,
} from "./runTrays";

const makeTrayType = (overrides: Partial<TrayType> = {}): TrayType =>
  ({
    id: 1,
    type: "2x2",
    description: "",
    rows: 2,
    columns: 2,
    orientation: "ltr",
    forbidden_slots: [],
    ...overrides,
  }) as TrayType;

const makeTray = (overrides: Partial<RunTray>): RunTray =>
  ({
    id: 0,
    name: "",
    label: "",
    sequence: 0,
    tray_type: makeTrayType(),
    extra_tray_id: 0,
    ...overrides,
  }) as RunTray;

const makeRun = (overrides: Partial<Run> = {}): Run =>
  ({
    id: 1,
    tray_type: makeTrayType(),
    run_trays: [],
    ...overrides,
  }) as Run;

const makePart = (overrides: Partial<RunPart>): RunPart =>
  ({
    id: 0,
    part_level: 0,
    left: 0,
    tray: null,
    tray_row: null,
    tray_column: null,
    ...overrides,
  }) as RunPart;

const makeStepPart = (overrides: Partial<RunStepPart>): RunStepPart =>
  ({
    id: 0,
    step_id: 1,
    part_id: 0,
    tray_id: null,
    tray_row: null,
    tray_column: null,
    date_created: "",
    status: { key: "", text: "", class: "" },
    comment: null,
    processed: false,
    failed: false,
    started: false,
    has_failed_in_previouse_state: false,
    available_actions: [],
    ...overrides,
  }) as RunStepPart;

// Extra trays reuse `sequence` (it mirrors extra_tray_id), so both kinds collide on it.
const runWithCollidingSequences = makeRun({
  run_trays: [
    makeTray({ id: 20, name: "Extra Tray 2", label: "E2", sequence: 2, extra_tray_id: 2 }),
    makeTray({ id: 2, name: "Tray B", sequence: 2 }),
    makeTray({ id: 10, name: "Extra Tray 1", label: "E1", sequence: 1, extra_tray_id: 1 }),
    makeTray({ id: 1, name: "Tray A", sequence: 1 }),
  ],
});

describe("tray selection", () => {
  it("keeps only the physical trays in sequence order", () => {
    expect(getNormalTrays(runWithCollidingSequences).map((tray) => tray.id)).toEqual([1, 2]);
  });

  it("keeps only the extra trays in extra tray order", () => {
    expect(getExtraTrays(runWithCollidingSequences).map((tray) => tray.id)).toEqual([10, 20]);
  });

  it("puts the extra trays behind the physical ones despite the colliding sequence", () => {
    expect(getOrderedTrays(runWithCollidingSequences).map((tray) => tray.id)).toEqual([1, 2, 10, 20]);
  });

  it("returns empty lists when the run has no trays", () => {
    expect(getOrderedTrays(makeRun())).toEqual([]);
  });
});

describe("buildPlaceholderExtraTray", () => {
  it("numbers the first extra tray 1 when none exist yet", () => {
    const run = makeRun({ run_trays: [makeTray({ id: 1, name: "Tray A", sequence: 1 })] });
    const placeholder = buildPlaceholderExtraTray(run, getNextExtraTrayId(getExtraTrays(run)));

    expect(placeholder).toMatchObject({
      id: PLACEHOLDER_EXTRA_TRAY_ID,
      name: "Extra Tray 1",
      label: "",
      extra_tray_id: 1,
      tray_type: run.tray_type,
    });
    expect(isPlaceholderExtraTray(placeholder!)).toBe(true);
  });

  it("numbers the next extra tray after the highest existing one", () => {
    const extraTrays = getExtraTrays(runWithCollidingSequences);

    expect(getNextExtraTrayId(extraTrays)).toBe(3);
    expect(buildPlaceholderExtraTray(runWithCollidingSequences, 3)?.name).toBe("Extra Tray 3");
  });

  it("offers no placeholder when the run has no tray type to shape it with", () => {
    expect(buildPlaceholderExtraTray(makeRun({ tray_type: undefined }), 1)).toBeNull();
  });
});

describe("resolveTrayForUpdate", () => {
  it("returns the tray itself when it already exists", () => {
    const tray = makeTray({ id: 10, extra_tray_id: 1 });

    expect(resolveTrayForUpdate(runWithCollidingSequences, tray)).toBe(tray);
  });

  it("returns the existing extra tray carrying the same extra tray id", () => {
    const placeholder = buildPlaceholderExtraTray(runWithCollidingSequences, 2)!;

    expect(resolveTrayForUpdate(runWithCollidingSequences, placeholder)?.id).toBe(20);
  });

  it("falls back to the first physical tray when the extra tray does not exist yet", () => {
    const placeholder = buildPlaceholderExtraTray(runWithCollidingSequences, 3)!;

    expect(resolveTrayForUpdate(runWithCollidingSequences, placeholder)?.id).toBe(1);
  });

  it("returns null when the run has no tray to address at all", () => {
    const run = makeRun();
    const placeholder = buildPlaceholderExtraTray(run, 1)!;

    expect(resolveTrayForUpdate(run, placeholder)).toBeNull();
  });
});

describe("buildTraySlots / isTrayFull", () => {
  const trayType = makeTrayType();
  const positions = [
    { tray_row: 1, tray_column: 1 },
    { tray_row: 1, tray_column: 2 },
    { tray_row: 2, tray_column: 1 },
    { tray_row: 2, tray_column: 2 },
  ];
  const parts = positions.map((position, index) => makePart({ id: index + 1, ...position }));
  const stepParts = parts.map((part) => makeStepPart({ id: part.id, part_id: part.id }));

  it("places every part in its own slot", () => {
    const slots = buildTraySlots(trayType, parts, stepParts);

    expect(slots.map((stepPart) => stepPart?.id ?? null)).toEqual([1, 2, 3, 4]);
    expect(isTrayFull(slots, trayType)).toBe(true);
  });

  it("ignores step parts that failed in a previous step", () => {
    const slots = buildTraySlots(
      trayType,
      parts,
      stepParts.map((stepPart) => (stepPart.id === 4 ? { ...stepPart, has_failed_in_previouse_state: true } : stepPart))
    );

    expect(slots[3]).toBeNull();
    expect(isTrayFull(slots, trayType)).toBe(false);
  });

  it("ignores parts that belong to another tray", () => {
    const slots = buildTraySlots(trayType, parts.slice(0, 2), stepParts);

    expect(slots.map((stepPart) => stepPart?.id ?? null)).toEqual([1, 2, null, null]);
  });

  it("lets a tray override win over a part sitting in its default position", () => {
    const overridden = makeStepPart({ id: 5, part_id: 4, tray_id: 1, tray_row: 1, tray_column: 1 });
    const slots = buildTraySlots(trayType, parts, [...stepParts, overridden]);

    expect(slots[0]?.id).toBe(5);
  });

  it("counts a tray as full when the only free slots are forbidden", () => {
    const withForbidden = makeTrayType({ forbidden_slots: [{ x: 2, y: 2 }] });
    const slots = buildTraySlots(withForbidden, parts.slice(0, 3), stepParts);

    expect(slots[3]).toBeNull();
    expect(isTrayFull(slots, withForbidden)).toBe(true);
  });
});
