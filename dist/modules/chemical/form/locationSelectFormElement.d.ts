import { default as React } from 'react';
import { Room } from '@jield/solodb-typescript-core';
interface LocationSelectorWithQRProps {
    control: any;
    name: string;
    room: Room;
}
export default function LocationSelectorWithQR({ control, name, room }: LocationSelectorWithQRProps): React.JSX.Element;
export {};
