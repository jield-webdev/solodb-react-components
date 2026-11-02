export declare class PrimillaError extends Error {
    readonly status?: number | undefined;
    constructor(message: string, status?: number | undefined);
}
export declare const getStreamErrorStatus: (message: string) => number | undefined;
export declare const getPrimillaPathUrl: (path: string) => string;
export declare function primillaFetch(input: string, init?: RequestInit): Promise<Response>;
