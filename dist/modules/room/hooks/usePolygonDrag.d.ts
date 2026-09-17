import { PointerEvent } from 'react';
import { FloorPlan, PolygonPoints } from '@jield/solodb-typescript-core';
import { RectangleHandle } from '../utils/floorPlanGeometry';
export type PolygonDragHandle = {
    kind: "move";
} | {
    kind: "vertex";
    index: number;
} | {
    kind: "resize";
    handle: RectangleHandle;
};
export declare function usePolygonDrag({ floorPlan, points, onCommit, }: {
    floorPlan: FloorPlan;
    points: PolygonPoints;
    onCommit: (points: PolygonPoints) => void;
}): {
    points: PolygonPoints;
    isDragging: boolean;
    startDrag: (event: PointerEvent<SVGElement>, handle: PolygonDragHandle) => void;
    groupProps: {
        onPointerMove: (event: PointerEvent<SVGGElement>) => void;
        onPointerUp: () => void;
        onPointerCancel: () => void;
    };
};
