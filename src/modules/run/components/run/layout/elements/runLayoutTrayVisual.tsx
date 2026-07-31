import { useContext, useMemo, type CSSProperties, type DragEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { RunPart, RunStep, RunStepPart, updateRunStepPartTray } from "@jield/solodb-typescript-core";
import { RunContext } from "@jield/solodb-react-components/modules/run/contexts/runContext";
import { upsertRunTrayCache } from "@jield/solodb-react-components/modules/run/utils/runCache";
import { upsertRunStepPartCache } from "@jield/solodb-react-components/modules/run/utils/runStepPartCache";
import {
  buildTraySlots,
  getForbiddenSlotIndices,
  getSlotPosition,
  isPlaceholderExtraTray,
  resolveTrayForUpdate,
  type RunTray,
} from "@jield/solodb-react-components/modules/run/utils/runTrays";
import { notification } from "@jield/solodb-react-components/utils/notification";

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
  const { run, reloadRun } = useContext(RunContext);
  const trayType = tray.tray_type;
  const trayLabel = tray.label ? `${tray.name} - ${tray.label}` : tray.name;
  const isExtraTray = tray.extra_tray_id > 0;
  const partsById = useMemo(() => new Map(parts.map((part) => [part.id, part])), [parts]);
  const stepPartsById = useMemo(() => new Map(stepParts.map((stepPart) => [stepPart.id, stepPart])), [stepParts]);

  const handleSlotDrop = async (event: DragEvent<HTMLDivElement>, row: number, column: number) => {
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

    const existingStepPartInSlot = stepParts.find((candidate) => {
      if (
        candidate.id === stepPart.id ||
        candidate.step_id !== step.id ||
        candidate.has_failed_in_previouse_state
      ) {
        return false;
      }

      const candidatePart = partsById.get(candidate.part_id);

      return (
        (candidate.tray_id ?? candidatePart?.tray?.id) === tray.id &&
        (candidate.tray_row ?? candidatePart?.tray_row) === row &&
        (candidate.tray_column ?? candidatePart?.tray_column) === column
      );
    });

    if (existingStepPartInSlot) {
      notification({
        notificationHeader: "Tray part change",
        notificationBody: "This position is occupied by a part that has not failed in this or a previous step.",
        notificationType: "danger",
      });
      return;
    }

    // An extra tray that does not exist yet still needs a real tray id in the request; the backend
    // resolves and creates the extra tray from extra_tray_id and ignores the tray id in that case.
    const targetTray = resolveTrayForUpdate(run, tray);

    if (!targetTray) {
      notification({
        notificationHeader: "Tray part change",
        notificationBody: "This run has no tray to move the part to.",
        notificationType: "danger",
      });
      return;
    }

    const isNewExtraTray = isPlaceholderExtraTray(tray);

    const expectedStepPart: RunStepPart = {
      ...stepPart,
      tray_id: tray.id,
      tray_row: row,
      tray_column: column,
    };

    upsertRunStepPartCache(queryClient, step, expectedStepPart);

    try {
      const response = await updateRunStepPartTray(
        stepPart,
        targetTray,
        row,
        column,
        true,
        isExtraTray ? tray.extra_tray_id : undefined
      );

      if (isNewExtraTray) {
        if (response.data.tray_id) {
          // The backend just created the extra tray; adopt its real id so the placeholder stops being
          // rendered and the moved part is grouped under a tray that exists.
          upsertRunTrayCache(queryClient, run.id, { ...tray, id: response.data.tray_id });
        } else {
          // Without a tray id there is nothing to patch into run.run_trays, and the step part below
          // would point at a tray the run does not know about. Refetch the run instead of losing it.
          reloadRun();
        }
      }

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

  const trayStyle: CSSProperties = {
    "--tray-rows": trayType.rows,
    "--tray-columns": trayType.columns,
  } as CSSProperties;
  const forbiddenSlotIndices = getForbiddenSlotIndices(trayType);
  const slots = buildTraySlots(trayType, parts, stepParts);

  return (
    <section
      className={`tray-visual my-2${isExtraTray ? " tray-visual--extra" : ""}`}
      style={trayStyle}
      aria-label={tray.name}
      data-extra-tray-id={isExtraTray ? tray.extra_tray_id : undefined}
    >
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
                  onDrop={(event) => handleSlotDrop(event, row, column)}
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
