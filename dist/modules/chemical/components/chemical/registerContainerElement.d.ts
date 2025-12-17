import { Room, Location } from 'solodb-typescript-core';
export default function RegisterContainerElement({ room, resetForm, location, setLocation, }: {
    room: Room;
    resetForm: () => void;
    location: Location | null;
    setLocation: (location: Location | null) => void;
}): import("react/jsx-runtime").JSX.Element;
