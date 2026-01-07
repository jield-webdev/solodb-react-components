import { NotificationEntry } from "./notifications";

export type WSPackage = {
    package_type: number;
    payload: string;
};

export enum ClientToServerMessage {
    CONNECT = 1,
    GET_DATA = 3,
    UPDATE_LISENING_DATA = 5,
}

export enum ServerToClientMessage {
    CONNECTION_RESPONSE = 2,
    READED_DATA = 4,
}

// Represents the data structure for updating listening data
export type UpdateListeningData = {
    listening_association: string;
    sql_statement: string;
};

// Represents the connect message structure
export type Connect = {
    key: string;
};

// Represents the connection response indicating authorization status
export type ConnectionResponse = {
    authorized: boolean;
};

// When you read notifications from the server is parsed like this
export type ReadedData = {
    notifications_list: NotificationEntry[];
}

export function isWSPackage(data: any): data is WSPackage {
    return (
        typeof data === "object" &&
        data !== null &&
        typeof data.package_type === "number" &&
        typeof data.payload === "string"
    );
}

export function sendWsMessage(ws: WebSocket | null, msg: WSPackage) {
    if (!ws) {
        console.log("Trying to send message to null ws");
        return;
    }
    const pkg = JSON.stringify(msg);
    try {
        ws.send(pkg);
    } catch (err) {
        console.error(err);
    }
}

interface HandledReadedDataIface {
    (data: ReadedData): void
}

export function dataListener(event: any, readDataHandler: HandledReadedDataIface) {
    let data: WSPackage;
    try {
        data = JSON.parse(event.data);
    } catch {
        console.error("Error parsing ws package");
        return;
    }

    if (!isWSPackage(data)) {
        console.error("Data is not a ws package: " + data);
        return;
    }

    switch (data.package_type) {
        case ServerToClientMessage.READED_DATA:
            let readedData: ReadedData;
            try {
                readedData = JSON.parse(data.payload); 
            } catch (error) {
                console.error("Error parsing ws payload: " + error);
                return;
            }
            readDataHandler(readedData);
            break;

        default:
            console.log("Received unsuported message from ws server");
            break;
    }
}

export function getWebSocket(serverUrl: string, apiKey: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(serverUrl);

        ws.onerror = reject;

        ws.onopen = () => {
            // Send the initial CONNECT message
            sendWsMessage(ws, {
                package_type: ClientToServerMessage.CONNECT,
                payload: JSON.stringify({ key: apiKey }),
            });

            // Wait for the handshake response message from server
            ws.addEventListener('message', function handler(event) {
                ws.removeEventListener('message', handler);

                try {
                    // Parse the handshake response from server
                    const response: WSPackage = JSON.parse(event.data);
                    const payload: ConnectionResponse = JSON.parse(response.payload);

                    if (payload.authorized) {
                        resolve(ws);
                    } else {
                        reject();
                    }
                } catch (err) {
                    reject(new Error("Failed to parse handshake response: " + err));
                }
            });
        };
    });
}
