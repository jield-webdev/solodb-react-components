import { QueryClient } from '@tanstack/react-query';
import { RunTray } from './runTrays';
export declare const getRunQueryKey: (runId: number) => readonly ["run", number];
export declare const upsertRunTrayCache: (queryClient: QueryClient, runId: number, tray: RunTray) => void;
