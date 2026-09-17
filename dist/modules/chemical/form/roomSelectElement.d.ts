import { default as React } from 'react';
import { Control } from 'react-hook-form';
import { Room } from '@jield/solodb-typescript-core';
interface RoomSelectElementProps {
    control: Control<{
        room: Room | null;
    }>;
    name: "room";
}
export default function RoomSelectElement({ control, name }: RoomSelectElementProps): React.JSX.Element;
export {};
