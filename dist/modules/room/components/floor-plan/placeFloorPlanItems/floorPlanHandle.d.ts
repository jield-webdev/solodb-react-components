import { PointerEvent } from 'react';
import { PolygonPoint } from '@jield/solodb-typescript-core';
export default function FloorPlanHandle({ point, unitsPerPixel, onPointerDown, }: {
    point: PolygonPoint;
    unitsPerPixel: number;
    onPointerDown: (event: PointerEvent<SVGCircleElement>) => void;
}): import("react").JSX.Element;
