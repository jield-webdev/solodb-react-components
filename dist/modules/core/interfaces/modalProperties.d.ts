import { ReactElement } from 'react';
export interface ModalProperties {
    modalTitle?: string;
    modalContent?: ReactElement | null;
    modalSaveButton?: ReactElement;
    show: boolean;
}
