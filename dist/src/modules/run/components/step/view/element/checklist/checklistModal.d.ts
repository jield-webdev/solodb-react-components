import { default as React } from 'react';
import { RunStepChecklistItem } from '@jield/solodb-typescript-core';
declare const ChecklistModal: ({ checklistItem, show, setModalShow, mutation, }: {
    checklistItem: RunStepChecklistItem;
    show: boolean;
    setModalShow: (show: boolean) => void;
    mutation: any;
}) => React.JSX.Element;
export default ChecklistModal;
