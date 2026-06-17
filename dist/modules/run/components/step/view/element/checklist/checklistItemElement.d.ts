import { default as React } from 'react';
import { RunStepChecklistItem } from '@jield/solodb-typescript-core';
declare const ChecklistItemElement: ({ checklistItem, refetch, }: {
    checklistItem: RunStepChecklistItem;
    refetch: () => void;
}) => React.JSX.Element;
export default ChecklistItemElement;
