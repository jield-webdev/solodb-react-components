import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Alert, Col, Row } from "react-bootstrap";
import { getRoom } from "@jield/solodb-typescript-core";
import LoadingComponent from "@jield/solodb-react-components/modules/core/components/common/LoadingComponent";
import { usePressedItem } from "@jield/solodb-react-components/modules/core/hooks/usePressedItem";
import { useFloorPlanSelection } from "@jield/solodb-react-components/modules/room/hooks/useFloorPlanSelection";
import { useRoomFloorPlan } from "@jield/solodb-react-components/modules/room/hooks/useRoomFloorPlan";
import { useRoomFloorPlanTargets } from "@jield/solodb-react-components/modules/room/hooks/useRoomFloorPlanTargets";
import { FloorPlanTarget } from "@jield/solodb-react-components/modules/room/utils/floorPlanTargets";
import FloorPlanEditor from "./placeFloorPlanItems/floorPlanEditor";
import FloorPlanInstruction from "./placeFloorPlanItems/floorPlanInstruction";
import FloorPlanTargetList from "./placeFloorPlanItems/floorPlanTargetList";

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
  const editor = useFloorPlanSelection({ roomId, floorPlan, targetsByKey });
  const pressedTarget = usePressedItem<FloorPlanTarget>();

  const pressTarget = (target: FloorPlanTarget) => {
    pressedTarget.press(target);
    editor.selectTarget(target);
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

  const listProps = {
    selectedKey: editor.selectedKey,
    stagedKeys: editor.stagedKeys,
    disabled: editor.isBusy,
    onSelect: editor.selectTarget,
    onPress: pressTarget,
  };

  return (
    <div className={"floor-plan-page" + (editor.selection?.kind === "draw" ? " floor-plan-page--placing" : "")}>
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
              polygons={editor.polygons}
              selection={editor.selection}
              draft={editor.draft}
              isDraggingTarget={pressedTarget.item !== null}
              onComplete={editor.completeDraft}
              onSelectPolygon={editor.selectPolygon}
              onChangePolygon={editor.changePolygon}
              onCancel={editor.cancel}
              onStopEditing={editor.stopEditing}
              onDelete={editor.deleteSelected}
              onRemove={editor.removeSelected}
              isBusy={editor.isBusy}
            />
          </Col>
          <Col md={4} className="floor-plan-layout__sidebar">
            <FloorPlanTargetList
              title="Equipment"
              targets={equipment.targets}
              sentinelRef={equipment.sentinelRef}
              isFetching={equipment.isFetching}
              isError={equipment.isError}
              {...listProps}
            />
            <FloorPlanTargetList
              title="Zone groups"
              targets={zoneGroups.targets}
              sentinelRef={zoneGroups.sentinelRef}
              isFetching={zoneGroups.isFetching}
              isError={zoneGroups.isError}
              {...listProps}
            />
            <FloorPlanInstruction selection={editor.selection} draft={editor.draft} />
          </Col>
        </Row>
      )}
    </div>
  );
}
