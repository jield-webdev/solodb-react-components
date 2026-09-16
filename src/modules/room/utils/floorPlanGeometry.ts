import { FloorPlan, PolygonPoint, PolygonPoints } from "@jield/solodb-typescript-core";

export const toSvgPoints = (points: PolygonPoints) => points.map(({ x, y }) => `${x},${y}`).join(" ");

export const polygonCentroid = (points: PolygonPoints): PolygonPoint => ({
  x: points.reduce((sum, { x }) => sum + x, 0) / points.length,
  y: points.reduce((sum, { y }) => sum + y, 0) / points.length,
});

export function clientToFloorPlanPoint(
  svg: SVGSVGElement,
  floorPlan: FloorPlan,
  { clientX, clientY }: { clientX: number; clientY: number }
): PolygonPoint {
  const rect = svg.getBoundingClientRect();

  return {
    x: Math.round(((clientX - rect.left) * floorPlan.width) / rect.width),
    y: Math.round(((clientY - rect.top) * floorPlan.height) / rect.height),
  };
}

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), Math.max(0, max));

export function movePolygonPoints(
  points: PolygonPoints,
  floorPlan: FloorPlan,
  delta: PolygonPoint,
  vertexIndex: number | null
): PolygonPoints {
  if (points.length === 0) return points;

  if (vertexIndex !== null) {
    return points.map((point, index) =>
      vertexIndex === index
        ? { x: clamp(point.x + delta.x, floorPlan.width), y: clamp(point.y + delta.y, floorPlan.height) }
        : point
    );
  }

  const minX = Math.min(...points.map(({ x }) => x));
  const maxX = Math.max(...points.map(({ x }) => x));
  const minY = Math.min(...points.map(({ y }) => y));
  const maxY = Math.max(...points.map(({ y }) => y));
  const xDelta = Math.min(Math.max(delta.x, -minX), floorPlan.width - maxX);
  const yDelta = Math.min(Math.max(delta.y, -minY), floorPlan.height - maxY);

  return points.map((point) => ({ x: point.x + xDelta, y: point.y + yDelta }));
}

export const samePoints = (a: PolygonPoints, b: PolygonPoints) =>
  a.length === b.length && a.every((point, index) => point.x === b[index].x && point.y === b[index].y);

export const equipmentSquareSize = ({ width, height }: Pick<FloorPlan, "width" | "height">) =>
  Math.max(1, Math.round(Math.min(width, height) * 0.05));

interface RectangleBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

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

export const rectangleHandles: RectangleHandle[] = [
  { x: null, y: "top" },
  { x: null, y: "bottom" },
  { x: "left", y: null },
  { x: "right", y: null },
  { x: "left", y: "top" },
  { x: "right", y: "top" },
  { x: "right", y: "bottom" },
  { x: "left", y: "bottom" },
];

const rectangleBounds = (points: PolygonPoints): RectangleBounds => ({
  left: Math.min(...points.map(({ x }) => x)),
  top: Math.min(...points.map(({ y }) => y)),
  right: Math.max(...points.map(({ x }) => x)),
  bottom: Math.max(...points.map(({ y }) => y)),
});

const rectanglePoints = ({ left, top, right, bottom }: RectangleBounds): PolygonPoints => [
  { x: left, y: top },
  { x: right, y: top },
  { x: right, y: bottom },
  { x: left, y: bottom },
];

export function equipmentSquarePoints(floorPlan: FloorPlan, center: PolygonPoint): PolygonPoints {
  const size = Math.min(equipmentSquareSize(floorPlan), floorPlan.width, floorPlan.height);
  const left = clamp(Math.round(center.x - size / 2), floorPlan.width - size);
  const top = clamp(Math.round(center.y - size / 2), floorPlan.height - size);

  return rectanglePoints({ left, top, right: left + size, bottom: top + size });
}

export function rectangleFromPoints(floorPlan: FloorPlan, points: PolygonPoints): PolygonPoints {
  if (points.length === 0) {
    return equipmentSquarePoints(floorPlan, { x: floorPlan.width / 2, y: floorPlan.height / 2 });
  }

  return rectanglePoints(rectangleBounds(points));
}

export function rectangleHandleArea(points: PolygonPoints, handle: RectangleHandle, thickness: number): RectangleArea {
  const { left, top, right, bottom } = rectangleBounds(points);
  const half = thickness / 2;
  const span = (atMin: boolean | null, min: number, max: number) =>
    atMin === null
      ? { start: min + half, size: Math.max(0, max - min - thickness) }
      : { start: (atMin ? min : max) - half, size: thickness };

  const horizontal = span(handle.x === null ? null : handle.x === "left", left, right);
  const vertical = span(handle.y === null ? null : handle.y === "top", top, bottom);

  return { x: horizontal.start, y: vertical.start, width: horizontal.size, height: vertical.size };
}

export function resizeRectanglePoints(
  points: PolygonPoints,
  floorPlan: FloorPlan,
  handle: RectangleHandle,
  pointer: PolygonPoint
): PolygonPoints {
  const bounds = rectangleBounds(points);
  const x = clamp(pointer.x, floorPlan.width);
  const y = clamp(pointer.y, floorPlan.height);

  return rectanglePoints({
    left: handle.x === "left" ? Math.min(x, bounds.right - 1) : bounds.left,
    right: handle.x === "right" ? Math.max(x, bounds.left + 1) : bounds.right,
    top: handle.y === "top" ? Math.min(y, bounds.bottom - 1) : bounds.top,
    bottom: handle.y === "bottom" ? Math.max(y, bounds.top + 1) : bounds.bottom,
  });
}

const distanceToSegmentSquared = (point: PolygonPoint, start: PolygonPoint, end: PolygonPoint) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  const t =
    lengthSquared === 0
      ? 0
      : Math.min(1, Math.max(0, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  const offsetX = start.x + t * dx - point.x;
  const offsetY = start.y + t * dy - point.y;

  return offsetX * offsetX + offsetY * offsetY;
};

export function insertPointOnNearestEdge(points: PolygonPoints, point: PolygonPoint): PolygonPoints {
  if (points.length < 2) return [...points, point];

  let nearestIndex = 0;
  let nearestDistance = Infinity;
  points.forEach((start, index) => {
    const distance = distanceToSegmentSquared(point, start, points[(index + 1) % points.length]);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return [...points.slice(0, nearestIndex + 1), point, ...points.slice(nearestIndex + 1)];
}
