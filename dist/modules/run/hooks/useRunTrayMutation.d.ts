import { RunTray } from '../utils/runTrays';
type TrayAction = {
    action: "create";
} | {
    action: "rename";
    trayId: number;
    name: string;
} | {
    action: "delete";
    trayId: number;
};
export default function useRunTrayMutation(runId: number): import('@tanstack/react-query').UseMutationResult<RunTray | null, Error, TrayAction, unknown>;
export declare const getRunTrayErrorMessage: (error: unknown) => string;
export {};
