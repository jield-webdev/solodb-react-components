import { PolygonPoint, PolygonPoints } from '@jield/solodb-typescript-core';
export interface PolygonDraft {
    points: PolygonPoints;
    canClose: boolean;
    addPoint: (point: PolygonPoint) => void;
    undoPoint: () => void;
    reset: () => void;
}
export declare function usePolygonDraft(): PolygonDraft;
