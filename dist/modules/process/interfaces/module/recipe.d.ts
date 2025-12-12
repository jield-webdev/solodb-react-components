import { ProcessModule } from '.';
export interface Recipe {
    id: number;
    name: string;
    process_module: ProcessModule;
}
