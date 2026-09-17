import { Badge, Card, ListGroup } from "react-bootstrap";
import { FloorPlanTarget, targetKey } from "@jield/solodb-react-components/modules/room/utils/floorPlanTargets";

export default function FloorPlanTargetList({
  title,
  targets,
  selectedKey,
  stagedKeys,
  sentinelRef,
  isFetching,
  isError,
  disabled,
  onSelect,
  onPress,
}: {
  title: string;
  targets: FloorPlanTarget[];
  selectedKey: string | null;
  stagedKeys: Set<string>;
  sentinelRef: (node?: Element | null) => void;
  isFetching: boolean;
  isError: boolean;
  disabled: boolean;
  onSelect: (target: FloorPlanTarget) => void;
  onPress: (target: FloorPlanTarget) => void;
}) {
  return (
    <Card className="mb-3">
      <Card.Header>{title}</Card.Header>
      <ListGroup variant="flush" className="floor-plan-targets">
        {targets.map((target) => {
          const key = targetKey(target);
          const isSelected = key === selectedKey;
          const isStaged = stagedKeys.has(key);

          return (
            <ListGroup.Item
              key={key}
              action
              active={isSelected}
              disabled={disabled}
              onPointerDown={disabled ? undefined : (event) => event.button === 0 && onPress(target)}
              onClick={() => onSelect(target)}
              className="d-flex justify-content-between align-items-center"
            >
              <span className="floor-plan-target__label">{target.label}</span>
              <span className="d-flex align-items-center gap-2 flex-shrink-0">
                {isStaged ? (
                  <Badge bg="primary">Unsaved</Badge>
                ) : (
                  target.floorPlanItemId !== null && <Badge bg="secondary">Placed</Badge>
                )}
              </span>
            </ListGroup.Item>
          );
        })}
        {isError && <ListGroup.Item className="text-danger">Failed to load {title.toLowerCase()}</ListGroup.Item>}
        {!isError && !isFetching && targets.length === 0 && (
          <ListGroup.Item className="text-muted">Nothing to place</ListGroup.Item>
        )}
        <div ref={sentinelRef} className="px-3 py-1 text-muted small">
          {isFetching && "Loading..."}
        </div>
      </ListGroup>
    </Card>
  );
}
