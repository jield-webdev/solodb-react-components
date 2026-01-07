import { NotificationEntry } from './notifications';
export type WSPackage = {
    package_type: number;
    payload: string;
};
export declare enum ClientToServerMessage {
    CONNECT = 1,
    GET_DATA = 3,
    UPDATE_LISENING_DATA = 5
}
export declare enum ServerToClientMessage {
    CONNECTION_RESPONSE = 2,
    READED_DATA = 4
}
export type UpdateListeningData = {
    listening_association: string;
    sql_statement: string;
};
export type Connect = {
    key: string;
};
export type ConnectionResponse = {
    authorized: boolean;
};
export type ReadedData = {
    notifications_list: NotificationEntry[];
};
export declare function isWSPackage(data: any): data is WSPackage;
export declare function sendWsMessage(ws: WebSocket | null, msg: WSPackage): void;
interface HandledReadedDataIface {
    (data: ReadedData): void;
}
export declare function dataListener(event: any, readDataHandler: HandledReadedDataIface): void;
export declare function getWebSocket(serverUrl: string, apiKey: string): Promise<WebSocket>;
export {};
