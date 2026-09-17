import { ReactNode, SVGProps } from 'react';
import { PolygonPoints } from '@jield/solodb-typescript-core';
import { FloorPlanPolygonData } from '../../partial/floorPlanPolygon';
export default function EditableFloorPlanShape({ polygon, points, isDragging, unitsPerPixel, groupProps, shapeProps, children, }: {
    polygon: FloorPlanPolygonData;
    points: PolygonPoints;
    isDragging: boolean;
    unitsPerPixel: number;
    groupProps: SVGProps<SVGGElement>;
    shapeProps: SVGProps<SVGPolygonElement>;
    children: ReactNode;
}): import("react").JSX.Element;
