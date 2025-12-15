import { ChemicalContainer } from '../chemicalContainer';
export interface ChemicalContainerExternalLabel {
    id: number;
    qr_code_content: string;
    label: string | null;
    description: string | null;
    order_number: string | null;
    sequence: string | null;
    container: ChemicalContainer;
}
