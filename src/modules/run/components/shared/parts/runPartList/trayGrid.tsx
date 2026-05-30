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

export const TrayGrid = ({
  tray,
  trayParts,
  trayAllParts,
  isSplitLevel,
  context,
}: {
  tray: RunTray;
  trayParts: RunPart[];
  trayAllParts: RunPart[];
  isSplitLevel: boolean;
  context: RunPartRenderContext;
}) => {
  const { step, stepPartsById } = context;
  const trayType = tray.tray_type;
  const label = tray.name ?? tray.label ?? "";
  const trayStepParts = toTrayStepParts(trayParts, stepPartsById);

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
  const trayOrientation = trayType.orientation === "ttb" ? "ttb" : "ltr";
  const trayStyle: CSSProperties = {
    "--tray-columns": trayType.columns,
    "--tray-rows": trayType.rows,
  } as CSSProperties;
  const displaySlotIndexByPartId = buildDisplaySlotIndexByPartId({
    parts: trayAllParts,
    slotCount: trayCapacity,
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
      const slotIndex = getSlotIndex(trayType, runPart.tray_row, runPart.tray_column);
      if (slotIndex === null) return;
      if (!slots[slotIndex].length) {
        slots[slotIndex].push(runPart);
      }
    });
  }

  return (
    <TrayBulkActions label={label} trayStepParts={trayStepParts} runStep={step}>
      <div className="tray-grid" data-orientation={trayOrientation} style={trayStyle}>
        {slots.map((runParts, slotIndex) =>
          isSplitLevel ? (
            <MultiPartCell key={`slot-${tray.id}-${slotIndex}`} runParts={runParts} context={context} />
          ) : (
            <SlotCell key={`slot-${tray.id}-${slotIndex}`} runPart={runParts[0] ?? null} context={context} />
          )
        )}
      </div>
    </TrayBulkActions>
  );
};
