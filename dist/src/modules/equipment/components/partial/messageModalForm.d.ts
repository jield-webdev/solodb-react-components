import { default as React } from 'react';
import { LocationMessage } from '@jield/solodb-typescript-core';
interface MessageModalFormProps {
    showModal: boolean;
    onClose: (message: LocationMessage | undefined) => void;
    message?: LocationMessage | undefined;
}
declare const MessageModalForm: React.FC<MessageModalFormProps>;
export default MessageModalForm;
