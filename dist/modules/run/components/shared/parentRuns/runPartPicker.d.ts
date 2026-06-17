import { Run } from '@jield/solodb-typescript-core';
import { ParentRunSelection } from '../../../hooks/useParentRunSelection';
import { PartLevelGroup } from './partGrouping';
type RunPartPickerProps = {
    run: Run;
    selection: ParentRunSelection;
    partGroups: PartLevelGroup[];
    isLoadingParts: boolean;
    experimentalEdit: boolean;
    onToggleExperimentalEdit: () => void;
};
/**
 * Description and part selection for a single parent run, grouped by part
 * level. Parts can be picked as plain badges or, in experimental-edit mode,
 * with a split amount per part.
 */
export default function RunPartPicker({ run, selection, partGroups, isLoadingParts, experimentalEdit, onToggleExperimentalEdit, }: RunPartPickerProps): import("react").JSX.Element;
export {};
