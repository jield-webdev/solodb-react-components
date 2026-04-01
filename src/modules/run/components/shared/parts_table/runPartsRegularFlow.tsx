import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Alert, Table } from "react-bootstrap";
import { useQueries, useQueryClient } from "@tanstack/react-query";
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
import { PartActionsButtons } from "./element/partActionsButtons";

// TODO: use a real way to handle the use of either dropdowns or buttons
const USE_DROPDOWN = false;

type Props = {
  run: Run;
  runStep: RunStep;
  refetchFn?: () => void;
};

const RunPartsRegularFlow = ({ run, runStep, refetchFn }: Props) => {
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
    () => (runPartQuery.data?.items as RunPart[]) ?? [],
    [runPartQuery.data]
  );

  const runStepParts = useMemo<RunStepPart[]>(
    () => (runStepPartsQuery.data?.items as RunStepPart[] | undefined) ?? [],
    [runStepPartsQuery.data]
  );

  const effectiveRefetchFn = () => {
    queryClient.invalidateQueries({ queryKey: ["runParts", run.id, runStep.part_level] });
    queryClient.invalidateQueries({ queryKey: ["runStepParts", runStep.id] });

    if (refetchFn) refetchFn();
  };

  useEffect(() => {
    const partsToVerify = runStepParts ?? (runStepPartsQuery.data?.items as RunStepPart[] | undefined) ?? [];
    // verify for the need to finish the step
    finishStepWhenAllPartsAreFinished(runStep, partsToVerify);
  }, [runStepParts]);

  // Use custom hooks for selection and actions
  const { selectedParts, setPartAsSelected, setPartsSelection, selectAllParts, selectNoneParts, hasSelectedParts } =
    usePartSelection({
      parts: runParts ?? [],
    });

  useEffect(() => {
    const selectedIds = Array.from(selectedParts.entries())
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => id);
    queryClient.setQueryData(["runPartSelection", runStep.id], selectedIds);
  }, [queryClient, runStep.id, selectedParts]);

  const { performActionToSelectedParts, getAvailableActionsForSelection } = usePartActions({
    runStep,
    parts: runStepParts,
    selectedParts,
    getPartId: (part) => part.part_id,
    getRunStepPart: (part) => part,
    refetchFn: effectiveRefetchFn,
  });

  const availableActions = useMemo(() => getAvailableActionsForSelection(), [getAvailableActionsForSelection]);

  const traySelections = useMemo(() => {
    const trayPartsMap = new Map<number, { id: number; label: string; partIds: number[] }>();

    runStepParts.forEach((stepPart) => {
      const runPart = runParts.find((p) => p.id === stepPart.part_id);
      const tray = runPart?.tray;
      if (!tray) return;
      const entry = trayPartsMap.get(tray.id) ?? {
        id: tray.id,
        label: tray.name ?? tray.label ?? `Tray ${tray.id}`,
        partIds: [] as number[],
      };
      entry.partIds.push(stepPart.part_id);
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
  }, [run.run_trays, selectedParts, runStepParts]);

  if (isLoading) {
    return <LoadingComponent message={"Loading run parts"} />;
  }

  if (isError) {
    return <div className="text-danger">Error loading run parts.</div>;
  }

  if (runParts.length === 0) {
    return <Alert variant={"warning"}>No parts found for this run step.</Alert>;
  }

  if (runStepParts.length === 0) {
    return <Alert variant={"warning"}>No step parts found for this run step.</Alert>;
  }

  return (
    <Fragment>
      {runParts && runParts.length > 0 && (
        <>
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
              {runParts.map((runPart: RunPart, i: React.Key) => {
                const partIsSelected = selectedParts.get(runPart.id) ?? false;

                return (
                  <RunStepPartProductionTableRow
                    runStep={runStep}
                    runPart={runPart}
                    runStepParts={runStepParts}
                    key={`key-${i}-${runPart.id}`}
                    canInit={run.run_type === RunTypeEnum.PRODUCTION}
                    refetchFn={effectiveRefetchFn}
                    partIsSelected={partIsSelected}
                    setPartAsSelected={setPartAsSelected}
                    dropdown={USE_DROPDOWN}
                  />
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
              USE_DROPDOWN ? (
                <PartActionsDropdown
                  availableActions={availableActions}
                  onActionSelected={performActionToSelectedParts}
                />
              ) : (
                <PartActionsButtons
                  availableActions={availableActions}
                  onActionSelected={performActionToSelectedParts}
                />
              )
            }
          />
        </>
      )}
    </Fragment>
  );
};

export default RunPartsRegularFlow;
