export interface RunStepChecklistItem {
  id: number;
  is_executed: boolean;
  can_finish: boolean;
  task: string;
  description: string;
  date_executed: string;
}
