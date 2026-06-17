import { ParentRunSelection } from '../../../hooks/useParentRunSelection';
import { PartLevelGroup } from './partGrouping';
type PartLevelFieldsetProps = {
    runId: number;
    group: PartLevelGroup;
    selection: ParentRunSelection;
    experimentalEdit: boolean;
};
export default function PartLevelFieldset({ runId, group, selection, experimentalEdit }: PartLevelFieldsetProps): import("react").JSX.Element;
export {};
