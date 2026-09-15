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

const squarePointsAt = (floorPlan: FloorPlan, center: PolygonPoint, requestedSize: number): PolygonPoints => {
  const maxSize = Math.max(0, Math.min(floorPlan.width, floorPlan.height));
  const size = Math.min(Math.max(1, Math.round(requestedSize)), maxSize);
  const left = clamp(Math.round(center.x - size / 2), floorPlan.width - size);
  const top = clamp(Math.round(center.y - size / 2), floorPlan.height - size);

  return [
    { x: left, y: top },
    { x: left + size, y: top },
    { x: left + size, y: top + size },
    { x: left, y: top + size },
  ];
};

export const equipmentSquarePoints = (floorPlan: FloorPlan, center: PolygonPoint): PolygonPoints =>
  squarePointsAt(floorPlan, center, equipmentSquareSize(floorPlan));

export function equipmentSquareFromPoints(floorPlan: FloorPlan, points: PolygonPoints): PolygonPoints {
  if (points.length === 0) {
    return equipmentSquarePoints(floorPlan, { x: floorPlan.width / 2, y: floorPlan.height / 2 });
  }

  const left = Math.min(...points.map(({ x }) => x));
  const right = Math.max(...points.map(({ x }) => x));
  const top = Math.min(...points.map(({ y }) => y));
  const bottom = Math.max(...points.map(({ y }) => y));

  return squarePointsAt(
    floorPlan,
    { x: (left + right) / 2, y: (top + bottom) / 2 },
    Math.max(right - left, bottom - top)
  );
}

const maxSquareSizeForCorner = (floorPlan: FloorPlan, opposite: PolygonPoint, cornerIndex: number) => {
  switch (cornerIndex) {
    case 0:
      return Math.min(opposite.x, opposite.y);
    case 1:
      return Math.min(floorPlan.width - opposite.x, opposite.y);
    case 2:
      return Math.min(floorPlan.width - opposite.x, floorPlan.height - opposite.y);
    case 3:
      return Math.min(opposite.x, floorPlan.height - opposite.y);
    default:
      return 0;
  }
};

export function resizeSquarePoints(
  points: PolygonPoints,
  floorPlan: FloorPlan,
  cornerIndex: number,
  pointer: PolygonPoint
): PolygonPoints {
  if (points.length < 4) return points;

  const normalizedCornerIndex = ((cornerIndex % 4) + 4) % 4;
  const opposite = points[(normalizedCornerIndex + 2) % 4];
  const maxSize = Math.max(0, maxSquareSizeForCorner(floorPlan, opposite, normalizedCornerIndex));
  if (maxSize === 0) return points;

  const minimumSize = Math.min(1, maxSize);
  const requestedSize = Math.max(Math.abs(pointer.x - opposite.x), Math.abs(pointer.y - opposite.y));
  const size = Math.min(Math.max(Math.round(requestedSize), minimumSize), maxSize);
  const left = normalizedCornerIndex === 0 || normalizedCornerIndex === 3 ? opposite.x - size : opposite.x;
  const top = normalizedCornerIndex === 0 || normalizedCornerIndex === 1 ? opposite.y - size : opposite.y;

  return [
    { x: left, y: top },
    { x: left + size, y: top },
    { x: left + size, y: top + size },
    { x: left, y: top + size },
  ];
}
