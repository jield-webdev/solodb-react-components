import React, { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Placeholder, Table } from "react-bootstrap";
import { useQueries } from "@tanstack/react-query";
import LoadingComponent from "@jield/solodb-react-components/modules/core/components/common/LoadingComponent";
import RunPartProductionTableRow from "@jield/solodb-react-components/modules/run/components/shared/parts_table/element/runPartProductionTableRow";
import {
  finishStepWhenAllPartsAreFinished,
  Run,
  RunStep,
  RunPart,
  listRunParts,
  listRunStepParts,
  RunStepPartStateEnum,
} from "@jield/solodb-typescript-core";
import type { RunStepPart } from "@jield/solodb-typescript-core";
import { usePartSelection } from "@jield/solodb-react-components/modules/run/hooks/run/parts/usePartSelection";
import { useScannerContext } from "@jield/solodb-react-components/modules/core/contexts/scanner/ScannerContext";
import useQrPartNotifications from "../../../hooks/run/parts/useQrPartNotifications";

type Props = {
  run: Run;
  runStep: RunStep;
};

const RunPartsQrFlow = ({ run, runStep }: Props) => {
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
    () => (runPartQuery.data?.items as RunPart[] | undefined) ?? [],
    [runPartQuery.data]
  );

  const runStepParts = useMemo<RunStepPart[]>(
    () => (runStepPartsQuery.data?.items as RunStepPart[] | undefined) ?? [],
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

  useQrPartNotifications({ runStepParts: runStepParts, runParts: leveledParts });

  const partsToRender = useMemo(
    () =>
      leveledParts.filter(
        (part) => selectedParts.get(part.id) && (showCompletedParts || !isRunPartFinish(runStepParts, part))
      ),
    [leveledParts, runStepParts, selectedParts, showCompletedParts]
  );


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
          {isLoading &&
            Array.from({ length: 1 }).map((_, i) => (
              <tr key={`placeholder-${i}`}>
                <td colSpan={2}>
                  <Placeholder as="div" animation="glow">
                    <Placeholder xs={6} />
                  </Placeholder>
                </td>
                <td>
                  <Placeholder as="div" animation="glow">
                    <Placeholder xs={5} />
                  </Placeholder>
                </td>
                <td>
                  <Placeholder as="div" animation="glow">
                    <Placeholder xs={4} />
                  </Placeholder>
                </td>
                <td>
                  <Placeholder as="div" animation="glow">
                    <Placeholder xs={7} />
                  </Placeholder>
                </td>
              </tr>
            ))}
          {!isLoading && partsToRender.map((runPart: RunPart, i: React.Key) => (
            <RunPartProductionTableRow
              runStep={runStep}
              runPart={runPart}
              runStepParts={runStepParts}
              canInit={false}
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

export const isRunPartFinish = (runStepParts: RunStepPart[], part: RunPart) => {
  const stepPart = runStepParts.find((p) => p.part_id == part.id);

  if (stepPart === null || stepPart === undefined) return false;

  return stepPart.processed;
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
    runStepParts.forEach((part) => (part.processed ? counter++ : null));
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
