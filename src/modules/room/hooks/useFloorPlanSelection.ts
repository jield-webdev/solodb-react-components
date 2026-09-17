import { useMemo, useState } from "react";
import { FloorPlan, PolygonPoints } from "@jield/solodb-typescript-core";
import { FloorPlanPolygonData } from "@jield/solodb-react-components/modules/room/components/partial/floorPlanPolygon";
import { usePolygonDraft } from "@jield/solodb-react-components/modules/room/hooks/usePolygonDraft";
import { useSaveFloorPlanItems } from "@jield/solodb-react-components/modules/room/hooks/useSaveFloorPlanItems";
import { useUnplaceFloorPlanItem } from "@jield/solodb-react-components/modules/room/hooks/useUnplaceFloorPlanItem";
import {
  buildFloorPlanPolygons,
  FloorPlanTarget,
  StagedFloorPlanItem,
  targetKey,
} from "@jield/solodb-react-components/modules/room/utils/floorPlanTargets";

export type FloorPlanSelection =
  { kind: "draw"; target: FloorPlanTarget } | { kind: "edit"; polygon: FloorPlanPolygonData };

type SelectionState = { kind: "draw"; target: FloorPlanTarget } | { kind: "edit"; key: string };

export function useFloorPlanSelection({
  roomId,
  floorPlan,
  targetsByKey,
}: {
  roomId: number;
  floorPlan: FloorPlan | undefined;
  targetsByKey: Map<string, FloorPlanTarget>;
}) {
  const [selectionState, setSelectionState] = useState<SelectionState | null>(null);
  const [stagedItems, setStagedItems] = useState<StagedFloorPlanItem[]>([]);
  const draft = usePolygonDraft();
  const saveMutation = useSaveFloorPlanItems();
  const unplaceMutation = useUnplaceFloorPlanItem();

  const stagedKeys = useMemo(() => new Set(stagedItems.map((item) => targetKey(item.target))), [stagedItems]);
  const polygons = useMemo(
    () => (floorPlan ? buildFloorPlanPolygons(floorPlan, stagedItems, targetsByKey) : []),
    [floorPlan, stagedItems, targetsByKey]
  );

  const selection = useMemo((): FloorPlanSelection | null => {
    if (selectionState?.kind !== "edit") return selectionState;

    const polygon = polygons.find((candidate) => candidate.key === selectionState.key);
    return polygon ? { kind: "edit", polygon } : null;
  }, [selectionState, polygons]);
  const selectedKey = selection
    ? selection.kind === "draw"
      ? targetKey(selection.target)
      : selection.polygon.key
    : null;

  const select = (next: SelectionState | null) => {
    setSelectionState(next);
    draft.reset();
  };

  const saveItems = (items: StagedFloorPlanItem[]) => {
    if (!floorPlan || items.length === 0) return;

    saveMutation.mutate(
      { roomId, floorPlan, items },
      {
        onSuccess: () => {
          const savedItems = new Set(items);
          setStagedItems((current) => current.filter((item) => !savedItems.has(item)));
        },
      }
    );
  };

  const saveBeforeLeaving = (nextKey: string) => {
    if (selection?.kind === "edit" && selectedKey !== nextKey) saveItems(stagedItems);
  };

  const upsertStagedItem = (target: FloorPlanTarget, points: PolygonPoints) => {
    const item = { target, points };
    setStagedItems((prev) => [...prev.filter((item) => targetKey(item.target) !== targetKey(target)), item]);
    return item;
  };

  const selectTarget = (target: FloorPlanTarget) => {
    const key = targetKey(target);
    if (key === selectedKey) return;

    saveBeforeLeaving(key);
    const polygon = polygons.find((candidate) => candidate.key === key);
    select(polygon ? { kind: "edit", key } : { kind: "draw", target });
  };

  const selectPolygon = (polygon: FloorPlanPolygonData) => {
    saveBeforeLeaving(polygon.key);
    select({ kind: "edit", key: polygon.key });
  };

  const changePolygon = (polygon: FloorPlanPolygonData, points: PolygonPoints) => {
    upsertStagedItem(polygon.target, points);
  };

  const completeDraft = (points: PolygonPoints) => {
    if (selection?.kind !== "draw") return;

    saveItems([upsertStagedItem(selection.target, points)]);
    select(null);
  };

  const cancel = () => select(null);

  const stopEditing = () => {
    saveItems(stagedItems);
    select(null);
  };

  const deleteSelected = () => {
    if (selection?.kind !== "edit") return;

    setStagedItems((prev) => prev.filter((staged) => targetKey(staged.target) !== selection.polygon.key));
    select(null);
  };

  const removeSelected = () => {
    if (!floorPlan || selection?.kind !== "edit") return;

    const { polygon } = selection;
    if (confirm(`Are you sure you want to unplace ${polygon.target.label}? You can not undo this action`)) {
      setStagedItems((current) => current.filter((item) => targetKey(item.target) !== polygon.key));
      select(null);
      unplaceMutation.mutate({ floorPlan, polygon });
    }
  };

  return {
    selection,
    selectedKey,
    stagedKeys,
    polygons,
    draft,
    isBusy: saveMutation.isPending || unplaceMutation.isPending,
    selectTarget,
    selectPolygon,
    changePolygon,
    completeDraft,
    cancel,
    stopEditing,
    deleteSelected,
    removeSelected,
  };
}
