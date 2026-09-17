import { PolygonPoint, PolygonPoints } from '@jield/solodb-typescript-core';
export default function FloorPlanDraftPolygon({ points, pointer, canClose, unitsPerPixel, onClose, }: {
    points: PolygonPoints;
    pointer: PolygonPoint | null;
    canClose: boolean;
    unitsPerPixel: number;
    onClose: () => void;
}): import("react").JSX.Element | null;
