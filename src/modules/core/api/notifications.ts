// A notification
export type NotificationEntry = {
    id: number;
    association_item: AssociationEnum;
    association_id: number;
    timestamp: string;
    message_type: Status;
    message: string;
}

export enum AssociationEnum {
    NOT_SET = "not_set",
    EQUIPMENT = "equipment",
}

export enum Status {
    CLIENT_CONNECTED = 1,
    CARD_READED = 2,
    USER_AUTHENTICATED = 3,
    CLIENT_DISCONNECTED = 4
}

export type ClientStatus = {
    status: Status;
    timestamp: Date;
    message: ClientStatusMessage;
}

type ClientStatusMessage = {
    badgeUUID: string;
    userID: number;
    usable: boolean;
}

type UserAuthenticatedPayload = {
    user_id: number;
    badge_uuid: string;
    usable_status: number;
}

type BadgeDetectedPayload = {
    badge_uuid: string;
}

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
export function getClientsStatus(notifications: NotificationEntry[], currentTime: Date, notificationsTTL: number, loginTTL: number): Map<string, ClientStatus> {
    let map = new Map<string, ClientStatus>();

    if (!notifications) {
        return map;
    }

    for (let i = 0; i < notifications.length; i++) {
        const notif = notifications[i];
        const key = `${notif.association_item}:${notif.association_id}`;
        const status = generateStatus(map.get(key), notif, currentTime, notificationsTTL, loginTTL);
        if (status !== null)
            map.set(key, status);
        else
            map.delete(key);
    }

    return map;
}

function isUserAuthenticatedPayload(obj: any): obj is UserAuthenticatedPayload {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.user_id === 'number' &&
        typeof obj.badge_uuid === 'string' &&
        typeof obj.usable_status === 'number'
    );
}

function isBadgeDetectedPayload(obj: any): obj is BadgeDetectedPayload {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.badge_uuid === 'string' &&
        (Object.keys(obj).length === 1) // Ensure it’s only a BadgeDetectedPayload
    );
}

function createEmptyStatus(timestamp: Date): ClientStatus {
    return {
        status: Status.CLIENT_CONNECTED,
        timestamp: timestamp,
        message: {
            badgeUUID: "",
            userID: 0,
            usable: false
        }
    }
}

function generateMessageFromNotification(payload: string): ClientStatusMessage {
    let parsedPayload;
    try {
        parsedPayload = JSON.parse(payload);
    } catch {
        return {
            badgeUUID: "",
            userID: 0,
            usable: false
        }
    }

    if (isUserAuthenticatedPayload(parsedPayload)) {
        return {
            badgeUUID: parsedPayload.badge_uuid,
            userID: parsedPayload.user_id,
            usable: parsedPayload.usable_status === 1
        }
    }

    if (isBadgeDetectedPayload(parsedPayload)) {
        return {
            badgeUUID: parsedPayload.badge_uuid,
            userID: 0,
            usable: false
        }
    }

    console.error("Received invalid notification payload: " + payload);
    return {
        badgeUUID: "",
        userID: 0,
        usable: false
    }
}

function generateStatus(oldStatus: ClientStatus | undefined, newNotification: NotificationEntry, currentTime: Date, notificationsTTL: number, loginTTL: number): ClientStatus | null {
    let status;
    if (typeof oldStatus === "object")
        status = createEmptyStatus(oldStatus.timestamp);
    else
        status = createEmptyStatus(new Date(newNotification.timestamp));

    if (
        typeof oldStatus === "object" &&
        oldStatus.status === Status.USER_AUTHENTICATED &&
        oldStatus.timestamp.getTime() >= currentTime.getTime() - loginTTL * 1000 &&
        oldStatus.message.usable === true
    ) {
        // Parse the new message to see if it's a usable login
        const parsedMessage = generateMessageFromNotification(newNotification.message);
        if (!parsedMessage.usable) {
            return oldStatus;
        }
    }

    const notifTime = new Date(newNotification.timestamp);
    if (newNotification.message_type === Status.USER_AUTHENTICATED && notifTime.getTime() >= currentTime.getTime() - loginTTL * 1000) {
        const message = generateMessageFromNotification(newNotification.message);
        if (message.badgeUUID === "") {
            return null
        }

        if (message.usable) {
            return {
                status: newNotification.message_type,
                timestamp: new Date(newNotification.timestamp),
                message: message
            }
        } else if (notifTime.getTime() >= currentTime.getTime() - notificationsTTL * 1000) {
            return {
                status: newNotification.message_type,
                timestamp: new Date(newNotification.timestamp),
                message: message
            }
        }
    }

    if (newNotification.message_type === Status.CARD_READED && notifTime.getTime() >= currentTime.getTime() - notificationsTTL * 1000) {
        const message = generateMessageFromNotification(newNotification.message);
        if (message.badgeUUID === "") {
            return null
        }

        return {
            status: newNotification.message_type,
            timestamp: new Date(newNotification.timestamp),
            message: message
        }
    }

    if (newNotification.message_type === Status.CLIENT_DISCONNECTED) {
        return null;
    }

    return status;
}
