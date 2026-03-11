import type { CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import { RunStep, RunPart, RunStepPart, TrayType, Run, RunTypeEnum } from "@jield/solodb-typescript-core";
import RunPartIndicator from "@jield/solodb-react-components/modules/run/components/shared/parts/runPartIndicator";

export const RunPartList = ({
  step,
  parts,
  stepParts,
  run,
  reloadFn,
}: {
  step: RunStep;
  parts: RunPart[];
  stepParts: RunStepPart[];
  run: Run;
  reloadFn?: () => void;
}) => {
  const leveledParts = parts
    .filter((p) => p.part_level === step.part_level)
    .sort((a, b) => {
      if (a.root_id && b.root_id && a.root_id !== b.root_id) {
        return a.root_id - b.root_id;
      }
      return a.left - b.left;
    });

  const stepPartsById = new Map(stepParts.filter((sp) => sp.step.id === step.id).map((sp) => [sp.part.id, sp]));

  const trays = [...(run.run_trays ?? [])].sort((a, b) => a.sequence - b.sequence);

  const partsByTrayId = leveledParts.reduce<Map<number, RunPart[]>>((acc, part) => {
    if (!part.tray) return acc;
    const list = acc.get(part.tray.id) ?? [];
    list.push(part);
    acc.set(part.tray.id, list);
    return acc;
  }, new Map());

  const allowCreate = run.run_type === RunTypeEnum.PRODUCTION;
  const { data: selectedPartIds = [] } = useQuery<number[]>({
    queryKey: ["runPartSelection", step.id],
    queryFn: async () => [],
    initialData: [],
    enabled: false,
  });

  const getBadgeStatusClass = (runPart: RunPart): string => {
    const match = stepPartsById.get(runPart.id);
    if (!match) return "step-part-inactive";
    if (match.part_processing_failed_in_previous_step) return "step-part-failed-other";
    if (match.part.part_processing_failed) return "step-part-failed-other";
    if (match.failed) return "step-part-failed";
    if (match.processed) return "step-part-processed";
    if (match.started) return "step-part-started";
    return "step-part-inactive";
  };

  if (trays.length === 0) {
    const columnsPerRow = 12;
    const maxSlotIndex = Math.max(
      leveledParts.length,
      leveledParts.reduce((maxValue, runPart) => Math.max(maxValue, runPart.left ?? 0), 0),
    );
    const totalRows = Math.max(1, Math.ceil(maxSlotIndex / columnsPerRow));
    const totalColumns = columnsPerRow;
    const trayStyle: CSSProperties = {
      "--tray-columns": totalColumns,
      "--tray-rows": totalRows,
    } as CSSProperties;
    const slots = Array.from({ length: totalRows * totalColumns }, () => null as RunPart | null);
    const unassigned: RunPart[] = [];

    leveledParts.forEach((runPart) => {
      const column = runPart.left;
      const slotIndex = column >= 1 && column <= slots.length ? column - 1 : null;
      if (slotIndex !== null && !slots[slotIndex]) {
        slots[slotIndex] = runPart;
      } else {
        unassigned.push(runPart);
      }
    });

    unassigned.forEach((runPart) => {
      const nextIndex = slots.findIndex((slot) => !slot);
      if (nextIndex !== -1) {
        slots[nextIndex] = runPart;
      }
    });

    return (
      <div className="tray-grid" data-orientation="ltr" style={trayStyle}>
        {slots.map((runPart, slotIndex) => (
          <RunPartIndicator
            key={`slot-no-tray-${slotIndex}`}
            runPart={runPart}
            statusClass={runPart ? getBadgeStatusClass(runPart) : undefined}
            withTrayCell
            allowCreate={allowCreate}
            hasStepPart={runPart ? stepPartsById.has(runPart.id) : false}
            isSelected={runPart ? selectedPartIds.includes(runPart.id) : false}
            runStep={step}
            reloadFn={reloadFn}
          />
        ))}
      </div>
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

  return (
    <div className="tray-grid-group">
      {trays.map((tray) => {
        const trayType = tray.tray_type;
        if (!trayType?.rows || !trayType?.columns) {
          const trayParts = partsByTrayId.get(tray.id) ?? [];
          return (
            <div key={`tray-${tray.id}`} className="tray-grid-wrapper">
              <div className="tray-grid__label">{tray.name ?? tray.label}</div>
              <div className="d-flex flex-wrap gap-2">
                {trayParts.map((runPart) => (
                  <RunPartIndicator
                    key={runPart.id}
                    runPart={runPart}
                    statusClass={getBadgeStatusClass(runPart)}
                    allowCreate={allowCreate}
                    hasStepPart={stepPartsById.has(runPart.id)}
                    isSelected={selectedPartIds.includes(runPart.id)}
                    runStep={step}
                    reloadFn={reloadFn}
                  />
                ))}
              </div>
            </div>
          );
        }

        const trayCapacity = trayType.rows * trayType.columns;
        const trayOrientation = trayType.orientation === "ttb" ? "ttb" : "ltr";
        const trayStyle: CSSProperties = {
          "--tray-columns": trayType.columns,
          "--tray-rows": trayType.rows,
        } as CSSProperties;
        const slots = Array.from({ length: trayCapacity }, () => null as RunPart | null);
        const trayParts = partsByTrayId.get(tray.id) ?? [];

        trayParts.forEach((runPart) => {
          const slotIndex = getSlotIndex(trayType, runPart.tray_row, runPart.tray_column);
          if (slotIndex === null || slots[slotIndex]) return;
          slots[slotIndex] = runPart;
        });

        return (
          <div key={`tray-${tray.id}`} className="tray-grid-wrapper">
            <div className="tray-grid__label">{tray.name ?? tray.label}</div>
            <div className="tray-grid" data-orientation={trayOrientation} style={trayStyle}>
              {slots.map((runPart, slotIndex) => {
                const statusClass = runPart ? getBadgeStatusClass(runPart) : undefined;

                return (
                  <RunPartIndicator
                    key={`slot-${tray.id}-${slotIndex}`}
                    runPart={runPart}
                    statusClass={statusClass}
                    withTrayCell
                    allowCreate={allowCreate}
                    hasStepPart={runPart ? stepPartsById.has(runPart.id) : false}
                    isSelected={runPart ? selectedPartIds.includes(runPart.id) : false}
                    runStep={step}
                    reloadFn={reloadFn}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
