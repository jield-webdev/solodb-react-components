import { ReactNode } from 'react';
type NotificationVariant = "success" | "danger";
export type NotificationProps = {
    notificationHeader: string;
    notificationBody: string;
    notificationType: NotificationVariant;
};
export declare function notification(props: NotificationProps): void;
export declare function NotificationProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export {};
