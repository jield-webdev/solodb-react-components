import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Alert, Col, Row } from "react-bootstrap";
import { FloorPlan, getRoom, PolygonPoints } from "@jield/solodb-typescript-core";
import LoadingComponent from "@jield/solodb-react-components/modules/core/components/common/LoadingComponent";
import { FloorPlanPolygonData } from "@jield/solodb-react-components/modules/room/components/partial/floorPlanPolygon";
import { usePolygonDraft } from "@jield/solodb-react-components/modules/room/hooks/usePolygonDraft";
import { useRoomFloorPlan } from "@jield/solodb-react-components/modules/room/hooks/useRoomFloorPlan";
import { useRoomFloorPlanTargets } from "@jield/solodb-react-components/modules/room/hooks/useRoomFloorPlanTargets";
import { useSaveFloorPlanItems } from "@jield/solodb-react-components/modules/room/hooks/useSaveFloorPlanItems";
import { useUnplaceFloorPlanItem } from "@jield/solodb-react-components/modules/room/hooks/useUnplaceFloorPlanItem";
import {
  buildFloorPlanPolygons,
  FloorPlanTarget,
  StagedFloorPlanItem,
  targetKey,
} from "@jield/solodb-react-components/modules/room/utils/floorPlanTargets";
import FloorPlanEditor from "./placeFloorPlanItems/floorPlanEditor";
import { FloorPlanSelection } from "./placeFloorPlanItems/floorPlanEditorToolbar";
import FloorPlanTargetList from "./placeFloorPlanItems/floorPlanTargetList";

type SelectionState = { kind: "draw"; target: FloorPlanTarget } | { kind: "edit"; key: string };

export default function PlaceFloorPlanItems() {
  const { id, environment } = useParams();
  const roomId = Number(id);

  const roomQuery = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => getRoom({ id: roomId }),
  });

  const floorPlansQuery = useRoomFloorPlan(roomId);
  const { floorPlan } = floorPlansQuery;

  const { equipment, zoneGroups, targetsByKey } = useRoomFloorPlanTargets({ roomId, environment });

  const [selectionState, setSelectionState] = useState<SelectionState | null>(null);
  const [stagedItems, setStagedItems] = useState<StagedFloorPlanItem[]>([]);
  const draft = usePolygonDraft();
  const saveMutation = useSaveFloorPlanItems();

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

  const selectTarget = (target: FloorPlanTarget) => {
    if (selection?.kind === "edit" && selectedKey !== targetKey(target)) saveItems(stagedItems);

    const polygon = polygons.find((candidate) => candidate.key === targetKey(target));
    select(polygon ? { kind: "edit", key: polygon.key } : { kind: "draw", target });
  };

  const upsertStagedItem = (target: FloorPlanTarget, points: PolygonPoints) => {
    const item = { target, points };
    setStagedItems((prev) => [...prev.filter((item) => targetKey(item.target) !== targetKey(target)), item]);
    return item;
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

  const completeDraft = (points: PolygonPoints) => {
    if (selection?.kind !== "draw") return;

    const item = upsertStagedItem(selection.target, points);
    saveItems([item]);
    select(null);
  };

  const deleteSelectedPolygon = () => {
    if (selection?.kind !== "edit") return;

    setStagedItems((prev) => prev.filter((staged) => targetKey(staged.target) !== selection.polygon.key));
    select(null);
  };

  const unplaceMutation = useUnplaceFloorPlanItem();

  const stopEditing = () => {
    saveItems(stagedItems);
    select(null);
  };

  const selectPolygon = (polygon: FloorPlanPolygonData) => {
    if (selection?.kind === "edit" && selectedKey !== polygon.key) saveItems(stagedItems);
    select({ kind: "edit", key: polygon.key });
  };

  const unplacePolygon = (activeFloorPlan: FloorPlan, polygon: FloorPlanPolygonData) => {
    if (confirm(`Are you sure you want to unplace ${polygon.target.label}? You can not undo this action`)) {
      setStagedItems((current) => current.filter((item) => targetKey(item.target) !== polygon.key));
      select(null);
      unplaceMutation.mutate({ floorPlan: activeFloorPlan, polygon });
    }
  };

  const removeSelectedPolygon = () => {
    if (floorPlan && selection?.kind === "edit") unplacePolygon(floorPlan, selection.polygon);
  };

  if (roomQuery.isError || floorPlansQuery.isError) {
    return (
      <Alert variant="danger" className="my-3">
        Error loading:{" "}
        {[roomQuery.error, floorPlansQuery.error]
          .filter((queryError) => queryError !== null)
          .map((queryError) => (
            <span key={queryError.message}>{queryError.message}</span>
          ))}
      </Alert>
    );
  }

  if (roomQuery.isLoading || floorPlansQuery.isLoading) {
    return <LoadingComponent message="Loading floor plan..." />;
  }

  return (
    <div className="floor-plan-page">
      <div className="floor-plan-page__header d-flex flex-wrap align-items-center gap-2">
        <h1 className="floor-plan-page__title">Place items on floor plan of {roomQuery.data?.name}</h1>
        <a href={`/${environment}/room/details/${roomId}/general.html`} className="btn btn-sm btn-outline-primary">
          Return to room
        </a>
      </div>

      {!floorPlan ? (
        <Alert variant="warning">This room has no floor plan yet, upload one before placing items.</Alert>
      ) : (
        <Row className="floor-plan-layout">
          <Col md={8} className="floor-plan-layout__map">
            <FloorPlanEditor
              floorPlan={floorPlan}
              polygons={polygons}
              selection={selection}
              draft={draft}
              onComplete={completeDraft}
              onSelectPolygon={selectPolygon}
              onChangePolygon={(polygon, points) => upsertStagedItem(polygon.target, points)}
              onCancel={() => select(null)}
              onStopEditing={stopEditing}
              onDelete={deleteSelectedPolygon}
              onRemove={removeSelectedPolygon}
              isBusy={saveMutation.isPending || unplaceMutation.isPending}
            />
          </Col>
          <Col md={4} className="floor-plan-layout__sidebar">
            <FloorPlanTargetList
              title="Equipment"
              targets={equipment.targets}
              selectedKey={selectedKey}
              stagedKeys={stagedKeys}
              sentinelRef={equipment.sentinelRef}
              isFetching={equipment.isFetching}
              isError={equipment.isError}
              disabled={saveMutation.isPending || unplaceMutation.isPending}
              onSelect={selectTarget}
            />
            <FloorPlanTargetList
              title="Zone groups"
              targets={zoneGroups.targets}
              selectedKey={selectedKey}
              stagedKeys={stagedKeys}
              sentinelRef={zoneGroups.sentinelRef}
              isFetching={zoneGroups.isFetching}
              isError={zoneGroups.isError}
              disabled={saveMutation.isPending || unplaceMutation.isPending}
              onSelect={selectTarget}
            />
          </Col>
        </Row>
      )}
    </div>
  );
}
