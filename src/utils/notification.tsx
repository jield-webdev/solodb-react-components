import type { Dispatch, SetStateAction } from "react";
import { ToastContainer, Toast } from "react-bootstrap";
import { NavigationButton } from "yet-another-react-lightbox/*";

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

export default function Notification({ notification, setNotification }: NotificationProps) {
  return (
    <ToastContainer position="top-end">
      <Toast
        show={notification.show}
        onClose={() => setNotification((currentNotification) => ({ ...currentNotification, show: false }))}
        delay={3000}
        autohide
        bg={notification.variant}
      >
        <Toast.Header>
          <span>Notification</span>
        </Toast.Header>
        <Toast.Body>{notification.text}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
}
