import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
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
import LoadingComponent from "@jield/solodb-react-components/modules/core/components/common/LoadingComponent";
import { useScannerContext } from "@jield/solodb-react-components/modules/core/contexts/scanner/ScannerContext";

type Props = {
  run: Run;
  runStep: RunStep;
  refetchFn?: () => void;
};

const RunPartsQrFlow = ({ run, runStep, refetchFn = () => {} }: Props) => {
  const queryClient = useQueryClient();
  const queries = useQueries({
    queries: [
      {
        queryKey: ["runParts", run.id, runStep.part_level],
        queryFn: () => listRunParts({ run: run, level: runStep.part_level }),
      },
      {
        queryKey: ["runStepParts", runStep.id],
        queryFn: () => listRunStepParts({ step: runStep }),
      },
    ],
  });

  const [runPartQuery, runStepPartsQuery] = queries;

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  const runParts = useMemo<RunPart[]>(
    () => runPartQuery.data?.items as RunPart[] | undefined ?? [],
    [runPartQuery.data]
  );

  const runStepParts = useMemo<RunStepPart[]>(
    () => runStepPartsQuery.data?.items as RunStepPart[] | undefined ?? [],
    [runStepPartsQuery.data]
  );

  useEffect(() => {
    // verify for the need to finish the step
    finishStepWhenAllPartsAreFinished(runStep, runStepParts);
  }, [runStepParts]);

  const leveledParts = useMemo(
    () => runParts.filter((part) => part.part_level === runStep.part_level),
    [runParts, runStep.part_level]
  );

  const [showCompletedParts, setShowCompletedParts] = useState<boolean>(false);

  // Use custom hooks for selection and actions
  const { selectedParts, selectAllParts } = usePartSelection({
    parts: leveledParts,
  });

  const partsToRender = useMemo(
    () =>
      leveledParts.filter(
        (part) => selectedParts.get(part.id) && (showCompletedParts || !isRunPartFinish(runStepParts, part))
      ),
    [leveledParts, runStepParts, selectedParts, showCompletedParts]
  );

  const reloadData = () => {
    // Reload the data
    queryClient.invalidateQueries({ queryKey: ["runParts", run.id, runStep.part_level] });
    queryClient.invalidateQueries({ queryKey: ["runStepParts", runStep.id] });
    refetchFn();
  };

  // Handle notifying when a part is completed and therefore is not shown
  const { lastlyReadedKeys, addCallbackFn, removeCallbackFn } = useScannerContext();
  const callbackId = useId();

  const onReadKeys = useCallback(
    (keys: string) => {
      const normalizedRead = keys.replace(/_/g, "-").toUpperCase();

      // TO prevent empty values
      if (!normalizedRead) return;

      const foundPart = runParts.find((p) => normalizedRead.includes(p.short_label));

      if (!foundPart) return;

      if (!showCompletedParts && isRunPartFinish(runStepParts, foundPart)) {
        notification({
          notificationHeader: "Run parts table",
          notificationBody: `Part ${foundPart.parsed_label ?? foundPart.short_label} is already completed`,
          notificationType: "danger",
        });
      }
    },
    [runParts, runStepParts]
  );

  // update the callback
  useEffect(() => {
    removeCallbackFn(callbackId);
    addCallbackFn(callbackId, onReadKeys);
    onReadKeys(lastlyReadedKeys);

    return () => {
      removeCallbackFn(callbackId);
    };
  }, [runParts, runStepParts]);

  if (isLoading) {
    return <LoadingComponent message={"Loading run parts"} />;
  }
  if (isError) {
    return <div className="text-danger">Error loading run parts.</div>;
  }

  return (
    <React.Fragment>
      <Table size={"sm"} striped hover>
        <thead>
          <tr>
            <th colSpan={2}>Part</th>
            <th>Status</th>
            <th>Actions</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {partsToRender.map((runPart: RunPart, i: React.Key) => (
            <RunPartProductionTableRow
              runStep={runStep}
              runPart={runPart}
              runStepParts={runStepParts}
              canInit={false}
              refetchFn={reloadData}
              key={`${runPart.parsed_label}${i}`}
              partIsSelected={selectedParts.get(runPart.id) ?? false}
              dropdown={false}
            />
          ))}
        </tbody>
      </Table>
      <DisplayStepPartsInfo
        runStepParts={runStepParts}
        selectedPartsLength={partsToRender.length}
        totalParts={leveledParts.length}
        onSelectAll={selectAllParts}
        toggleShowCompletedParts={() => {
          setShowCompletedParts(!showCompletedParts);
        }}
      />
    </React.Fragment>
  );
};

const isRunPartFinish = (runStepParts: RunStepPart[], part: RunPart): boolean => {
  const stepPart = runStepParts.find((p) => p.part.id == part.id);

  if (stepPart === null || stepPart === undefined) return false;

  return stepPart.latest_action?.type.id === RunStepPartActionEnum.FINISH_PROCESSING;
};

const DisplayStepPartsInfo = ({
  runStepParts,
  selectedPartsLength,
  totalParts,
  onSelectAll,
  toggleShowCompletedParts,
}: {
  runStepParts: RunStepPart[];
  selectedPartsLength: number;
  totalParts: number;
  onSelectAll: () => void;
  toggleShowCompletedParts: () => void;
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
      <span
        title="Show all the parts"
        style={{ cursor: "pointer" }}
        onClick={toggleShowCompletedParts}
        className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle px-3 py-2 fw-semibold"
      >
        This step has {finishedParts} finished parts
      </span>
    </div>
  );
};

export default RunPartsQrFlow;
