import { FloorPlan, PolygonPoints } from '@jield/solodb-typescript-core';
import { FloorPlanPolygonData } from '../components/partial/floorPlanPolygon';
import { FloorPlanTarget } from '../utils/floorPlanTargets';
export type FloorPlanSelection = {
    kind: "draw";
    target: FloorPlanTarget;
} | {
    kind: "edit";
    polygon: FloorPlanPolygonData;
};
export declare function useFloorPlanSelection({ roomId, floorPlan, targetsByKey, }: {
    roomId: number;
    floorPlan: FloorPlan | undefined;
    targetsByKey: Map<string, FloorPlanTarget>;
}): {
    selection: FloorPlanSelection | null;
    selectedKey: string | null;
    stagedKeys: Set<string>;
    polygons: FloorPlanPolygonData[];
    draft: import('./usePolygonDraft').PolygonDraft;
    isBusy: boolean;
    selectTarget: (target: FloorPlanTarget) => void;
    selectPolygon: (polygon: FloorPlanPolygonData) => void;
    changePolygon: (polygon: FloorPlanPolygonData, points: PolygonPoints) => void;
    completeDraft: (points: PolygonPoints) => void;
    cancel: () => void;
    stopEditing: () => void;
    deleteSelected: () => void;
    removeSelected: () => void;
};
