import { useState, useCallback, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { ToastContainer, Toast } from "react-bootstrap";

type NotificationVariant = "success" | "danger";

export type NotificationProps = {
  notificationHeader: string;
  notificationBody: string;
  notificationType: NotificationVariant;
};

type NotificationItem = NotificationProps & { id: number };

let _addNotification: ((props: NotificationProps) => void) | null = null;

export function notification(props: NotificationProps) {
  if (!_addNotification) {
    console.warn("notification() called before NotificationProvider is mounted");
    return;
  }
  _addNotification(props);
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const counter = useRef(0);

  const addNotification = useCallback((props: NotificationProps) => {
    const id = ++counter.current;
    setNotifications((prev) => [...prev, { ...props, id }]);
  }, []);

  useEffect(() => {
    _addNotification = addNotification;
    return () => {
      _addNotification = null;
    };
  }, [addNotification]);

  const remove = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <>
      {children}
      <ToastContainer containerPosition="absolute" position="top-end">
        {notifications.map(({ id, notificationHeader, notificationBody, notificationType }) => (
          <Toast key={id} show={true} delay={3000} autohide bg={notificationType} onClose={() => remove(id)} className="m-5">
            <Toast.Header>
              <span className="me-auto">{notificationHeader}</span>
            </Toast.Header>
            <Toast.Body>{notificationBody}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </>
  );
}
