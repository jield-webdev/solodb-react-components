import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Requirement, RunStep, MeasurementResult, RunPart, RunStepPart } from "@jield/solodb-typescript-core";

export const MeasurementResultsBadges = ({
  requirement,
  step,
  measurementResults,
  parts,
  stepParts,
}: {
  requirement: Requirement;
  step: RunStep;
  measurementResults: MeasurementResult[];
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

  const stepPartsByPartId = new Map(stepParts.map((stepPart) => [stepPart.part_id, stepPart]));
  const measurementResultByStepPartId = new Map<number, MeasurementResult>();
  for (const result of measurementResults) {
    for (const value of result.values) {
      if (value.step_part_id !== undefined && value.step_part_id !== null && !measurementResultByStepPartId.has(value.step_part_id)) {
        measurementResultByStepPartId.set(value.step_part_id, result);
      }
    }
  }
  const targetsByLoggingParameterId = new Map(
    requirement.targets.map((target) => [target.logging_parameter.id, target])
  );

  const getBadgeStatusClass = (runPart: RunPart): string => {
    const stepPart = stepPartsByPartId.get(runPart.id);
    if (!stepPart) {
      return "badge-inactive";
    }

    const result = measurementResultByStepPartId.get(stepPart.id);

    if (!result) {
      return "";
    }

    for (const value of result.values) {
      const val = parseFloat(value.string_value);
      const target = targetsByLoggingParameterId.get(value.logging_parameter.id);

      if (!target) {
        continue;
      }

      if (target.inclusive) {
        if (!(target.min_value <= val && target.max_value >= val)) {
          return "badge-failed";
        }
      } else {
        if (!(target.min_value < val && target.max_value > val)) {
          return "badge-failed";
        }
      }
    }

    return "badge-processed";
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
          {runPart.short_label}
        </span>
      </OverlayTrigger>
    );
  };

  return (
    <div>
      {leveledParts[0].parent
        ? Object.entries(grouped).map(([groupId, groupParts]) => (
            <div key={groupId} className="mb-2">
              <label className="text-muted me-1">{groupParts[0].parent?.short_label}:</label>{" "}
              {groupParts.map((runPart) => badge(runPart))}
            </div>
          ))
        : leveledParts.map((runPart) => badge(runPart))}
      <span>(measurements)</span>
    </div>
  );
};
