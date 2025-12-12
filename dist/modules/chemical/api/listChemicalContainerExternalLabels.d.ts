import { ApiFormattedResponse } from '../../core/interfaces/response';
import { ChemicalContainerExternalLabel } from '../interfaces/chemical/container/chemicalContainerExternalLabel';
export default function ListChemicalContainerExternalLabels({ qrCodeContent, }: {
    qrCodeContent: string;
}): Promise<ApiFormattedResponse<ChemicalContainerExternalLabel>>;
