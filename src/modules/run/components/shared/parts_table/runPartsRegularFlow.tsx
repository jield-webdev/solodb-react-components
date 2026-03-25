import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Alert, Table } from "react-bootstrap";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import RunStepPartProductionTableRow from "@jield/solodb-react-components/modules/run/components/shared/parts_table/element/runPartProductionTableRow";
import {
  finishStepWhenAllPartsAreFinished,
  listRunParts,
  listRunStepParts,
  Run,
  RunPart,
  RunStep,
  RunStepPart,
  RunTypeEnum,
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

const RunPartsRegularFlow = ({ run, runStep, runStepParts, runParts, refetchFn }: Props) => {
  const [stepParts, setStepParts] = useState<RunStepPart[]>(runStepParts || []);

  const queryClient = useQueryClient();
  const queries = useQueries({
    queries: [
      {
        queryKey: ["runParts", run.id, runStep.part_level],
        queryFn: () => listRunParts({ run: run, level: runStep.part_level }),
        enabled: true, // don't fetch if runParts prop provided
      },
      {
        queryKey: ["runStepParts", runStep.id],
        queryFn: () => listRunStepParts({ step: runStep }),
        enabled: true, // don't fetch if runStepParts prop provided
      },
    ],
  });

  const effectiveRefetchFn = refetchFn ?? (() => {});
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
    if (runStepParts) {
      setStepParts(runStepParts);
      // verify for the need to finish the step
      finishStepWhenAllPartsAreFinished(runStep, runStepParts);
    }
  }, [stepParts]);

  // Use custom hooks for selection and actions
  const { selectedParts, setPartAsSelected, setPartsSelection, selectAllParts, selectNoneParts, hasSelectedParts } =
    usePartSelection({
      parts: runStepPartsData,
    });

  useEffect(() => {
    const selectedIds = Array.from(selectedParts.entries())
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => id);
    queryClient.setQueryData(["runPartSelection", runStep.id], selectedIds);
  }, [queryClient, runStep.id, selectedParts]);

  const { performActionToSelectedParts, getAvailableActionsForSelection } = usePartActions({
    runStep,
    parts: stepParts,
    selectedParts,
    getPartId: (part) => part.part.id,
    getRunStepPart: (part) => part,
    refetchFn: effectiveRefetchFn,
  });

  const availableActions = useMemo(() => getAvailableActionsForSelection(), [getAvailableActionsForSelection]);

  const traySelections = useMemo(() => {
    const trayPartsMap = new Map<number, { id: number; label: string; partIds: number[] }>();

    stepParts.forEach((stepPart) => {
      const tray = stepPart.part.tray;
      if (!tray) return;
      const entry = trayPartsMap.get(tray.id) ?? {
        id: tray.id,
        label: tray.name ?? tray.label ?? `Tray ${tray.id}`,
        partIds: [] as number[],
      };
      entry.partIds.push(stepPart.part.id);
      trayPartsMap.set(tray.id, entry);
    });

    if (trayPartsMap.size === 0) {
      return [];
    }

    const trays = [...(run.run_trays ?? [])].sort((a, b) => a.sequence - b.sequence);
    const orderedTrays =
      trays.length > 0
        ? trays
            .filter((tray) => trayPartsMap.has(tray.id))
            .map((tray) => {
              const entry = trayPartsMap.get(tray.id)!;
              return {
                ...entry,
                label: tray.name ?? tray.label ?? entry.label,
              };
            })
        : Array.from(trayPartsMap.values()).sort((a, b) => a.label.localeCompare(b.label));

    return orderedTrays.map((tray) => ({
      ...tray,
      allSelected: tray.partIds.every((partId) => selectedParts.get(partId)),
    }));
  }, [run.run_trays, selectedParts, stepParts]);

  if (isLoading) {
    return <LoadingComponent message={"Loading run parts"} />;
  }

  if (isError) {
    return <div className="text-danger">Error loading run parts.</div>;
  }

  if (runPartsData.length === 0) {
    return <Alert variant={"warning"}>No parts found for this run step.</Alert>;
  }

  if (runStepPartsData.length === 0) {
    return <Alert variant={"warning"}>No step parts found for this run step.</Alert>;
  }

  return (
    <Fragment>
      {runPartsData && runPartsData.length > 0 && (
        <>
          <Table size={"sm"} striped hover>
            <thead>
              <tr>
                <th colSpan={2}>Part</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Comment</th>
                <th>debug</th>
              </tr>
            </thead>
            <tbody>
              {runPartsData.map((runPart: RunPart, i: React.Key) => {
                const partIsSelected = selectedParts.get(runPart.id) ?? false;

                return (
                  <>
                    <RunStepPartProductionTableRow
                      runStep={runStep}
                      runPart={runPart}
                      runStepParts={runStepPartsData}
                      key={`key-${i}-${runPart.id}`}
                      canInit={run.run_type === RunTypeEnum.PRODUCTION}
                      refetchFn={effectiveRefetchFn}
                      partIsSelected={partIsSelected}
                      setPartAsSelected={setPartAsSelected}
                      dropdown={true}
                    />
                  </>
                );
              })}
            </tbody>
          </Table>
          <PartSelectionControls
            onSelectAll={selectAllParts}
            onSelectNone={selectNoneParts}
            hasSelectedParts={hasSelectedParts}
            traySelections={traySelections}
            onToggleTray={(partIds, nextSelected) => setPartsSelection(partIds, nextSelected)}
            actionsDropdown={
              <PartActionsDropdown
                availableActions={availableActions}
                onActionSelected={performActionToSelectedParts}
              />
            }
          />
        </>
      )}
    </Fragment>
  );
};

export default RunPartsRegularFlow;
