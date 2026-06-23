import { type CSSProperties } from "react";
import { Run, RunPart, RunStepPart, TrayType } from "@jield/solodb-typescript-core";
import { buildDisplaySlotIndexByPartId, buildSplitSlotAssignments } from "../runPartSlotDistribution";
import { MultiPartCell, PartBadge, SlotCell, type RunPartRenderContext } from "./partCell";
import { TrayBulkActions } from "./trayBulkActions";

type RunTray = NonNullable<Run["run_trays"]>[number];

const getSlotIndex = (trayType: TrayType, row: number | null, column: number | null): number | null => {
  if (!row || !column) return null;
  if (row < 1 || column < 1 || row > trayType.rows || column > trayType.columns) return null;
  if (trayType.orientation === "ttb") {
    return (column - 1) * trayType.rows + (row - 1);
  }
  return (row - 1) * trayType.columns + (column - 1);
};

const toTrayStepParts = (trayParts: RunPart[], stepPartsById: Map<number, RunStepPart>): RunStepPart[] =>
  trayParts
    .map((part) => stepPartsById.get(part.id))
    .filter((sp): sp is RunStepPart => sp !== undefined);

const getStepPartSlotPriority = (stepPart: RunStepPart | undefined): number => {
  if (stepPart?.tray_id != null && !stepPart?.failed) {
      return 1;
  }

  if (stepPart?.tray_id != null) {
      return 2;
  }

  return 3;
};

export const TrayGrid = ({
  tray,
  trayParts,
  trayAllParts,
  stepParts,
  isSplitLevel,
  context,
}: {
  tray: RunTray;
  trayParts: RunPart[];
  trayAllParts: RunPart[];
  stepParts: RunStepPart[];
  isSplitLevel: boolean;
  context: RunPartRenderContext;
}) => {
  const { step, stepPartsById } = context;
  const trayType = tray.tray_type;
  const label = tray.name ?? tray.label ?? "";
  const trayStepParts = toTrayStepParts(trayParts, stepPartsById);
  const stepPartByPartId = new Map<number, RunStepPart>();
  stepParts.forEach((stepPart) => {
    if (stepPart.step_id === step.id) {
      stepPartByPartId.set(stepPart.part_id, stepPart);
    }
  });

  if (!trayType?.rows || !trayType?.columns) {
    return (
      <TrayBulkActions label={label} trayStepParts={trayStepParts} runStep={step}>
        <div className="d-flex flex-wrap gap-2">
          {trayParts.map((runPart) => (
            <PartBadge key={runPart.id} runPart={runPart} context={context} />
          ))}
        </div>
      </TrayBulkActions>
    );
  }

  const trayCapacity = trayType.rows * trayType.columns;
  const forbiddenSlotIndices = new Set<number>(
    (trayType.forbidden_slots ?? [])
      .map((slot) => getSlotIndex(trayType, slot.y, slot.x))
      .filter((index): index is number => index !== null)
  );
  const trayOrientation = trayType.orientation === "ttb" ? "ttb" : "ltr";
  const trayStyle: CSSProperties = {
    "--tray-columns": trayType.columns,
    "--tray-rows": trayType.rows,
  } as CSSProperties;
  const displaySlotIndexByPartId = buildDisplaySlotIndexByPartId({
    parts: trayAllParts,
    slotCount: trayCapacity,
    getOverrideSlotIndex: (runPart) => {
      const stepPart = stepPartByPartId.get(runPart.id);
      if (!stepPart || (stepPart.tray_row == null && stepPart.tray_column == null)) return null;
      return getSlotIndex(
        trayType,
        stepPart.tray_row ?? runPart.tray_row,
        stepPart.tray_column ?? runPart.tray_column
      );
    },
    getDirectSlotIndex: (runPart) => getSlotIndex(trayType, runPart.tray_row, runPart.tray_column),
  });
  const slots = isSplitLevel
    ? buildSplitSlotAssignments({
        parts: trayParts,
        slotCount: trayCapacity,
        getSlotIndex: (runPart) => displaySlotIndexByPartId.get(runPart.id) ?? null,
      })
    : Array.from({ length: trayCapacity }, () => [] as RunPart[]);

  if (!isSplitLevel) {
    trayParts.forEach((runPart) => {
      const stepPart = stepPartByPartId.get(runPart.id);
      const slotIndex = getSlotIndex(
        trayType,
        stepPart?.tray_row ?? runPart.tray_row,
        stepPart?.tray_column ?? runPart.tray_column
      );
      if (slotIndex === null) return;

      const slotPriority = getStepPartSlotPriority(stepPart);
      const currentRunPart = slots[slotIndex][0];
      const currentSlotPriority = currentRunPart
        ? getStepPartSlotPriority(stepPartByPartId.get(currentRunPart.id))
        : null;

      if (currentSlotPriority !== null && currentSlotPriority < slotPriority) return;

      slots[slotIndex] = [runPart];
    });
  }

  return (
    <TrayBulkActions label={label} trayStepParts={trayStepParts} runStep={step}>
      <div className="tray-grid" data-orientation={trayOrientation} style={trayStyle}>
        {slots.map((runParts, slotIndex) =>
          forbiddenSlotIndices.has(slotIndex) ? (
            // forbidden position: keep the grid cell empty (nothing rendered)
            <div key={`slot-${tray.id}-${slotIndex}`} aria-hidden="true" />
          ) : isSplitLevel ? (
            <MultiPartCell key={`slot-${tray.id}-${slotIndex}`} runParts={runParts} context={context} />
          ) : (
            <SlotCell key={`slot-${tray.id}-${slotIndex}`} runPart={runParts[0] ?? null} context={context} />
          )
        )}
      </div>
    </TrayBulkActions>
  );
};
