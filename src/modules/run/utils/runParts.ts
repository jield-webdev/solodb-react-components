import { RunPart, RunStep } from "@jield/solodb-typescript-core";

// Parts of the level the step operates on, grouped per root part and then in tree order.
export const getLeveledPartsForStep = (parts: RunPart[], step: RunStep): RunPart[] =>
  parts
    .filter((part) => part.part_level === step.part_level)
    .sort((a, b) => {
      if (a.root_id && b.root_id && a.root_id !== b.root_id) {
        return a.root_id - b.root_id;
      }

      return a.left - b.left;
    });
