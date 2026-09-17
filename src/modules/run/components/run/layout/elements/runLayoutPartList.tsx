import { useMemo } from "react";
import { Run, RunPart, RunStep, RunStepPart } from "@jield/solodb-typescript-core";
import { RunPartList } from "@jield/solodb-react-components/modules/run/components/shared/parts/runPartList";
import {
  buildPlaceholderExtraTray,
  buildTraySlots,
  getExtraTrays,
  getNextExtraTrayId,
  getNormalTrays,
  groupPartsByTrayId,
  isTrayFull,
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

  // Only offer the next extra tray once the last one has no free slot left in this step, so operators
  // never face more empty extra trays than they can fill and the backend keeps creating them in sequence.
  const visibleExtraTrays = useMemo(() => {
    const lastExtraTray = extraTrays[extraTrays.length - 1];

    if (lastExtraTray) {
      const slots = buildTraySlots(
        lastExtraTray.tray_type,
        partsByTrayId.get(lastExtraTray.id) ?? [],
        currentStepParts
      );

      if (!isTrayFull(slots, lastExtraTray.tray_type)) return extraTrays;
    }

    const placeholder = buildPlaceholderExtraTray(run, getNextExtraTrayId(extraTrays));

    return placeholder ? [...extraTrays, placeholder] : extraTrays;
  }, [extraTrays, partsByTrayId, currentStepParts, run]);

  if (normalTrays.length === 0 || parts[0]?.part_level > 0) {
    return <RunPartList step={step} parts={parts} stepParts={stepParts} run={run} />;
  }

  return (
    <div className="d-flex flex-wrap gap-4">
      {[...normalTrays, ...visibleExtraTrays].map((tray) => (
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
