import { RunPart, RunStep, RunStepPart } from "@jield/solodb-typescript-core";
import RunPartIndicator from "@jield/solodb-react-components/modules/run/components/shared/parts/runPartIndicator";

export type RunPartRenderContext = {
  step: RunStep;
  stepPartsById: Map<number, RunStepPart>;
  allowCreate: boolean;
  selectedPartIds: number[];
};

export const getBadgeStatusClass = (
  runPart: RunPart,
  stepPartsById: Map<number, RunStepPart>
): string => stepPartsById.get(runPart.id)?.status.class ?? "step-part-inactive";

export const PartBadge = ({
  runPart,
  context,
}: {
  runPart: RunPart;
  context: RunPartRenderContext;
}) => {
  const { step, stepPartsById, allowCreate, selectedPartIds } = context;

  return (
    <RunPartIndicator
      runPart={runPart}
      statusClass={getBadgeStatusClass(runPart, stepPartsById)}
      allowCreate={allowCreate}
      stepPart={stepPartsById.get(runPart.id)}
      isSelected={selectedPartIds.includes(runPart.id)}
      runStep={step}
    />
  );
};

export const MultiPartCell = ({
  runParts,
  context,
}: {
  runParts: RunPart[];
  context: RunPartRenderContext;
}) => {
  const cellClassName = `tray-grid__cell${runParts.length ? "" : " tray-grid__cell--empty"}${
    runParts.length > 1 ? " tray-grid__cell--multi" : ""
  }`;

  return (
    <div className={cellClassName}>
      {runParts.map((runPart) => (
        <PartBadge key={runPart.id} runPart={runPart} context={context} />
      ))}
    </div>
  );
};

export const SlotCell = ({
  runPart,
  context,
}: {
  runPart: RunPart | null;
  context: RunPartRenderContext;
}) => {
  const { step, stepPartsById, allowCreate, selectedPartIds } = context;

  return (
    <RunPartIndicator
      runPart={runPart}
      statusClass={runPart ? getBadgeStatusClass(runPart, stepPartsById) : undefined}
      withTrayCell
      allowCreate={allowCreate}
      stepPart={runPart ? stepPartsById.get(runPart.id) : undefined}
      isSelected={runPart ? selectedPartIds.includes(runPart.id) : false}
      runStep={step}
    />
  );
};
