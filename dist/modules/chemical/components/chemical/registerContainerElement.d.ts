import { Room } from '../../../room/interfaces/room';
import { Location } from '../../../room/interfaces/location';
export default function RegisterContainerElement({ room, resetForm, location, setLocation, }: {
    room: Room;
    resetForm: () => void;
    location: Location | null;
    setLocation: (location: Location | null) => void;
}): import("react/jsx-runtime").JSX.Element;
