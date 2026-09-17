import { FloorPlan, PolygonPoint, PolygonPoints } from '@jield/solodb-typescript-core';
export declare const toSvgPoints: (points: PolygonPoints) => string;
export declare const polygonCentroid: (points: PolygonPoints) => PolygonPoint;
export declare function clientToFloorPlanPoint(svg: SVGSVGElement, floorPlan: FloorPlan, { clientX, clientY }: {
    clientX: number;
    clientY: number;
}): PolygonPoint;
export declare function movePolygonPoints(points: PolygonPoints, floorPlan: FloorPlan, delta: PolygonPoint, vertexIndex: number | null): PolygonPoints;
export declare const samePoints: (a: PolygonPoints, b: PolygonPoints) => boolean;
export declare const equipmentSquareSize: ({ width, height }: Pick<FloorPlan, "width" | "height">) => number;
export interface RectangleHandle {
    x: "left" | "right" | null;
    y: "top" | "bottom" | null;
}
export interface RectangleArea {
    x: number;
    y: number;
    width: number;
    height: number;
}
export declare const rectangleHandles: RectangleHandle[];
export declare function equipmentSquarePoints(floorPlan: FloorPlan, center: PolygonPoint): PolygonPoints;
export declare function rectangleFromPoints(floorPlan: FloorPlan, points: PolygonPoints): PolygonPoints;
export declare function rectangleHandleArea(points: PolygonPoints, handle: RectangleHandle, thickness: number): RectangleArea;
export declare function resizeRectanglePoints(points: PolygonPoints, floorPlan: FloorPlan, handle: RectangleHandle, pointer: PolygonPoint): PolygonPoints;
export declare function insertPointOnNearestEdge(points: PolygonPoints, point: PolygonPoint): PolygonPoints;
