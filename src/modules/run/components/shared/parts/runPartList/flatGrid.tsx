import { type CSSProperties } from "react";
import { RunPart } from "@jield/solodb-typescript-core";
import { buildDisplaySlotIndexByPartId, buildSplitSlotAssignments } from "../runPartSlotDistribution";
import { MultiPartCell, SlotCell, type RunPartRenderContext } from "./partCell";

const COLUMNS_PER_ROW = 12;

/**
 * Renders parts that are not assigned to any tray as a simple wrapping grid.
 * Used when the run has no trays.
 */
export const FlatGrid = ({
  leveledParts,
  allNonTrayParts,
  isSplitLevel,
  context,
}: {
  leveledParts: RunPart[];
  allNonTrayParts: RunPart[];
  isSplitLevel: boolean;
  context: RunPartRenderContext;
}) => {
  const displaySlotIndexByPartId = buildDisplaySlotIndexByPartId({
    parts: allNonTrayParts,
    getDirectSlotIndex: (runPart) => (runPart.left >= 1 ? runPart.left - 1 : null),
  });
  const maxSlotIndex = isSplitLevel
    ? leveledParts.reduce(
        (maxValue, runPart) => Math.max(maxValue, (displaySlotIndexByPartId.get(runPart.id) ?? -1) + 1),
        0
      )
    : Math.max(
        leveledParts.length,
        leveledParts.reduce((maxValue, runPart) => Math.max(maxValue, runPart.left ?? 0), 0)
      );
  const totalRows = Math.max(1, Math.ceil(maxSlotIndex / COLUMNS_PER_ROW));
  const totalColumns = COLUMNS_PER_ROW;
  const trayStyle: CSSProperties = {
    "--tray-columns": totalColumns,
    "--tray-rows": totalRows,
  } as CSSProperties;
  const slots = isSplitLevel
    ? buildSplitSlotAssignments({
        parts: leveledParts,
        slotCount: totalRows * totalColumns,
        getSlotIndex: (runPart) => displaySlotIndexByPartId.get(runPart.id) ?? null,
      })
    : Array.from({ length: totalRows * totalColumns }, () => [] as RunPart[]);

  if (!isSplitLevel) {
    const unassigned: RunPart[] = [];

    leveledParts.forEach((runPart) => {
      const column = runPart.left;
      const slotIndex = column >= 1 && column <= slots.length ? column - 1 : null;
      if (slotIndex !== null && !slots[slotIndex].length) {
        slots[slotIndex].push(runPart);
        return;
      }
      unassigned.push(runPart);
    });

    unassigned.forEach((runPart) => {
      const nextIndex = slots.findIndex((slot) => slot.length === 0);
      if (nextIndex !== -1) {
        slots[nextIndex].push(runPart);
      }
    });
  }

  return (
    <div className="tray-grid" data-orientation="ltr" style={trayStyle}>
      {slots.map((runParts, slotIndex) =>
        isSplitLevel ? (
          <MultiPartCell key={`slot-no-tray-${slotIndex}`} runParts={runParts} context={context} />
        ) : (
          <SlotCell key={`slot-no-tray-${slotIndex}`} runPart={runParts[0] ?? null} context={context} />
        )
      )}
    </div>
  );
};
