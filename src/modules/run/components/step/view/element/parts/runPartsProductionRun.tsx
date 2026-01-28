import React, { useEffect, useMemo, useState } from "react";
import { Dropdown, Table } from "react-bootstrap";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import RunPartProductionTableRow from "@jield/solodb-react-components/modules/run/components/step/view/element/parts/element/runPartProductionTableRow";
import {
  Run,
  RunStep,
  RunStepPart,
  RunPart,
  listRunParts,
  listRunStepParts,
  RunStepPartActionEnum,
  setRunStepPartAction,
} from "@jield/solodb-typescript-core";
import { getAvailableRunStepPartActions } from "./runPartsResearchRun";

const RunPartsProductionRun = ({
  run,
  runStep,
  runStepParts,
  runParts,
  refetchFn = () => {},
}: {
  run: Run;
  runStep: RunStep;
  runStepParts?: RunStepPart[];
  runParts?: RunPart[];
  refetchFn?: () => void;
}) => {
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
    [runPartsData]
  );

  // to handle what parts are selected in order to perform multi actions on them
  const [selectedParts, setSelectedParts] = useState<Map<number, boolean>>(new Map<number, boolean>());

  useEffect(() => {
    setSelectedParts((prev) => {
      const next = new Map<number, boolean>();
      for (const part of leveledParts) {
        next.set(part.id, prev.get(part.id) ?? false);
      }
      return next;
    });
  }, [leveledParts]);

  const setPartAsSelected = (partID: number) => {
    setSelectedParts((prev) => {
      const next = new Map(prev);
      next.set(partID, !prev.get(partID));
      return next;
    });
  };

  const selectAllParts = () => {
    setSelectedParts((prev) => {
      const next = new Map(prev);
      for (const key of next.keys()) {
        next.set(key, true);
      }
      return next;
    });
  };

  const selectNoneParts = () => {
    setSelectedParts((prev) => {
      const next = new Map(prev);
      for (const key of next.keys()) {
        next.set(key, false);
      }
      return next;
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div className="text-danger">Error loading run parts.</div>;
  }

  const performActionToSelectedParts = (action: RunStepPartActionEnum) => {
    const stepPartsFiltered = runStepPartsData
      .filter((stepPart) => leveledParts.find((p) => p.id == stepPart.part.id))
      .filter((part) => selectedParts.get(part.part.id));

    stepPartsFiltered.forEach((runPart) => {
      if (getAvailableRunStepPartActions(runPart).some((a) => a === action)) {
        setRunStepPartAction({ runStepPart: runPart, runStepPartAction: action }).then(() => {
          queryClient.refetchQueries({ queryKey: ["runStepParts", runStep.id] });
          if (refetchFn) {
            refetchFn();
          }
        });
      }
    });
  };

  const renderAvailableActions = () => {
    const selectedRunParts = leveledParts.filter((part) => selectedParts.get(part.id));

    if (!selectedRunParts || selectedRunParts.length === 0) {
      return null;
    }

    const stepPartsFiltered = runStepPartsData
      .filter((stepPart) => leveledParts.find((p) => p.id == stepPart.part.id))
      .filter((part) => selectedParts.get(part.part.id));

    const hasInitAction = selectedRunParts.some(
      (runPart) =>
        !runStepPartsData.find(
          (runStepPart) => runStepPart.part.id === runPart.id && runStepPart.step.id === runStep.id
        )
    );

    const initSelectedParts = () => {
      const partsToInit = selectedRunParts.filter(
        (runPart) =>
          !runStepPartsData.find(
            (runStepPart) => runStepPart.part.id === runPart.id && runStepPart.step.id === runStep.id
          )
      );

      Promise.all(
        partsToInit.map((runPart) =>
          axios.post("/create/run/step/part", {
            run_part_id: runPart.id,
            run_step_id: runStep.id,
          })
        )
      ).then(() => {
        queryClient.refetchQueries({ queryKey: ["runStepParts", runStep.id] });
        if (refetchFn) {
          refetchFn();
        }
      });
    };

    const actionSet = new Set<RunStepPartActionEnum>();

    stepPartsFiltered.forEach((stepPart) => {
      const actionsForPart = getAvailableRunStepPartActions(stepPart);
      actionsForPart.forEach((action) => actionSet.add(action));
    });

    if (actionSet.size === 0 && !hasInitAction) {
      return null;
    }

    return (
      <Dropdown align="end">
        <Dropdown.Toggle size="sm" variant="secondary">
          Actions
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {hasInitAction && (
            <Dropdown.Item
              onClick={() => {
                initSelectedParts();
              }}
            >
              Init
            </Dropdown.Item>
          )}
          {actionSet.has(RunStepPartActionEnum.START_PROCESSING) && (
            <Dropdown.Item
              onClick={() => {
                performActionToSelectedParts(RunStepPartActionEnum.START_PROCESSING);
              }}
            >
              Start
            </Dropdown.Item>
          )}

          {actionSet.has(RunStepPartActionEnum.FINISH_PROCESSING) && (
            <Dropdown.Item
              onClick={() => {
                performActionToSelectedParts(RunStepPartActionEnum.FINISH_PROCESSING);
              }}
            >
              Finish
            </Dropdown.Item>
          )}

          {actionSet.has(RunStepPartActionEnum.FAILED_PROCESSING) && (
            <Dropdown.Item
              onClick={() => {
                performActionToSelectedParts(RunStepPartActionEnum.FAILED_PROCESSING);
              }}
            >
              Failed
            </Dropdown.Item>
          )}

          {actionSet.has(RunStepPartActionEnum.REWORK) && (
            <Dropdown.Item
              onClick={() => {
                performActionToSelectedParts(RunStepPartActionEnum.REWORK);
              }}
            >
              Rework
            </Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  return (
    <React.Fragment>
      {leveledParts.length > 0 && (
        <>
          <h3>Available parts</h3>
          <Table size={"sm"} striped hover responsive className={"align-middle"}>
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
              {leveledParts.map((runPart: RunPart, i: React.Key) => (
                <RunPartProductionTableRow
                  runStep={runStep}
                  runPart={runPart}
                  runStepParts={runStepPartsData}
                  refetchFn={refetchFn}
                  key={i}
                  partIsSelected={selectedParts.get(runPart.id) ?? false}
                  setPartAsSelected={setPartAsSelected}
                />
              ))}
            </tbody>
          </Table>
          <div className="d-flex gap-3">
            <div className="btn-group">
              <button className="part-check-all btn btn-sm btn-outline-secondary" onClick={selectAllParts}>
                All
              </button>
              <button className="part-check-none btn btn-sm btn-outline-secondary" onClick={selectNoneParts}>
                None
              </button>
            </div>
            {selectedParts.values().some((p) => p) && renderAvailableActions()}
          </div>
        </>
      )}
    </React.Fragment>
  );
};

export default RunPartsProductionRun;
