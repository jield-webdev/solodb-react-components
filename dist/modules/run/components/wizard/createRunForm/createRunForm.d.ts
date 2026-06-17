import { Run, RunTypeEnum } from '@jield/solodb-typescript-core';
import { SelectedSubstrate } from '../substrateSelect';
export type CreateRunFormValues = {
    name: string;
    motivation: string;
    groupId: number;
    teamId: number;
    projectId: number;
    parts: number;
    location: string;
    runType: RunTypeEnum;
};
type CreateRunFormProps = {
    isSubmitting: boolean;
    errorMessage?: string;
    selectedRuns: Run[];
    selectedSubstrates: SelectedSubstrate[];
    partIdsByRunId: Record<number, number[]>;
    onBack: () => void;
    onSubmit: (values: CreateRunFormValues) => void;
};
export default function CreateRunForm({ isSubmitting, errorMessage, selectedRuns, selectedSubstrates, partIdsByRunId, onBack, onSubmit, }: CreateRunFormProps): import("react").JSX.Element;
export {};
