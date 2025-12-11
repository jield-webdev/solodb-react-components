export interface Template {
  id: number;
  name: string;
  label: string;
  description: string;
  date_created: string;
  date_updated: string | null;
  amount_of_steps: number;
}
