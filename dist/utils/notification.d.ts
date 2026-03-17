import { Dispatch, SetStateAction } from 'react';
type NotificationVariant = "success" | "danger";
export type NotificationType = {
    text: string;
    show: boolean;
    variant: NotificationVariant;
};
type NotificationProps = {
    notification: NotificationType;
    setNotification: Dispatch<SetStateAction<NotificationType>>;
};
export default function Notification({ notification, setNotification }: NotificationProps): import("react/jsx-runtime").JSX.Element;
export {};
