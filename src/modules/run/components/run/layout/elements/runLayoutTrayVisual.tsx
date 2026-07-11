import { useMemo, type CSSProperties, type DragEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Run, RunPart, RunStep, RunStepPart, TrayType, updateRunStepPartTray } from "@jield/solodb-typescript-core";
import { upsertRunStepPartCache } from "@jield/solodb-react-components/modules/run/utils/runStepPartCache";
import { notification } from "@jield/solodb-react-components/utils/notification";

type RunTray = NonNullable<Run["run_trays"]>[number];

const handlePartDragStart = (event: DragEvent<HTMLSpanElement>, stepPart: RunStepPart) => {
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", String(stepPart.id));
};

const handleSlotDragOver = (event: DragEvent<HTMLDivElement>) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
};

export default function RunLayoutTrayVisual({
  step,
  tray,
  parts,
  stepParts,
}: {
  step: RunStep;
  tray: RunTray;
  parts: RunPart[];
  stepParts: RunStepPart[];
}) {
  const queryClient = useQueryClient();
  const trayType = tray.tray_type;
  const trayLabel = tray.label ? `${tray.name} - ${tray.label}` : tray.name;
  const partsById = useMemo(() => new Map(parts.map((part) => [part.id, part])), [parts]);
  const stepPartsById = useMemo(() => new Map(stepParts.map((stepPart) => [stepPart.id, stepPart])), [stepParts]);

  const handleSlotDrop = async (event: DragEvent<HTMLDivElement>, tray: RunTray, row: number, column: number) => {
    event.preventDefault();
    const stepPartId = Number(event.dataTransfer.getData("text/plain"));
    const stepPart = stepPartsById.get(stepPartId);

    if (!stepPart) {
      console.error("Unable to update run step part tray: stepPart not found");
      return;
    }

    if (trayType && (trayType.forbidden_slots ?? []).some((slot) => slot.x === column && slot.y === row)) {
      // forbidden slots cannot hold a part
      return;
    }

    const part = partsById.get(stepPart.part_id);
    if (
      (stepPart.tray_id ?? part?.tray?.id) === tray.id &&
      (stepPart.tray_column ?? part?.tray_column) === column &&
      (stepPart.tray_row ?? part?.tray_row) === row
    ) {
      // prevent changing to the same spot
      return;
    }

    const existingStepPartInSlot = stepParts.find(
      (candidate) =>
        candidate.id !== stepPart.id &&
        candidate.step_id === step.id &&
        candidate.tray_id === tray.id &&
        candidate.tray_row === row &&
        candidate.tray_column === column &&
        !(candidate.has_failed_in_previouse_state || candidate.failed)
    );

    if (existingStepPartInSlot) {
      notification({
        notificationHeader: "Tray part change",
        notificationBody: "Two PartTrays can not be in the same tray position",
        notificationType: "danger",
      });
      return;
    }

    const expectedStepPart: RunStepPart = {
      ...stepPart,
      tray_id: tray.id,
      tray_row: row,
      tray_column: column,
    };

    upsertRunStepPartCache(queryClient, step, expectedStepPart);

    try {
      const response = await updateRunStepPartTray(stepPart, tray, row, column, true);
      upsertRunStepPartCache(queryClient, step, response.data, { updateSubsequent: true });
      notification({
        notificationHeader: "Tray part change",
        notificationBody: "Part moved successfully",
        notificationType: "success",
      });
    } catch (error) {
      upsertRunStepPartCache(queryClient, step, stepPart);
      notification({
        notificationHeader: "Tray part change",
        notificationBody: getTrayUpdateErrorMessage(error),
        notificationType: "danger",
      });
    }
  };

  if (!trayType?.rows || !trayType?.columns) {
    return (
      <section className="tray-visual my-2" aria-label={tray.name}>
        TODO HANDLE CASE WHERE TRAY TYPE IS WRONG
      </section>
    );
  }

  const trayCapacity = trayType.rows * trayType.columns;
  const trayStyle: CSSProperties = {
    "--tray-rows": trayType.rows,
    "--tray-columns": trayType.columns,
  } as CSSProperties;
  const forbiddenSlotIndices = new Set<number>(
    (trayType.forbidden_slots ?? [])
      .map((slot) => getSlotIndex(trayType, slot.y, slot.x))
      .filter((index): index is number => index !== null)
  );
  const slots: (RunStepPart | null)[] = Array.from({ length: trayCapacity }, () => null);

  stepParts.forEach((stepPart) => {
    const part = partsById.get(stepPart.part_id);
    if (!part) return;

    const slotIndex = getSlotIndex(
      trayType,
      stepPart.tray_row ?? part.tray_row,
      stepPart.tray_column ?? part.tray_column
    );

    if (slotIndex === null) {
      console.log(stepPart);
      return;
    }

    if (stepPart.has_failed_in_previouse_state) return;

    const slotPriority = getStepPartSlotPriority(stepPart);

    const currentStepPart = slots[slotIndex];
    const currentSlotPriority = currentStepPart ? getStepPartSlotPriority(currentStepPart) : null;

    if (currentSlotPriority !== null && currentSlotPriority < slotPriority) return;

    slots[slotIndex] = stepPart;
  });

  return (
    <section className="tray-visual my-2" style={trayStyle} aria-label={tray.name}>
      <h4 className="h6 mb-2">{trayLabel}</h4>
      <div className="tray-visual__frame">
        <div className="tray-visual__grid" data-orientation={trayType.orientation === "ttb" ? "ttb" : "ltr"}>
          {slots.map((stepPart, slotIndex) => {
            const pocketNumber = slotIndex + 1;
            const { row, column } = getSlotPosition(trayType, slotIndex);
            const part = stepPart ? partsById.get(stepPart.part_id) : null;
            const partBadgeColor = getPartBadgeColor(stepPart);
            const partBadgeTooltip = getPartBadgeTooltip(stepPart);

            if (forbiddenSlotIndices.has(slotIndex)) {
              // forbidden position: keep the grid cell empty (no slot box, not droppable)
              return <div key={`${tray.id}-${pocketNumber}`} className="tray-visual__pocket" aria-hidden="true" />;
            }

            return (
              <div key={`${tray.id}-${pocketNumber}`} className="tray-visual__pocket">
                <div
                  className="tray-visual__slot"
                  data-tray-id={tray.id}
                  data-tray-row={row}
                  data-tray-column={column}
                  data-pocket-number={pocketNumber}
                  onDragOver={handleSlotDragOver}
                  onDrop={(event) => handleSlotDrop(event, tray, row, column)}
                >
                  {part && stepPart ? (
                    <OverlayTrigger
                      key={stepPart.id}
                      placement="top"
                      overlay={<Tooltip id={`tooltip-tray-slot-part-${stepPart.id}`}>{partBadgeTooltip}</Tooltip>}
                    >
                      <span
                        className={`tray-visual__part badge ${partBadgeColor} badge-level-${part.part_level}`}
                        data-part-id={part.id}
                        data-step-part-id={stepPart.id}
                        draggable
                        onDragStart={(event) => handlePartDragStart(event, stepPart)}
                      >
                        {part.scanner_label}
                      </span>
                    </OverlayTrigger>
                  ) : (
                    <span className="tray-visual__index">{pocketNumber}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const getSlotIndex = (trayType: TrayType, row: number | null, column: number | null): number | null => {
  if (!row || !column) return null;
  if (row < 1 || column < 1 || row > trayType.rows || column > trayType.columns) return null;
  if (trayType.orientation === "ttb") {
    return (column - 1) * trayType.rows + (row - 1);
  }
  return (row - 1) * trayType.columns + (column - 1);
};

const getSlotPosition = (trayType: TrayType, slotIndex: number) => {
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

const getTrayUpdateErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { detail?: unknown; message?: unknown } } }).response;

    if (typeof response?.data?.detail === "string" && response.data.detail !== "") {
      return response.data.detail;
    }

    if (typeof response?.data?.message === "string" && response.data.message !== "") {
      return response.data.message;
    }
  }

  if (error instanceof Error && error.message !== "") {
    return error.message;
  }

  return "Could not move part.";
};

const getStepPartSlotPriority = (stepPart: RunStepPart): number => {
  if (stepPart.tray_id != null && !stepPart.failed) {
    return 1;
  }

  if (stepPart.tray_id != null) {
    return 2;
  }

  return 3;
};

const getPartBadgeColor = (stepPart: RunStepPart | null): string => {
  if (stepPart?.failed) return "bg-danger";

  return stepPart?.tray_id ? "bg-primary" : "bg-grey";
};

const getPartBadgeTooltip = (stepPart: RunStepPart | null): string => {
  if (stepPart?.failed) return "Part failed";

  if (stepPart == null) {
    return "In default postion";
  }

  return stepPart.tray_id != undefined ? "Not in default postion" : "In default position";
};
