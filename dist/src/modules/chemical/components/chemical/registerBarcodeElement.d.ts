import { Room, Location } from '@jield/solodb-typescript-core';
import { AMOUNT_UNITS, scannedCodeIsLocationCode, extractLabelNumber } from '../../../../../modules/chemical/utils/chemicalContainerUtils';
export { AMOUNT_UNITS, scannedCodeIsLocationCode, extractLabelNumber };
export default function RegisterBarcodeElement({ room, barcode, resetForm, location, setLocation, }: {
    room: Room;
    barcode: string;
    resetForm: () => void;
    location: Location | null;
    setLocation: (location: Location | null) => void;
}): import("react/jsx-runtime").JSX.Element;
