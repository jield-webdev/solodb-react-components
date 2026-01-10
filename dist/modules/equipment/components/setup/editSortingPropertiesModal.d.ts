type Property = {
    value: string;
    label: string;
};
export default function EditSortingPropertiesModal({ show, onClose, properties, blacklistedEquipmentProperties, setBlacklistedEquipmentProperties, }: {
    show: boolean;
    onClose: () => void;
    properties: Property[];
    blacklistedEquipmentProperties: string[];
    setBlacklistedEquipmentProperties: React.Dispatch<React.SetStateAction<string[]>>;
}): import("react/jsx-runtime").JSX.Element;
export {};
