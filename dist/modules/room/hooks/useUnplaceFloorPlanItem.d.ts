import { FloorPlan } from '@jield/solodb-typescript-core';
import { FloorPlanPolygonData } from '../components/partial/floorPlanPolygon';
export declare function useUnplaceFloorPlanItem(): import('@tanstack/react-query').UseMutationResult<void, Error, {
    floorPlan: FloorPlan;
    polygon: FloorPlanPolygonData;
}, import('../utils/floorPlanCache').FloorPlanCacheSnapshot>;
