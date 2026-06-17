import { default as React } from 'react';
import { EquipmentModule } from '@jield/solodb-typescript-core';
export default function ModuleStatusElement({ module, refetchFn, }: {
    module: EquipmentModule;
    refetchFn?: () => void;
}): React.JSX.Element;
