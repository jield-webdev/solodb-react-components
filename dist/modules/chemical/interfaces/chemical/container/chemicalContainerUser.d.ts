import { User } from '../../../../core/interfaces/user';
import { ChemicalContainer } from '../chemicalContainer';
export interface ChemicalContainerUser {
    id: number;
    user: User;
    comment: string | null;
    date_created: string;
    deleted_at: string | null;
    container: ChemicalContainer;
}
