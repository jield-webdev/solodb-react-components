import { ReactNode } from 'react';
import { FloorPlanSelection } from '../../../hooks/useFloorPlanSelection';
export default function FloorPlanStepGuide({ selection, actions, }: {
    selection: FloorPlanSelection | null;
    actions?: ReactNode;
}): import("react").JSX.Element;
