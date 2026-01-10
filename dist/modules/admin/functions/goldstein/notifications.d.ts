export type NotificationEntry = {
    id: number;
    association_item: AssociationEnum;
    association_id: number;
    timestamp: string;
    message_type: Status;
    message: string;
};
export declare enum AssociationEnum {
    NOT_SET = "not_set",
    EQUIPMENT = "equipment"
}
export declare enum Status {
    CLIENT_CONNECTED = 1,
    CARD_READED = 2,
    USER_AUTHENTICATED = 3,
    CLIENT_DISCONNECTED = 4
}
export type ClientStatus = {
    status: Status;
    timestamp: Date;
    message: ClientStatusMessage;
};
type ClientStatusMessage = {
    badgeUUID: string;
    userID: number;
    usable: boolean;
};
/**
 * With a Notification[] creates a map of the clients' statuses.
 * Returns the latest notification of each client.
 * If there is a notification with status 'Disconnect', delete it.
 * If the notification TTL has expired, create the entry without a status.
 * If there is a user authenticated with `usable = true`, use the loginTTL and overwrite future notifications.
 *
 * @param {NotificationEntry[]} notifications - Array of notifications from clients.
 * @param {Date} currentTime - The current time in format
 * @param {number} notificationsTTL - Time-to-live for notifications, in seconds.
 * @param {number} loginTTL - TTL for login-based notifications, in seconds.
 * @returns {Map<string, ClientStatus>} A map of client identifiers to their latest status.
 */
export declare function getClientsStatus(notifications: NotificationEntry[], currentTime: Date, notificationsTTL: number, loginTTL: number): Map<string, ClientStatus>;
export {};
