import { FloorPlan, PolygonPoints } from '@jield/solodb-typescript-core';
import { FloorPlanPolygonData } from '../../partial/floorPlanPolygon';
import { FloorPlanSelection } from '../../../hooks/useFloorPlanSelection';
import { PolygonDraft } from '../../../hooks/usePolygonDraft';
export default function FloorPlanEditor({ floorPlan, polygons, selection, draft, isDraggingTarget, onComplete, onSelectPolygon, onChangePolygon, onCancel, onStopEditing, onDelete, onRemove, isBusy, }: {
    floorPlan: FloorPlan;
    polygons: FloorPlanPolygonData[];
    selection: FloorPlanSelection | null;
    draft: PolygonDraft;
    isDraggingTarget: boolean;
    onComplete: (points: PolygonPoints) => void;
    onSelectPolygon: (polygon: FloorPlanPolygonData) => void;
    onChangePolygon: (polygon: FloorPlanPolygonData, points: PolygonPoints) => void;
    onCancel: () => void;
    onStopEditing: () => void;
    onDelete: () => void;
    onRemove: () => void;
    isBusy: boolean;
}): import("react").JSX.Element;
