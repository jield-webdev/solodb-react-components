import { default as React } from 'react';
import { RunStepChecklistItem } from '@jield/solodb-typescript-core';
export type ChecklistItem = RunStepChecklistItem & {
    can_finish: boolean;
};
export declare const withCanFinish: (items: RunStepChecklistItem[]) => ChecklistItem[];
declare const ChecklistItemElement: ({ checklistItem, refetch }: {
    checklistItem: ChecklistItem;
    refetch: () => void;
}) => React.JSX.Element;
export default ChecklistItemElement;
