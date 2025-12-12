import { Template } from '../interfaces/template';
import { TemplateStep } from '../interfaces/templateStep';
export default function getTemplateSteps({ template, pageSize }: {
    template?: Template;
    pageSize?: number;
}): Promise<{
    steps: TemplateStep[];
    amountOfPages: number;
    currentPage: number;
    totalItems: number;
}>;
