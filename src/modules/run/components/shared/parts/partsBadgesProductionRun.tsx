import RunPartProductionBadge from "@jield/solodb-react-components/modules/run/components/step/view/element/parts/element/runPartProductionBadge";
import { RunStep, RunPart, RunStepPart } from "@jield/solodb-typescript-core";

export const PartBadgesProductionRun = ({
  runStep,
  parts,
  runStepParts,
  reloadFn,
}: {
  runStep: RunStep;
  parts: RunPart[];
  runStepParts: RunStepPart[];
  reloadFn?: () => void;
}) => {
  const leveledParts = parts
    .filter((p) => p.part_level === runStep.part_level)
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

  const renderBadgeElement = (runPart: RunPart) => {
    return (
      <RunPartProductionBadge
        runStep={runStep}
        runPart={runPart}
        runStepParts={runStepParts}
        reloadFn={reloadFn}
        key={runPart.id}
      />
    );
  };

  return (
    <div className={"d-flex flex-wrap gap-2"}>
      {leveledParts[0] && leveledParts[0].parent
        ? Object.entries(grouped).map(([groupId, groupParts]) => (
            <div key={groupId} className="mb-2">
              <label className="text-muted me-1">{groupParts[0].parent?.short_label}:</label>{" "}
              {groupParts.map((runPart) => renderBadgeElement(runPart))}
            </div>
          ))
        : leveledParts.map((runPart) => renderBadgeElement(runPart))}
    </div>
  );
};
