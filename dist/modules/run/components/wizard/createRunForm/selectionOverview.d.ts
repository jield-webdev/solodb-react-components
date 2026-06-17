import { Run } from '@jield/solodb-typescript-core';
import { SelectedSubstrate } from '../substrateSelect';
type SelectionOverviewProps = {
    selectedRuns: Run[];
    selectedSubstrates: SelectedSubstrate[];
    partIdsByRunId: Record<number, number[]>;
};
export default function SelectionOverview({ selectedRuns, selectedSubstrates, partIdsByRunId, }: SelectionOverviewProps): import("react").JSX.Element;
export {};
