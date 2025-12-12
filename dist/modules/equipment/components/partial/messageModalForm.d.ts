import { default as React } from 'react';
import { LocationMessage } from '../../../location/interfaces/locationMessage';
interface MessageModalFormProps {
    showModal: boolean;
    onClose: (message: LocationMessage | undefined) => void;
    message?: LocationMessage | undefined;
}
declare const MessageModalForm: React.FC<MessageModalFormProps>;
export default MessageModalForm;
