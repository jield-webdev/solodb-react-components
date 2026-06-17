import { RunPart } from '@jield/solodb-typescript-core';
export type PartLevelGroup = {
    level: number;
    parts: RunPart[];
};
export declare const groupPartsByLevel: (parts: RunPart[]) => PartLevelGroup[];
export declare const getPartLabel: (part: RunPart) => string;
