import { Run } from '@jield/solodb-typescript-core';
type SelectedRunListProps = {
    selectedRuns: Run[];
    onDeselect: (runId: number) => void;
};
export default function SelectedRunList({ selectedRuns, onDeselect }: SelectedRunListProps): import("react").JSX.Element;
export {};
