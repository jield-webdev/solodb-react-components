import { ReactNode, SVGProps } from 'react';
import { PolygonPoints } from '@jield/solodb-typescript-core';
import { FloorPlanTarget, FloorPlanTargetType } from '../../utils/floorPlanTargets';
export interface FloorPlanPolygonData {
    key: string;
    target: FloorPlanTarget;
    points: PolygonPoints;
    variant: "existing" | "staged";
}
export default function FloorPlanPolygon({ points, label, targetType, variant, unitsPerPixel, className, groupProps, shapeProps, children, }: {
    points: PolygonPoints;
    label: string;
    targetType: FloorPlanTargetType;
    variant: FloorPlanPolygonData["variant"];
    unitsPerPixel: number;
    className?: string;
    groupProps?: SVGProps<SVGGElement>;
    shapeProps?: SVGProps<SVGPolygonElement>;
    children?: ReactNode;
}): import("react").JSX.Element;
