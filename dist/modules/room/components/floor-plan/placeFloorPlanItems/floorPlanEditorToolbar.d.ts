import { FloorPlanSelection } from '../../../hooks/useFloorPlanSelection';
import { PolygonDraft } from '../../../hooks/usePolygonDraft';
export default function FloorPlanEditorToolbar({ selection, draft, onCancel, onStopEditing, onDelete, onRemove, isBusy, }: {
    selection: FloorPlanSelection;
    draft: PolygonDraft;
    onCancel: () => void;
    onStopEditing: () => void;
    onDelete: () => void;
    onRemove: () => void;
    isBusy: boolean;
}): import("react").JSX.Element;
