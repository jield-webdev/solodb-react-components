import { EquipmentModule } from '../../interfaces/equipment/equipmentModule';
export default function ModuleStatusElement({ module, refetchFn }: {
    module: EquipmentModule;
    refetchFn?: () => void;
}): import("react/jsx-runtime").JSX.Element;
