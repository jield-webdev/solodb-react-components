import React, { useEffect, useMemo, useState } from "react";
import { Table } from "react-bootstrap";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import RunPartProductionTableRow from "@jield/solodb-react-components/modules/run/components/shared/parts_table/element/runPartProductionTableRow";
import {
  finishStepWhenAllPartsAreFinished,
  Run,
  RunStep,
  RunStepPart,
  RunPart,
  listRunParts,
  listRunStepParts,
} from "@jield/solodb-typescript-core";
import LoadingComponent from "@jield/solodb-react-components/modules/core/components/common/LoadingComponent";
import { usePartSelection } from "@jield/solodb-react-components/modules/run/hooks/run/parts/usePartSelection";
import { usePartActions } from "@jield/solodb-react-components/modules/run/hooks/run/parts/usePartActions";
import { PartActionsDropdown } from "@jield/solodb-react-components/modules/run/components/shared/parts_table/element/partActionsDropdown";
import { PartSelectionControls } from "@jield/solodb-react-components/modules/run/components/shared/parts_table/element/partSelectionControls";

type Props = {
  run: Run;
  runStep: RunStep;
  runStepParts?: RunStepPart[];
  runParts?: RunPart[];
  refetchFn?: () => void;
};

const RunPartsProductionRun = ({
  run,
  runStep,
  runStepParts,
  runParts,
  refetchFn = () => {},
}: Props) => {
  const queryClient = useQueryClient();
  const [stepParts, setStepParts] = useState<RunStepPart[]>(runStepParts || []);
  const [parts, setParts] = useState<RunPart[]>(runParts || []);
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

  useEffect(() => {
    const partsToVerify = runStepParts ?? (runStepPartsQuery.data?.items as RunStepPart[] | undefined) ?? [];
    // verify for the need to finish the step
    finishStepWhenAllPartsAreFinished(runStep, partsToVerify);
  }, [runStepParts, runStepPartsQuery.data]);

  useEffect(() => {
    if (runParts) {
      setParts(runParts);
      return;
    }
    if (!isLoading && runPartQuery.data) {
      setParts(runPartsData);
    }
  }, [runParts, runPartQuery.data, runPartsData, isLoading]);

  useEffect(() => {
    if (runStepParts) {
      setStepParts(runStepParts);
      finishStepWhenAllPartsAreFinished(runStep, runStepParts);
      return;
    }
    if (!isLoading && runStepPartsQuery.data) {
      setStepParts(runStepPartsData);
      finishStepWhenAllPartsAreFinished(runStep, runStepPartsData);
    }
  }, [runStepParts, runStepPartsQuery.data, runStep, runStepPartsData, isLoading]);

  const leveledParts = useMemo(
    () => parts.filter((part) => part.part_level === runStep.part_level),
    [parts, runStep.part_level]
  );

  // Use custom hooks for selection and actions
  const { selectedParts, setPartAsSelected, selectAllParts, selectNoneParts, hasSelectedParts } = usePartSelection({
    parts: leveledParts,
  });

  useEffect(() => {
    const selectedIds = Array.from(selectedParts.entries())
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => id);
    queryClient.setQueryData(["runPartSelection", runStep.id], selectedIds);
  }, [queryClient, runStep.id, selectedParts]);

  const { performActionToSelectedParts, getAvailableActionsForSelection } = usePartActions({
    runStep,
    parts: leveledParts,
    selectedParts,
    getPartId: (part) => part.id,
    getRunStepPart: (part) => stepParts.find((sp) => sp.part.id === part.id && sp.step.id === runStep.id),
    refetchFn,
  });

  const availableActions = useMemo(() => getAvailableActionsForSelection(), [getAvailableActionsForSelection]);

  // Determine if selected parts have uninitialized items
  const hasInitAction = useMemo(() => {
    const selectedRunParts = leveledParts.filter((part) => selectedParts.get(part.id));
    return selectedRunParts.some(
      (runPart) =>
        !stepParts.find((runStepPart) => runStepPart.part.id === runPart.id && runStepPart.step.id === runStep.id)
    );
  }, [leveledParts, selectedParts, stepParts, runStep.id]);

  const upsertRunStepPart = (items: RunStepPart[], next: RunStepPart) => {
    const index = items.findIndex((item) => item.id === next.id);
    if (index === -1) {
      return [...items, next];
    }
    return items.map((item) => (item.id === next.id ? next : item));
  };

  const updateRunStepPartMutation = useMutation({
    mutationFn: async (nextStepPart: RunStepPart) => nextStepPart,
    onSuccess: (nextStepPart) => {
      setStepParts((current) => upsertRunStepPart(current, nextStepPart));
      queryClient.setQueryData(["runStepParts", runStep.id], (data: any) => {
        if (!data) return data;
        if (Array.isArray(data)) {
          return upsertRunStepPart(data, nextStepPart);
        }
        if (Array.isArray(data.items)) {
          return { ...data, items: upsertRunStepPart(data.items as RunStepPart[], nextStepPart) };
        }
        return data;
      });
      queryClient.setQueryData(["stepParts", runStep.id], (data: any) => {
        if (!data) return data;
        if (Array.isArray(data)) {
          return upsertRunStepPart(data, nextStepPart);
        }
        if (Array.isArray(data.items)) {
          return { ...data, items: upsertRunStepPart(data.items as RunStepPart[], nextStepPart) };
        }
        return data;
      });
    },
  });

  const initSelectedParts = () => {
    const selectedRunParts = leveledParts.filter((part) => selectedParts.get(part.id));
    const partsToInit = selectedRunParts.filter(
      (runPart) =>
        !stepParts.find((runStepPart) => runStepPart.part.id === runPart.id && runStepPart.step.id === runStep.id)
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

  if (isLoading) {
    return <LoadingComponent message={"Loading run parts"} />;
  }
  if (isError) {
    throw new Error("RunPartsProductionRun should not be loading");
  }

  return (
    <React.Fragment>
      {leveledParts.length > 0 && (
        <>
          <Table size={"sm"} striped hover>
            <thead>
              <tr>
                <th></th>
                <th>Part</th>
                <th className={"text-center"}>Status</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {leveledParts.map((runPart: RunPart, i: React.Key) => (
                <RunPartProductionTableRow
                  runStep={runStep}
                  runPart={runPart}
                  runStepParts={stepParts}
                  refetchFn={refetchFn}
                  key={i}
                  partIsSelected={selectedParts.get(runPart.id) ?? false}
                  setPartAsSelected={setPartAsSelected}
                  layout="research"
                  onRunStepPartUpdated={(nextStepPart) => updateRunStepPartMutation.mutate(nextStepPart)}
                />
              ))}
            </tbody>
          </Table>
          <PartSelectionControls
            onSelectAll={selectAllParts}
            onSelectNone={selectNoneParts}
            hasSelectedParts={hasSelectedParts}
            actionsDropdown={
              <PartActionsDropdown
                availableActions={availableActions}
                onActionSelected={performActionToSelectedParts}
                showInitAction={hasInitAction}
                onInitSelected={initSelectedParts}
              />
            }
          />
        </>
      )}
    </React.Fragment>
  );
};

export default RunPartsProductionRun;
