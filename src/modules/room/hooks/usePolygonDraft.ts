import { useCallback, useState } from "react";
import { PolygonPoint, PolygonPoints } from "@jield/solodb-typescript-core";

export interface PolygonDraft {
  points: PolygonPoints;
  canClose: boolean;
  addPoint: (point: PolygonPoint) => void;
  undoPoint: () => void;
  reset: () => void;
}

export function usePolygonDraft(): PolygonDraft {
  const [points, setPoints] = useState<PolygonPoints>([]);

  const addPoint = useCallback((point: PolygonPoint) => setPoints((prev) => [...prev, point]), []);
  const undoPoint = useCallback(() => setPoints((prev) => prev.slice(0, -1)), []);
  const reset = useCallback(() => setPoints([]), []);

  return { points, canClose: points.length >= 3, addPoint, undoPoint, reset };
}
