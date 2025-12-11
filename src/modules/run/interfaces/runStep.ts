import { RunStepGroup } from "@/modules/run/interfaces/step/runStepGroup";
import { RunStepLabel } from "@/modules/run/interfaces/step/runStepLabel";
import { Version } from "@/modules/process/interfaces/module/recipe/version";
import { User } from "@/modules/core/interfaces/user";
import { ProcessModule } from "@/modules/process/interfaces/module";
import { Rework } from "@/modules/run/interfaces/step/rework";

export interface RunStep {
  id: number;
  name: string;
  sequence: number;
  number: number;
  is_skipped: boolean;
  is_rework: boolean;
  has_step_group: boolean;
  step_group?: RunStepGroup;

  has_label: boolean;
  is_own_label: boolean;
  label?: RunStepLabel;

  is_private: boolean;
  has_service_work: boolean;
  has_requirement: boolean;

  is_finished: boolean;
  finish_user?: User;
  finish_date?: string;

  tags: string[];

  amount_of_files: number;
  has_instructions: boolean;
  instructions?: string;
  has_remark: boolean;
  remark: string;
  remark_unparsed: string;
  has_parts: boolean;
  part_level: number;
  sub_steps: number;

  process_module: ProcessModule;
  next_step_id: number | null;

  has_recipe: boolean;
  recipe_version?: Version;
  run_id: number;

  has_rework: boolean;
  rework?: Rework;

  parts: {
    amount_total: number;
    amount_processed_step: number;
    amount_failed_step: number;
  };
}
