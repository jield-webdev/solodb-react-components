import { ReactNode } from 'react';
import { RunStep, RunStepPart } from '@jield/solodb-typescript-core';
/**
 * Wraps a tray's parts and exposes a hover overlay with the actions that can be
 * applied in bulk to every part in the tray.
 */
export declare const TrayBulkActions: ({ label, trayStepParts, runStep, children, }: {
    label: string;
    trayStepParts: RunStepPart[];
    runStep: RunStep;
    children: ReactNode;
}) => import("react").JSX.Element;
