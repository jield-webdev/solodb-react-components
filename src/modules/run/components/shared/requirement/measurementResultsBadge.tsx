import { MeasurementResult } from "@/modules/run/interfaces/measurement/result";
import { Requirement } from "@/modules/run/interfaces/requirement";
import { RunPart } from "@/modules/run/interfaces/run/runPart";
import { RunStep } from "@/modules/run/interfaces/runStep";
import { RunStepPart } from "@/modules/run/interfaces/step/runStepPart";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

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

  const getBadgeStatusClass = (runPart: RunPart): string => {
    const stepPart = stepParts.find((sp) => sp.part.id === runPart.id);
    if (!stepPart) {
      return "badge-inactive";
    }

    const result = measurementResults.find((r) => r.values.some((v) => v.step_part_id === stepPart.id));

    if (!result) {
      return "";
    }

    for (const value of result.values) {
      const val = parseFloat(value.string_value);
      const target = requirement.targets.find((target) => target.logging_parameter.id == value.logging_parameter.id);

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
      <label>(measurements)</label>
    </div>
  );
};
