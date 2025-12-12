import { Chemical } from '../../interfaces/chemical';
declare const CreateChemicalModal: ({ show, setShow, onChemicalCreate, }: {
    show: boolean;
    setShow: (set: boolean) => void;
    onChemicalCreate: (chemical: Chemical) => void;
}) => import("react/jsx-runtime").JSX.Element;
export default CreateChemicalModal;
