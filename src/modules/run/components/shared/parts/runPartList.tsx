import { useQuery } from "@tanstack/react-query";
import { Run, RunPart, RunStep, RunStepPart, RunTypeEnum } from "@jield/solodb-typescript-core";
import { getLeveledPartsForStep } from "@jield/solodb-react-components/modules/run/utils/runParts";
import { getOrderedTrays, groupPartsByTrayId } from "@jield/solodb-react-components/modules/run/utils/runTrays";
import { FlatGrid } from "./runPartList/flatGrid";
import { TrayGrid } from "./runPartList/trayGrid";
import { type RunPartRenderContext } from "./runPartList/partCell";
import { useMemo } from "react";

export const RunPartList = ({
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
  const leveledParts = useMemo(() => getLeveledPartsForStep(parts, step), [parts, step]);

  const stepPartsById = useMemo(() => {
    const map = new Map<number, RunStepPart>();
    for (const stepPart of stepParts) {
      if (stepPart.step_id === step.id) {
        map.set(stepPart.part_id, stepPart);
      }
    }
    return map;
  }, [stepParts, step]);

  const trays = useMemo(() => getOrderedTrays(run), [run]);

  const partsByTrayId = useMemo(() => groupPartsByTrayId(leveledParts, stepParts), [leveledParts, stepParts]);
  const allNonTrayParts = useMemo(() => parts.filter((part) => !part.tray), [parts]);
  const allPartsByTrayId = useMemo(() => groupPartsByTrayId(parts, stepParts), [parts, stepParts]);

  const allowCreate = run.run_type === RunTypeEnum.PRODUCTION;
  const isSplitLevel = step.part_level > 0;

  const { data: selectedPartIds = [] } = useQuery<number[]>({
    queryKey: ["runPartSelection", step.id],
    queryFn: async () => [],
    initialData: [],
    enabled: false,
  });

  const context: RunPartRenderContext = { step, stepPartsById, allowCreate, selectedPartIds };

  if (trays.length === 0 || leveledParts[0]?.part_level > 0) {
    return (
      <FlatGrid
        leveledParts={leveledParts}
        allNonTrayParts={allNonTrayParts}
        isSplitLevel={isSplitLevel}
        context={context}
      />
    );
  }

  return (
    <div className="tray-grid-group">
      {trays.map((tray) => (
        <TrayGrid
          key={`tray-${tray.id}`}
          tray={tray}
          trayParts={partsByTrayId.get(tray.id) ?? []}
          trayAllParts={allPartsByTrayId.get(tray.id) ?? []}
          stepParts={stepParts}
          isSplitLevel={isSplitLevel}
          context={context}
        />
      ))}
    </div>
  );
};
