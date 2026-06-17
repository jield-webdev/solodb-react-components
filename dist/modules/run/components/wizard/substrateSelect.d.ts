import { Substrate } from '@jield/solodb-typescript-core';
import { Dispatch, SetStateAction } from 'react';
export type SelectedSubstrate = {
    substrate: Substrate;
    amount: number;
};
type SubstrateSelectProps = {
    selectedSubstrates: SelectedSubstrate[];
    setSelectedSubstrates: Dispatch<SetStateAction<SelectedSubstrate[]>>;
};
export default function SubstrateSelect({ selectedSubstrates, setSelectedSubstrates }: SubstrateSelectProps): import("react").JSX.Element;
export {};
