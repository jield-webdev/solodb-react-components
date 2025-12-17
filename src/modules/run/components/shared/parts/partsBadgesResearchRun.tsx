import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { RunStep, RunPart, RunStepPart } from "solodb-typescript-core";

export const PartsBadgesResearchRun = ({
  step,
  parts,
  stepParts,
}: {
  step: RunStep;
  parts: RunPart[];
  stepParts: RunStepPart[];
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

  const getBadgeStatusClass = (runPart: RunPart): string => {
    const match = stepParts.find((sp) => sp.part.id === runPart.id && sp.step.id === step.id);
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
};
