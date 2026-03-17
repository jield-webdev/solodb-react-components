type RuntimeConfig = {
    serverUri: string;
    irisServerUri: string;
};
export declare function initSolodbComponents(partial: Partial<RuntimeConfig>): void;
export declare function getSolodbServerApiUrl(): string;
export declare function getIrisServerUrl(): string;
export {};
