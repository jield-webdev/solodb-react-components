import { ReactNode } from 'react';
import { FloorPlan, PolygonPoint } from '@jield/solodb-typescript-core';
import { FloorPlanPolygonData } from './floorPlanPolygon';
type PointHandler = (point: PolygonPoint) => void;
export default function FloorPlanView({ floorPlan, polygons, onClick, onPointerMove, onPointerUp, onPointerLeave, onPolygonClick, children, }: {
    floorPlan: FloorPlan;
    polygons: FloorPlanPolygonData[];
    onClick?: PointHandler;
    onPointerMove?: PointHandler;
    onPointerUp?: PointHandler;
    onPointerLeave?: () => void;
    onPolygonClick?: (polygon: FloorPlanPolygonData) => void;
    children?: (unitsPerPixel: number) => ReactNode;
}): import("react").JSX.Element;
export {};
