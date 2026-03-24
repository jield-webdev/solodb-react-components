import React, { useEffect, useMemo, useRef } from "react";
import { Table } from "react-bootstrap";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import RunPartProductionTableRow from "@jield/solodb-react-components/modules/run/components/shared/parts_table/element/runPartProductionTableRow";
import {
  finishStepWhenAllPartsAreFinished,
  Run,
  RunStep,
  RunStepPart,
  RunPart,
  listRunParts,
  listRunStepParts,
  RunStepPartActionEnum,
} from "@jield/solodb-typescript-core";
import { usePartSelection } from "@jield/solodb-react-components/modules/run/hooks/run/parts/usePartSelection";
import { notification } from "@jield/solodb-react-components/utils/notification";

const SHOW_FINISH_PARTS = false;

type Props = {
  run: Run;
  runStep: RunStep;
  runStepParts?: RunStepPart[];
  runParts?: RunPart[];
  refetchFn?: () => void;
};

const RunPartsQrFlow = ({ run, runStep, runStepParts, runParts, refetchFn = () => {} }: Props) => {
  const queryClient = useQueryClient();
  const queries = useQueries({
    queries: [
      {
        queryKey: ["runParts", run.id, runStep.part_level],
        queryFn: () => listRunParts({ run: run, level: runStep.part_level }),
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

  useEffect(() => {
    const partsToVerify = runStepParts ?? (runStepPartsQuery.data?.items as RunStepPart[] | undefined) ?? [];
    // verify for the need to finish the step
    finishStepWhenAllPartsAreFinished(runStep, partsToVerify);
  }, [runStepParts, runStepPartsQuery.data]);

  const leveledParts = useMemo(
    () => runPartsData.filter((part) => part.part_level === runStep.part_level),
    [runPartsData, runStep.part_level]
  );

  // Use custom hooks for selection and actions
  const { selectedParts, selectAllParts } = usePartSelection({
    parts: leveledParts,
  });

  const prevSelectedPartsRef = useRef<Map<number, boolean>>(new Map());

  useEffect(() => {
    const prev = prevSelectedPartsRef.current;

    const newlySelected = [...selectedParts.entries()]
      .filter(([id, selected]) => selected && !prev.get(id))
      .map(([id]) => id);

    newlySelected.forEach((partId) => {
      const part = leveledParts.find((p) => p.id === partId);
      if (part && isRunPartFinish(runStepPartsData, part)) {
        notification({
          notificationHeader: "Part already finished",
          notificationBody: `Part ${part.short_label} has already been processed`,
          notificationType: "danger",
        });
      }
    });

    prevSelectedPartsRef.current = new Map(selectedParts);
  }, [selectedParts, runStepPartsData, leveledParts]);

  const partsToRender = useMemo(
    () => leveledParts.filter((part) => selectedParts.get(part.id) && !isRunPartFinish(runStepPartsData, part)),
    [selectedParts, runStepPartsData]
  );

  const reloadData = () => {
    // Reload the data
    queryClient.invalidateQueries({ queryKey: ["runParts", run.id, runStep.part_level] });
    queryClient.invalidateQueries({ queryKey: ["runStepParts", runStep.id] });
    refetchFn();
  };

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
              refetchFn={reloadData}
              key={i}
              partIsSelected={selectedParts.get(runPart.id) ?? false}
              dropdown={false}
            />
          ))}
        </tbody>
      </Table>
      <DisplayStepPartsInfo runStepParts={runStepPartsData} selectedPartsLength={partsToRender.length} totalParts={leveledParts.length} onSelectAll={selectAllParts} />
    </React.Fragment>
  );
};

const isRunPartFinish = (runStepParts: RunStepPart[], part: RunPart): boolean => {
  if (SHOW_FINISH_PARTS) return false;

  const stepPart = runStepParts.find((p) => p.part.id == part.id);

  if (stepPart === null || stepPart === undefined) return false;

  return stepPart.latest_action?.type.id === RunStepPartActionEnum.FINISH_PROCESSING;
};

const DisplayStepPartsInfo = ({
  runStepParts,
  selectedPartsLength,
  totalParts,
  onSelectAll,
}: {
  runStepParts: RunStepPart[];
  selectedPartsLength: number;
  totalParts: number;
  onSelectAll: () => void;
}) => {
  const finishedParts = useMemo(() => {
    let counter = 0;
    runStepParts.forEach((part) =>
      part.latest_action?.type.id === RunStepPartActionEnum.FINISH_PROCESSING ? counter++ : null
    );
    return counter;
  }, [runStepParts]);

  const remainingParts = useMemo(() => totalParts - selectedPartsLength, [totalParts, selectedPartsLength]);

  return (
    <div className="d-flex flex-column flex-sm-row flex-wrap gap-2 mt-2">
      <span
        className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 fw-semibold"
        role="button"
        title="Show all the parts"
        onClick={onSelectAll}
        style={{ cursor: "pointer" }}
      >
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
