import { default as React } from 'react';
import { MonitorRequirementTarget, MonitorMeasurementResult } from '@jield/solodb-typescript-core';
export default function RequirementChart({ target, results, }: {
    target: MonitorRequirementTarget;
    results: MonitorMeasurementResult[];
}): React.JSX.Element;
