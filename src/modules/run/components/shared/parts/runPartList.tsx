import { useQuery } from "@tanstack/react-query";
import { Run, RunPart, RunStep, RunStepPart, RunTypeEnum } from "@jield/solodb-typescript-core";
import { FlatGrid } from "./runPartList/flatGrid";
import { TrayGrid } from "./runPartList/trayGrid";
import { type RunPartRenderContext } from "./runPartList/partCell";
import { useMemo } from "react";

const getTrayIdPerStepPart = (part: RunPart, stepPart: RunStepPart | null | undefined): number => {
    if (!stepPart  || !stepPart.tray_id) {
        return part.tray?.id ?? 0;
    }

    return stepPart.tray_id;
};

const groupPartsByTrayId = (parts: RunPart[], stepParts: RunStepPart[]): Map<number, RunPart[]> => {
  const stepPartsByPartId = new Map(stepParts.map((stepPart) => [stepPart.part_id, stepPart]));

  return parts.reduce<Map<number, RunPart[]>>((acc, part) => {
    if (!part.tray) return acc;

    const trayId = getTrayIdPerStepPart(part, stepPartsByPartId.get(part.id));

    const list = acc.get(trayId) ?? [];
    list.push(part);
    acc.set(trayId, list);
    return acc;
  }, new Map());
};

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
  const leveledParts = useMemo(
    () =>
      parts
        .filter((p) => p.part_level === step.part_level)
        .sort((a, b) => {
          if (a.root_id && b.root_id && a.root_id !== b.root_id) {
            return a.root_id - b.root_id;
          }
          return a.left - b.left;
        }),
    [parts]
  );

  const stepPartsById = useMemo(
    () => new Map(stepParts.filter((sp) => sp.step_id === step.id).map((sp) => [sp.part_id, sp])),
    [stepParts, step]
  );

  const trays = useMemo(() => [...(run.run_trays ?? [])].sort((a, b) => a.sequence - b.sequence), [run]);

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

  if (trays.length === 0) {
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
