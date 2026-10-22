import { useMemo } from "react";
import { Run, RunPart, RunStep, RunStepPart } from "@jield/solodb-typescript-core";
import { RunPartList } from "@jield/solodb-react-components/modules/run/components/shared/parts/runPartList";
import {
  getExtraTrays,
  getNormalTrays,
  groupPartsByTrayId,
} from "@jield/solodb-react-components/modules/run/utils/runTrays";
import RunLayoutTrayVisual from "./runLayoutTrayVisual";

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
  const normalTrays = useMemo(() => getNormalTrays(run), [run]);
  const extraTrays = useMemo(() => getExtraTrays(run), [run]);

  const currentStepParts = useMemo(
    () => stepParts.filter((stepPart) => stepPart.step_id === step.id),
    [stepParts, step.id]
  );

  const partsByTrayId = useMemo(() => groupPartsByTrayId(parts, currentStepParts), [parts, currentStepParts]);

  if (normalTrays.length === 0 || parts[0]?.part_level > 0) {
    return <RunPartList step={step} parts={parts} stepParts={stepParts} run={run} />;
  }

  return (
    <div className="d-flex flex-wrap gap-4">
      {[...normalTrays, ...extraTrays].map((tray) => (
        <RunLayoutTrayVisual
          key={`tray-${tray.id}`}
          step={step}
          tray={tray}
          parts={partsByTrayId.get(tray.id) ?? []}
          stepParts={currentStepParts}
        />
      ))}
    </div>
  );
};
