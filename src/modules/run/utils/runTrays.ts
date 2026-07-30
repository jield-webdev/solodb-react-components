import { Run, RunPart, RunStepPart, TrayType } from "@jield/solodb-typescript-core";

export type RunTray = NonNullable<Run["run_trays"]>[number];

// A run tray with extra_tray_id === 0 is a physical tray; > 0 marks the nth "extra tray", a false
// tray where unused parts are parked. The backend creates an extra tray on the first move into it,
// so the next one is rendered client side before it exists and carries this synthetic id.
export const PLACEHOLDER_EXTRA_TRAY_ID = -1;

// --- Tray selection ---

export const getNormalTrays = (run: Run): RunTray[] =>
  (run.run_trays ?? []).filter((tray) => !tray.extra_tray_id).sort((a, b) => a.sequence - b.sequence);

export const getExtraTrays = (run: Run): RunTray[] =>
  (run.run_trays ?? []).filter((tray) => tray.extra_tray_id > 0).sort((a, b) => a.extra_tray_id - b.extra_tray_id);

// Extra trays reuse `sequence` (it mirrors their extra_tray_id), so sorting the raw list by sequence
// interleaves them with the physical trays. Always keep the physical trays first.
export const getOrderedTrays = (run: Run): RunTray[] => [...getNormalTrays(run), ...getExtraTrays(run)];

// --- The not yet created extra tray ---

export const isPlaceholderExtraTray = (tray: RunTray): boolean => tray.id === PLACEHOLDER_EXTRA_TRAY_ID;

export const getNextExtraTrayId = (extraTrays: RunTray[]): number =>
  (extraTrays[extraTrays.length - 1]?.extra_tray_id ?? 0) + 1;

// Mirrors the backend, which shapes a new extra tray from the run tray type.
export const buildPlaceholderExtraTray = (run: Run, extraTrayId: number): RunTray | null => {
  if (!run.tray_type) return null;

  return {
    id: PLACEHOLDER_EXTRA_TRAY_ID,
    name: `Extra Tray ${extraTrayId}`,
    label: "",
    sequence: extraTrayId,
    tray_type: run.tray_type,
    extra_tray_id: extraTrayId,
  };
};

// updateRunStepPartTray always needs a real tray id, even when extra_tray_id targets a tray that does
// not exist yet; the backend ignores tray_id as soon as extra_tray_id is greater than zero.
export const resolveTrayForUpdate = (run: Run, tray: RunTray): RunTray | null => {
  if (!isPlaceholderExtraTray(tray)) return tray;

  return getExtraTrays(run).find((candidate) => candidate.extra_tray_id === tray.extra_tray_id) ?? getNormalTrays(run)[0] ?? null;
};

// --- Grouping parts per tray ---

// A step part overrides the tray the part sits in by default.
export const getTrayIdPerStepPart = (part: RunPart, stepPart: RunStepPart | null | undefined): number => {
  if (!stepPart || !stepPart.tray_id) {
    return part.tray?.id ?? 0;
  }

  return stepPart.tray_id;
};

export const groupPartsByTrayId = (parts: RunPart[], stepParts: RunStepPart[]): Map<number, RunPart[]> => {
  const stepPartsByPartId = new Map(stepParts.map((stepPart) => [stepPart.part_id, stepPart]));

  return parts.reduce<Map<number, RunPart[]>>((acc, part) => {
    if (!part.tray) return acc;

    const trayId = getTrayIdPerStepPart(part, stepPartsByPartId.get(part.id));

    const list = acc.get(trayId) ?? [];
    list.push(part);
    acc.set(trayId, list);
    return acc;
  }, new Map());
};

// --- Slot maths ---

export const getSlotIndex = (trayType: TrayType, row: number | null, column: number | null): number | null => {
  if (!row || !column) return null;
  if (row < 1 || column < 1 || row > trayType.rows || column > trayType.columns) return null;
  if (trayType.orientation === "ttb") {
    return (column - 1) * trayType.rows + (row - 1);
  }
  return (row - 1) * trayType.columns + (column - 1);
};

export const getSlotPosition = (trayType: TrayType, slotIndex: number): { row: number; column: number } => {
  if (trayType.orientation === "ttb") {
    return {
      row: (slotIndex % trayType.rows) + 1,
      column: Math.floor(slotIndex / trayType.rows) + 1,
    };
  }

  return {
    row: Math.floor(slotIndex / trayType.columns) + 1,
    column: (slotIndex % trayType.columns) + 1,
  };
};

export const getForbiddenSlotIndices = (trayType: TrayType): Set<number> =>
  new Set<number>(
    (trayType.forbidden_slots ?? [])
      .map((slot) => getSlotIndex(trayType, slot.y, slot.x))
      .filter((index): index is number => index !== null)
  );

// Lower wins when two step parts claim the same slot: an override that did not fail beats a failed
// override, which in turn beats a part sitting in its default position.
export const getStepPartSlotPriority = (stepPart: RunStepPart | null | undefined): number => {
  if (stepPart?.tray_id != null && !stepPart.failed) {
    return 1;
  }

  if (stepPart?.tray_id != null) {
    return 2;
  }

  return 3;
};

export const buildTraySlots = (
  trayType: TrayType,
  trayParts: RunPart[],
  stepParts: RunStepPart[]
): (RunStepPart | null)[] => {
  const partsById = new Map(trayParts.map((part) => [part.id, part]));
  const slots: (RunStepPart | null)[] = Array.from({ length: trayType.rows * trayType.columns }, () => null);

  stepParts.forEach((stepPart) => {
    const part = partsById.get(stepPart.part_id);
    if (!part) return;
    if (stepPart.has_failed_in_previouse_state) return;

    const slotIndex = getSlotIndex(trayType, stepPart.tray_row ?? part.tray_row, stepPart.tray_column ?? part.tray_column);
    if (slotIndex === null) return;

    const currentStepPart = slots[slotIndex];
    const currentSlotPriority = currentStepPart ? getStepPartSlotPriority(currentStepPart) : null;

    if (currentSlotPriority !== null && currentSlotPriority < getStepPartSlotPriority(stepPart)) return;

    slots[slotIndex] = stepPart;
  });

  return slots;
};

export const isTrayFull = (slots: (RunStepPart | null)[], trayType: TrayType): boolean => {
  const forbiddenSlotIndices = getForbiddenSlotIndices(trayType);

  return slots.every((stepPart, slotIndex) => stepPart !== null || forbiddenSlotIndices.has(slotIndex));
};
