export interface File {
  id: number;
  name: string;
  is_image: boolean;
  url: string;
  size: number;
  extension: string;
  date_created: string;
  has_run_step_loggings: boolean;
  has_monitor_step_loggings: boolean;
}
