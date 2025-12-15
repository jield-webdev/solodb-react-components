import { Recipe } from '../../process/interfaces/module/recipe';
import { Template } from '../interfaces/template';
export default function ListTemplates({ reworkRecipes }: {
    reworkRecipes?: Recipe[];
}): Promise<{
    templates: Template[];
    amountOfPages: number;
    currentPage: number;
    totalItems: number;
}>;
