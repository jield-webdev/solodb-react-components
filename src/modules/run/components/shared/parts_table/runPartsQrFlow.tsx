import React, { useMemo } from "react";
import { Table } from "react-bootstrap";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import RunPartProductionTableRow from "@jield/solodb-react-components/modules/run/components/shared/parts_table/element/runPartProductionTableRow";
import { Run, RunStep, RunStepPart, RunPart, listRunParts, listRunStepParts, RunStepPartActionEnum } from "@jield/solodb-typescript-core";
import { usePartSelection } from "@jield/solodb-react-components/modules/run/hooks/run/parts/usePartSelection";

type Props = {
  run: Run;
  runStep: RunStep;
  runStepParts?: RunStepPart[];
  runParts?: RunPart[];
  refetchFn?: () => void;
  toggleRunPartRef?: React.RefObject<{
    setPart: (part: number) => void;
  } | null>;
};

const RunPartsQrFlow = ({ run, runStep, runStepParts, runParts, refetchFn = () => {}, toggleRunPartRef }: Props) => {
  const queryClient = useQueryClient();
  const queries = useQueries({
    queries: [
      {
        queryKey: ["runParts", run],
        queryFn: () => listRunParts({ run: run }),
        enabled: !runParts, // don't fetch if runParts prop provided
      },
      {
        queryKey: ["runStepParts", runStep.id],
        queryFn: () => listRunStepParts({ step: runStep }),
        enabled: !runStepParts, // don't fetch if runStepParts prop provided
      },
    ],
  });

  const [runPartQuery, runStepPartsQuery] = queries;

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  const runPartsData = useMemo<RunPart[]>(
    () => runParts ?? (runPartQuery.data?.items as RunPart[] | undefined) ?? [],
    [runParts, runPartQuery.data]
  );
  
  const runStepPartsData = useMemo<RunStepPart[]>(
    () => runStepParts ?? (runStepPartsQuery.data?.items as RunStepPart[] | undefined) ?? [],
    [runStepParts, runStepPartsQuery.data]
  );

  const leveledParts = useMemo(
    () => runPartsData.filter((part) => part.part_level === runStep.part_level),
    [runPartsData, runStep.part_level]
  );

  console.log(leveledParts);

  // Use custom hooks for selection and actions
  const { selectedParts } = usePartSelection({
    parts: leveledParts,
    getPartId: (part) => part.id,
    toggleRef: toggleRunPartRef,
  });

  const partsToRender = useMemo(() => leveledParts.filter((part) => selectedParts.get(part.id)), [selectedParts]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div className="text-danger">Error loading run parts.</div>;
  }

  return (
    <React.Fragment>
      <Table size={"sm"} striped hover>
        <thead>
          <tr>
            <th>Part</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {partsToRender.map((runPart: RunPart, i: React.Key) => (
            <RunPartProductionTableRow
              runStep={runStep}
              runPart={runPart}
              runStepParts={runStepPartsData}
              refetchFn={refetchFn}
              key={i}
              partIsSelected={selectedParts.get(runPart.id) ?? false}
              dropdown={false}
            />
          ))}
        </tbody>
      </Table>
      <DisplayStepPartsInfo runStepParts={runStepPartsData} selectedPartsLength={partsToRender.length} />
    </React.Fragment>
  );
};

const DisplayStepPartsInfo = ({ runStepParts, selectedPartsLength }: { runStepParts: RunStepPart[]; selectedPartsLength: number; }) => {
  const finishedParts = useMemo(() => {
    let counter = 0;
    runStepParts.forEach((part) => part.latest_action?.type.id === RunStepPartActionEnum.FINISH_PROCESSING ? counter++ : null);
    return counter;
  }, [runStepParts]);

  const remainingParts = useMemo(() => runStepParts.length - selectedPartsLength, [runStepParts, selectedPartsLength]);

  return (
    <div className="d-flex flex-column flex-sm-row flex-wrap gap-2 mt-2">
      <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 fw-semibold">
        This step has {remainingParts} more parts
      </span>
      <span className="badge rounded-pill bg-info-subtle text-info-emphasis border border-info-subtle px-3 py-2 fw-semibold">
        This step has {selectedPartsLength} scanned parts
      </span>
      <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle px-3 py-2 fw-semibold">
        This step has {finishedParts} finished parts
      </span>
    </div>
  );
};

export default RunPartsQrFlow;
