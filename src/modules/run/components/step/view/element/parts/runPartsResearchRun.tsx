import React, { useEffect, useState } from "react";
import { Dropdown, Table } from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";
import RunStepPartTableRow from "@jield/solodb-react-components/modules/run/components/shared/parts/runStepPartTableRow";
import { listRunStepParts, Run, RunStep, RunStepPart, RunStepPartActionEnum } from "@jield/solodb-typescript-core";

const RunPartsResearchRun = ({
  run,
  runStep,
  runStepParts,
  editable = true,
  refetchFn = () => {},
}: {
  run: Run;
  runStep: RunStep;
  runStepParts?: RunStepPart[];
  editable?: boolean;
  refetchFn?: () => void;
}) => {
  const [stepParts, setStepParts] = useState<RunStepPart[]>(runStepParts || []);

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["stepParts", runStep],
    queryFn: () => listRunStepParts({ step: runStep }),
    enabled: !runStepParts, // Only run the query if runStepParts is not provided
  });

  // to handle what parts are selected in order to perform multi actions on them
  const [selectedParts, setSelectedParts] = useState<Map<number, boolean>>(new Map<number, boolean>());

  useEffect(() => {
    for (const part of stepParts) {
      setSelectedParts((prev) => {
        const next = new Map(prev);
        next.set(part.id, false);
        return next;
      });
    }
  }, [stepParts]);

  useEffect(() => {
    if (isError) {
      console.error("RunPartsResearchRun query error", { error, runStep });
    }
  }, [isError, error, runStep]);

  useEffect(() => {
    if (!isLoading && data && !runStepParts) {
      setStepParts(data.items);
    }
  }, [isLoading, data, runStepParts]);

  useEffect(() => {
    if (runStepParts) {
      setStepParts(runStepParts);
    }
  }, [runStepParts]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div className="text-danger">Error loading run parts.</div>;
  }

  if (stepParts.length === 0) {
    return null;
  }

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

  const performActionOnSelectedParts = (action: RunStepPartActionEnum) => {
      const parts = runStepParts?.filter((part) => selectedParts.get(part.id));

  };

  const renderAvailableActions = () => {
    const parts = runStepParts?.filter((part) => selectedParts.get(part.id));

    if (!parts || parts.length === 0) {
      return null;
    }

    const actionSet = new Set<RunStepPartActionEnum>();

    parts.forEach((stepPart) => {
      const actionsForPart = getAvailableRunStepPartActions(stepPart);
      actionsForPart.forEach((action) => actionSet.add(action));
    });

    if (actionSet.size === 0) {
      return null;
    }

    return (
      <Dropdown align="end">
        <Dropdown.Toggle size="sm" variant="outline-secondary">
          Actions
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {actionSet.has(RunStepPartActionEnum.START_PROCESSING) && (
            <Dropdown.Item onClick={() => false}>
              Start
            </Dropdown.Item>
          )}

          {actionSet.has(RunStepPartActionEnum.FINISH_PROCESSING) && (
            <Dropdown.Item onClick={() => false}>
              Finish
            </Dropdown.Item>
          )}

          {actionSet.has(RunStepPartActionEnum.FAILED_PROCESSING) && (
            <Dropdown.Item onClick={() => false}>
              Failed
            </Dropdown.Item>
          )}

          {actionSet.has(RunStepPartActionEnum.REWORK) && (
            <Dropdown.Item onClick={() => false}>Rework</Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  return (
    <React.Fragment>
      {stepParts && stepParts.length > 0 && (
        <>
          <Table size={"sm"} striped bordered>
            <thead>
              <tr>
                <th>Part</th>
                <th className={"text-center"}>Status</th>
                {editable && <th className={"text-center"}>Operation</th>}
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {stepParts.map((stepPart: RunStepPart, i: React.Key) => (
                <RunStepPartTableRow
                  editable={editable}
                  runStepPart={stepPart}
                  key={i}
                  reloadFn={refetchFn}
                  {...(editable
                    ? {
                        partIsSelected: selectedParts.get(stepPart.id),
                        setPartAsSelected,
                      }
                    : {})}
                />
              ))}
            </tbody>
          </Table>
          {editable && (
            <div>
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
          )}
        </>
      )}
    </React.Fragment>
  );
};

export const getAvailableRunStepPartActions = (runStepPart: RunStepPart): RunStepPartActionEnum[] => {
  // if it already failed in a previous step, nothing can be done
  if (runStepPart.part_processing_failed_in_previous_step) {
    return [];
  }

  const latestActionId = runStepPart.latest_action?.type.id;
  const actions: RunStepPartActionEnum[] = [];

  // your current conditions, just centralized:
  if (runStepPart.actions === 0) {
    actions.push(RunStepPartActionEnum.START_PROCESSING);
  }

  if (
    runStepPart.actions > 0 &&
    latestActionId !== RunStepPartActionEnum.FINISH_PROCESSING &&
    latestActionId !== RunStepPartActionEnum.FAILED_PROCESSING
  ) {
    actions.push(RunStepPartActionEnum.FINISH_PROCESSING, RunStepPartActionEnum.FAILED_PROCESSING);
  }

  if (runStepPart.actions > 0) {
    actions.push(RunStepPartActionEnum.REWORK);
  }

  return actions;
};

export default RunPartsResearchRun;

