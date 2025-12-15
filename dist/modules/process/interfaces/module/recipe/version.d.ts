import { Recipe } from '.';
export interface Version {
    id: number;
    version: number;
    notes: string;
    recipe: Recipe;
}
