import { type CSSProperties, type DragEvent } from "react";
import { Run, RunPart, RunStep, RunStepPart, TrayType, updateRunStepPartTray } from "@jield/solodb-typescript-core";
import { RunPartList } from "@jield/solodb-react-components/modules/run/components/shared/parts/runPartList";

type RunTray = NonNullable<Run["run_trays"]>[number];

const getTrayIdForPart = (part: RunPart, stepPart: RunStepPart | undefined): number => {
  return stepPart?.tray_id ?? part.tray?.id ?? 0;
};

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

const groupPartsByTrayId = (parts: RunPart[], stepPartsByPartId: Map<number, RunStepPart>) => {
  return parts.reduce<Map<number, RunPart[]>>((acc, part) => {
    if (!part.tray) return acc;

    const trayId = getTrayIdForPart(part, stepPartsByPartId.get(part.id));
    const trayParts = acc.get(trayId) ?? [];
    trayParts.push(part);
    acc.set(trayId, trayParts);
    return acc;
  }, new Map());
};

const handlePartDragStart = (event: DragEvent<HTMLSpanElement>, part: RunPart) => {
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", String(part.id));
};

const handleSlotDragOver = (event: DragEvent<HTMLDivElement>) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
};

const handleSlotDrop = async (
  event: DragEvent<HTMLDivElement>,
  tray: RunTray,
  row: number,
  column: number,
  stepPartsByPartId: Map<number, RunStepPart>
) => {
  event.preventDefault();
  const partId = Number(event.dataTransfer.getData("text/plain"));
  const stepPart = stepPartsByPartId.get(partId);
  const values = {
    tray_id: tray.id,
    tray_row: row,
    tray_column: column,
  };

  if (!stepPart) {
    console.error("Unable to update run step part tray: stepPart not found", values);
    return;
  }

  await updateRunStepPartTray(stepPart, tray, row, column);
};

const RunLayoutTrayVisual = ({
  tray,
  parts,
  stepPartsByPartId,
}: {
  tray: RunTray;
  parts: RunPart[];
  stepPartsByPartId: Map<number, RunStepPart>;
}) => {
  const trayType = tray.tray_type;
  const trayLabel = tray.label ? `${tray.name} - ${tray.label}` : tray.name;

  if (!trayType?.rows || !trayType?.columns) {
    return (
      <section className="tray-visual my-2" aria-label={tray.name}>
        <h4 className="h6 mb-2">{trayLabel}</h4>
        <div className="d-flex flex-wrap gap-2">
          {parts.map((part) => (
            <span
              key={part.id}
              className={`tray-visual__part badge bg-primary badge-level-${part.part_level}`}
              draggable
              onDragStart={(event) => handlePartDragStart(event, part)}
            >
              {part.scanner_label}
            </span>
          ))}
        </div>
      </section>
    );
  }

  const trayCapacity = trayType.rows * trayType.columns;
  const trayStyle: CSSProperties = {
    "--tray-rows": trayType.rows,
    "--tray-columns": trayType.columns,
  } as CSSProperties;
  const slots = Array.from({ length: trayCapacity }, () => [] as RunPart[]);

  parts.forEach((part) => {
    const stepPart = stepPartsByPartId.get(part.id);
    const slotIndex = getSlotIndex(
      trayType,
      stepPart?.tray_row ?? part.tray_row,
      stepPart?.tray_column ?? part.tray_column
    );

    if (slotIndex === null) return;
    slots[slotIndex].push(part);
  });

  return (
    <section className="tray-visual my-2" style={trayStyle} aria-label={tray.name}>
      <h4 className="h6 mb-2">{trayLabel}</h4>
      <div className="tray-visual__frame">
        <div className="tray-visual__grid" data-orientation={trayType.orientation === "ttb" ? "ttb" : "ltr"}>
          {slots.map((slotParts, slotIndex) => {
            const pocketNumber = slotIndex + 1;
            const { row, column } = getSlotPosition(trayType, slotIndex);

            return (
              <div key={`${tray.id}-${pocketNumber}`} className="tray-visual__pocket">
                <div
                  className="tray-visual__slot"
                  data-tray-id={tray.id}
                  data-tray-row={row}
                  data-tray-column={column}
                  data-pocket-number={pocketNumber}
                  onDragOver={handleSlotDragOver}
                  onDrop={(event) => handleSlotDrop(event, tray, row, column, stepPartsByPartId)}
                >
                  {slotParts.length ? (
                    slotParts.map((part) => (
                      <span
                        key={part.id}
                        className={`tray-visual__part badge bg-primary badge-level-${part.part_level}`}
                        data-part-id={part.id}
                        draggable
                        onDragStart={(event) => handlePartDragStart(event, part)}
                      >
                        {part.scanner_label}
                      </span>
                    ))
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
};

export const RunLayoutPartList = ({
  step,
  parts,
  stepParts,
  run,
}: {
  step: RunStep;
  parts: RunPart[];
  stepParts: RunStepPart[];
  run: Run;
}) => {
  const trays = [...(run.run_trays ?? [])].sort((a, b) => a.sequence - b.sequence);

  if (trays.length === 0) {
    return <RunPartList step={step} parts={parts} stepParts={stepParts} run={run} />;
  }

  const stepPartsByPartId = new Map(
    stepParts.filter((stepPart) => stepPart.step_id === step.id).map((sp) => [sp.part_id, sp])
  );
  const leveledParts = parts
    .filter((part) => part.part_level === step.part_level)
    .sort((a, b) => {
      if (a.root_id && b.root_id && a.root_id !== b.root_id) {
        return a.root_id - b.root_id;
      }

      return a.left - b.left;
    });
  const partsByTrayId = groupPartsByTrayId(leveledParts, stepPartsByPartId);

  return (
    <div className="d-flex flex-wrap gap-4">
      {trays.map((tray) => (
        <RunLayoutTrayVisual
          key={tray.id}
          tray={tray}
          parts={partsByTrayId.get(tray.id) ?? []}
          stepPartsByPartId={stepPartsByPartId}
        />
      ))}
    </div>
  );
};
