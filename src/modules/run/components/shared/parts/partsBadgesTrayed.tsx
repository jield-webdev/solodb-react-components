import type { CSSProperties } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { RunStep, RunPart, RunStepPart, TrayType, Run } from "@jield/solodb-typescript-core";

export const PartsBadgesTrayed = ({
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
  const leveledParts = parts
    .filter((p) => p.part_level === step.part_level)
    .sort((a, b) => {
      if (a.root_id && b.root_id && a.root_id !== b.root_id) {
        return a.root_id - b.root_id;
      }
      return a.left - b.left;
    });

  const grouped = leveledParts.reduce<Record<number, RunPart[]>>((acc, part) => {
    const key = part.root_id ?? part.id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(part);
    return acc;
  }, {});

  const stepPartsById = new Map(stepParts.filter((sp) => sp.step.id === step.id).map((sp) => [sp.part.id, sp]));

  const trays = [...(run.run_trays ?? [])].sort((a, b) => a.sequence - b.sequence);
  const hasTrayLayout = trays.some((tray) => tray.tray_type?.rows && tray.tray_type?.columns);

  const partsByTrayId = leveledParts.reduce<Map<number, RunPart[]>>((acc, part) => {
    if (!part.tray) return acc;
    const list = acc.get(part.tray.id) ?? [];
    list.push(part);
    acc.set(part.tray.id, list);
    return acc;
  }, new Map());

  const getBadgeStatusClass = (runPart: RunPart): string => {
    const match = stepPartsById.get(runPart.id);
    if (!match) return "badge-inactive";
    if (match.part_processing_failed_in_previous_step) return "badge-failed-previous";
    if (match.failed) return "badge-failed";
    if (match.processed) return "badge-processed";
    if (match.started) return "badge-started";
    return "";
  };

  const badge = (runPart: RunPart) => {
    return (
      <OverlayTrigger
        placement="top"
        key={runPart.id}
        overlay={
          <Tooltip id={`tooltip-${runPart.id}`}>
            {`Level: ${runPart.part_level}${runPart.parent ? `, Parent: ${runPart.parent.short_label}` : ""}`}
          </Tooltip>
        }
      >
        <span
          key={runPart.id}
          className={`badge badge-level-${runPart.part_level} ${getBadgeStatusClass(runPart)} me-1`}
        >
          {runPart.label ?? runPart.short_label}
        </span>
      </OverlayTrigger>
    );
  };

  const getSlotStatusClass = (runPart: RunPart | null): string => {
    if (!runPart) return "tray-grid__cell--empty";
    const match = stepPartsById.get(runPart.id);
    if (!match) return "tray-grid__cell--inactive";
    if (match.part_processing_failed_in_previous_step || match.failed) return "tray-grid__cell--failed";
    if (match.processed) return "tray-grid__cell--processed";
    if (match.started) return "tray-grid__cell--started";
    return "tray-grid__cell--idle";
  };

  if (!hasTrayLayout) {
    return (
      <>
        {leveledParts[0] && leveledParts[0].parent
          ? Object.entries(grouped).map(([groupId, groupParts]) => (
              <div key={groupId} className="mb-2">
                <label className="text-muted me-1">{groupParts[0].parent?.short_label}:</label>{" "}
                {groupParts.map((runPart) => badge(runPart))}
              </div>
            ))
          : leveledParts.map((runPart) => badge(runPart))}
      </>
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
              <div>{trayParts.map((runPart) => badge(runPart))}</div>
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
                const cellClassName = `tray-grid__cell ${getSlotStatusClass(runPart)}`;

                return (
                  <div key={`slot-${tray.id}-${slotIndex}`} className={cellClassName}>
                    {runPart ? (
                      <span className="tray-grid__cell-label">{runPart.label ?? runPart.short_label}</span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
