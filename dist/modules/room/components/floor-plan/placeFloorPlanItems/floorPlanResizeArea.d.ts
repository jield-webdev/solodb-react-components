import { PointerEvent } from 'react';
import { RectangleArea } from '../../../utils/floorPlanGeometry';
export default function FloorPlanResizeArea({ area, cursor, onPointerDown, }: {
    area: RectangleArea;
    cursor: string;
    onPointerDown: (event: PointerEvent<SVGRectElement>) => void;
}): import("react").JSX.Element;
