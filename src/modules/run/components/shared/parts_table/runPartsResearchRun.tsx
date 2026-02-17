import { Fragment, useEffect, useMemo, useState } from "react";
import { Table } from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";
import RunStepPartTableRow from "@jield/solodb-react-components/modules/run/components/shared/parts/runStepPartTableRow";
import { listRunStepParts, Run, RunStep, RunStepPart } from "@jield/solodb-typescript-core";
import LoadingComponent from "@jield/solodb-react-components/modules/core/components/common/LoadingComponent";
import { usePartSelection } from "@jield/solodb-react-components/modules/run/hooks/run/parts/usePartSelection";
import { usePartActions } from "@jield/solodb-react-components/modules/run/hooks/run/parts/usePartActions";
import { PartActionsDropdown } from "@jield/solodb-react-components/modules/run/components/shared/parts_table/element/partActionsDropdown";
import { PartSelectionControls } from "@jield/solodb-react-components/modules/run/components/shared/parts_table/element/partSelectionControls";

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

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["stepParts", runStep.id],
    queryFn: () => listRunStepParts({ step: runStep }),
    enabled: !runStepParts, // Only run the query if runStepParts is not provided
  });

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

  // Use custom hooks for selection and actions
  const { selectedParts, setPartAsSelected, selectAllParts, selectNoneParts, hasSelectedParts } =
    usePartSelection({
      parts: stepParts,
      getPartId: (part) => part.id,
      toggleRef: toggleRunStepPartRef,
    });

  const { performActionToSelectedParts, getAvailableActionsForSelection } = usePartActions({
    runStep,
    parts: stepParts,
    selectedParts,
    getPartId: (part) => part.id,
    getRunStepPart: (part) => part, // Research uses RunStepPart directly
    refetchFn: effectiveRefetchFn,
  });

  const availableActions = useMemo(
    () => getAvailableActionsForSelection(),
    [getAvailableActionsForSelection]
  );

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
            <PartSelectionControls
              onSelectAll={selectAllParts}
              onSelectNone={selectNoneParts}
              hasSelectedParts={hasSelectedParts}
              actionsDropdown={
                <PartActionsDropdown
                  availableActions={availableActions}
                  onActionSelected={performActionToSelectedParts}
                />
              }
            />
          )}
        </>
      )}
    </Fragment>
  );
};

export default RunPartsResearchRun;
