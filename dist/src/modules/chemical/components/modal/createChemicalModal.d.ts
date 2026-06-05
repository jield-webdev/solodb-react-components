import { default as React } from 'react';
import { Chemical } from '@jield/solodb-typescript-core';
declare const CreateChemicalModal: ({ show, setShow, onChemicalCreate, }: {
    show: boolean;
    setShow: (set: boolean) => void;
    onChemicalCreate: (chemical: Chemical) => void;
}) => React.JSX.Element;
export default CreateChemicalModal;
