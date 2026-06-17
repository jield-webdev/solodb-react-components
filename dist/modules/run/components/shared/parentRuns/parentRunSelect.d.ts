import { Run } from '@jield/solodb-typescript-core';
import { ParentRunSelection } from '../../../hooks/useParentRunSelection';
type ParentRunSelectProps = {
    selection: ParentRunSelection;
    /** When given, only runs available as parent for this run are offered. */
    run?: Run;
};
export default function ParentRunSelect({ selection, run }: ParentRunSelectProps): import("react").JSX.Element;
export {};
