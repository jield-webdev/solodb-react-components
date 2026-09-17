import { FloorPlanSelection } from '../../../hooks/useFloorPlanSelection';
import { PolygonDraft } from '../../../hooks/usePolygonDraft';
export default function FloorPlanInstruction({ selection, draft, }: {
    selection: FloorPlanSelection | null;
    draft: PolygonDraft;
}): import("react").JSX.Element;
