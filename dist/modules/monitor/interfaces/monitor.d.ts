export interface Monitor {
    id: number;
    name: string;
    description: string;
    date_created: string;
    date_updated: string | null;
    type: string;
    amount_of_steps: number;
}
