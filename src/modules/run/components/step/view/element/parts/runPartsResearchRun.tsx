import { Fragment, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { Dropdown, Table } from "react-bootstrap";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import RunStepPartTableRow from "@jield/solodb-react-components/modules/run/components/shared/parts/runStepPartTableRow";
import {
  getAvailableRunStepPartActions,
  listRunStepParts,
  Run,
  RunStep,
  RunStepPart,
  RunStepPartActionEnum,
  setRunStepPartAction,
} from "@jield/solodb-typescript-core";
import LoadingComponent from "@jield/solodb-react-components/modules/core/components/common/LoadingComponent";

type Props = {
  run: Run;
  runStep: RunStep;
  runStepParts?: RunStepPart[];
  editable?: boolean;
  refetchFn?: () => void;
  toggleRunStepPartRef?: React.RefObject<{
    setPart: (part: number) => void;
  } | null>;
};

const RunPartsResearchRun = ({
  run: _run,
  runStep,
  runStepParts,
  editable = true,
  refetchFn,
  toggleRunStepPartRef,
}: Props) => {
  const [stepParts, setStepParts] = useState<RunStepPart[]>(runStepParts || []);
  const effectiveRefetchFn = refetchFn ?? (() => {});

  const queryClient = useQueryClient();
  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["stepParts", runStep.id],
    queryFn: () => listRunStepParts({ step: runStep }),
    enabled: !runStepParts, // Only run the query if runStepParts is not provided
  });

  // to handle what parts are selected in order to perform multi actions on them
  // Here uses RunStepPart for selected parts
  const [selectedParts, setSelectedParts] = useState<Map<number, boolean>>(new Map<number, boolean>());

  useEffect(() => {
    setSelectedParts((prev) => {
      const next = new Map<number, boolean>();
      for (const part of stepParts) {
        next.set(part.id, prev.get(part.id) ?? false);
      }
      return next;
    });
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

  const setPartAsSelected = useCallback((partID: number) => {
    console.log(partID);
    setSelectedParts((prev) => {
      const next = new Map(prev);
      next.set(partID, !(prev.get(partID) ?? false));
      return next;
    });
  }, []);

  // handle the optional selected toggle RunStepPart from parent component
  useImperativeHandle(toggleRunStepPartRef, () => {
    return {
      setPart(part: number) {
        console.log(part);
        setPartAsSelected(part);
      },
    };
  });

  const selectAllParts = useCallback(() => {
    setSelectedParts((prev) => new Map([...prev.keys()].map((key) => [key, true])));
  }, []);

  const selectNoneParts = useCallback(() => {
    setSelectedParts((prev) => new Map([...prev.keys()].map((key) => [key, false])));
  }, []);

  const performActionToSelectedParts = (action: RunStepPartActionEnum) => {
    const selectedRunStepParts = stepParts?.filter((part) => selectedParts.get(part.id));

    if (!selectedRunStepParts || selectedRunStepParts.length === 0) {
      return null;
    }

    selectedRunStepParts.forEach((runPart) => {
      if (getAvailableRunStepPartActions(runPart).some((a) => a === action)) {
        setRunStepPartAction({ runStepPart: runPart, runStepPartAction: action }).then(() => {
          queryClient.refetchQueries({ queryKey: ["stepParts", runStep.id] });
          if (refetchFn) {
            refetchFn();
          }
        });
      }
    });
  };

  const renderAvailableActions = () => {
    const selectedRunStepParts = stepParts?.filter((part) => selectedParts.get(part.id));

    if (!selectedRunStepParts || selectedRunStepParts.length === 0) {
      return null;
    }

    const actionSet = new Set<RunStepPartActionEnum>();

    selectedRunStepParts.forEach((stepPart) => {
      const actionsForPart = getAvailableRunStepPartActions(stepPart);
      actionsForPart.forEach((action) => actionSet.add(action));
    });

    return (
      <Dropdown align="end">
        <Dropdown.Toggle size="sm" variant="secondary">
          Actions
        </Dropdown.Toggle>
        <Dropdown.Menu>
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

  if (isLoading) {
    return <LoadingComponent message={"Loading run parts"} />;
  }

  if (isError) {
    throw new Error("RunPartsResearchRun should not be loading");
  }

  if (stepParts.length === 0) {
    return null;
  }

  return (
    <Fragment>
      {stepParts && stepParts.length > 0 && (
        <>
          <Table size={"sm"} striped bordered>
            <thead>
              <tr>
                <th></th>
                <th>Part</th>
                <th className={"text-center"}>Status</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {stepParts.map((stepPart: RunStepPart) => {
                const partIsSelected = selectedParts.get(stepPart.id) ?? false;

                return (
                  <RunStepPartTableRow
                    editable={editable}
                    runStepPart={stepPart}
                    key={stepPart.id}
                    reloadFn={effectiveRefetchFn}
                    {...(editable
                      ? {
                          partIsSelected,
                          setPartAsSelected,
                        }
                      : {})}
                  />
                );
              })}
            </tbody>
          </Table>
          {editable && (
            <div>
              <div className="btn-group btn-group-sm" role="group">
                <button className="part-check-all btn btn-outline-secondary" onClick={selectAllParts}>
                  All
                </button>
                <button className="part-check-none btn btn-outline-secondary" onClick={selectNoneParts}>
                  None
                </button>

                {selectedParts.values().some((p) => p) && renderAvailableActions()}
              </div>
            </div>
          )}
        </>
      )}
    </Fragment>
  );
};

export default RunPartsResearchRun;
