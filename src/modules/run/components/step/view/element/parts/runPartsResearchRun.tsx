import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Dropdown, Table } from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";
import RunStepPartTableRow from "@jield/solodb-react-components/modules/run/components/shared/parts/runStepPartTableRow";
import {
  getAvailableRunStepPartActions,
  listRunStepParts,
  Run,
  RunStep,
  RunStepPart,
  RunStepPartActionEnum,
} from "@jield/solodb-typescript-core";
import LoadingComponent from "@jield/solodb-react-components/modules/core/components/common/LoadingComponent";

type RunPartsResearchRunProps = {
  run: Run;
  runStep: RunStep;
  runStepParts?: RunStepPart[];
  editable?: boolean;
  refetchFn?: () => void;
};

const RunPartsResearchRun = ({
  run: _run,
  runStep,
  runStepParts,
  editable = true,
  refetchFn,
}: RunPartsResearchRunProps) => {
  const [stepParts, setStepParts] = useState<RunStepPart[]>(runStepParts || []);
  const effectiveRefetchFn = refetchFn ?? (() => {});

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["stepParts", runStep.id],
    queryFn: () => listRunStepParts({ step: runStep }),
    enabled: !runStepParts, // Only run the query if runStepParts is not provided
  });

  // to handle what parts are selected in order to perform multi actions on them
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
    setSelectedParts((prev) => {
      const next = new Map(prev);
      next.set(partID, !(prev.get(partID) ?? false));
      return next;
    });
  }, []);

  const selectAllParts = useCallback(() => {
    setSelectedParts((prev) => new Map([...prev.keys()].map((key) => [key, true])));
  }, []);

  const selectNoneParts = useCallback(() => {
    setSelectedParts((prev) => new Map([...prev.keys()].map((key) => [key, false])));
  }, []);

  const selectedStepParts = useMemo(
    () => stepParts.filter((part) => selectedParts.get(part.id)),
    [stepParts, selectedParts]
  );
  const hasSelectedParts = selectedStepParts.length > 0;

  const actionSet = useMemo(() => {
    const set = new Set<RunStepPartActionEnum>();
    selectedStepParts.forEach((stepPart) => {
      const actionsForPart = getAvailableRunStepPartActions(stepPart);
      actionsForPart.forEach((action) => set.add(action));
    });
    return set;
  }, [selectedStepParts]);

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
              {stepParts.map((stepPart: RunStepPart) => (
                <RunStepPartTableRow
                  editable={editable}
                  runStepPart={stepPart}
                  key={stepPart.id}
                  reloadFn={effectiveRefetchFn}
                  {...(editable
                    ? {
                        partIsSelected: selectedParts.get(stepPart.id) ?? false,
                        setPartAsSelected,
                      }
                    : {})}
                />
              ))}
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

                {hasSelectedParts && actionSet.size > 0 && (
                  <Dropdown>
                    <Dropdown.Toggle size="sm" variant="outline-primary">
                      Actions
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {actionSet.has(RunStepPartActionEnum.START_PROCESSING) && (
                        <Dropdown.Item onClick={() => false}>Start</Dropdown.Item>
                      )}

                      {actionSet.has(RunStepPartActionEnum.FINISH_PROCESSING) && (
                        <Dropdown.Item onClick={() => false}>Finish</Dropdown.Item>
                      )}

                      {actionSet.has(RunStepPartActionEnum.FAILED_PROCESSING) && (
                        <Dropdown.Item onClick={() => false}>Failed</Dropdown.Item>
                      )}

                      {actionSet.has(RunStepPartActionEnum.REWORK) && (
                        <Dropdown.Item onClick={() => false}>Rework</Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </Fragment>
  );
};

export default RunPartsResearchRun;
