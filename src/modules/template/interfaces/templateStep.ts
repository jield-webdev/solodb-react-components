import { RunStepGroup } from "@/modules/run/interfaces/step/runStepGroup";
import { RunStepLabel } from "@/modules/run/interfaces/step/runStepLabel";
import { Version } from "@/modules/process/interfaces/module/recipe/version";
import { ProcessModule } from "@/modules/process/interfaces/module";

export interface TemplateStep {
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
  has_requirement: boolean;

  tags: string[];

  amount_of_files: number;
  has_instructions: boolean;
  instructions?: string;
  has_remark: boolean;
  remark: string;
  remark_unparsed: string;
  sub_steps: number;

  process_module: ProcessModule;

  has_recipe: boolean;
  recipe_version?: Version;
  run_id: number;
}
