import { type RunPart } from "@jield/solodb-typescript-core";

export type PartLevelGroup = { level: number; parts: RunPart[] };

const compareParts = (a: RunPart, b: RunPart): number => {
  if (a.root_id && b.root_id && a.root_id !== b.root_id) {
    return a.root_id - b.root_id;
  }
  return a.left - b.left;
};

export const groupPartsByLevel = (parts: RunPart[]): PartLevelGroup[] => {
  const byLevel = new Map<number, RunPart[]>();

  for (const part of parts) {
    const list = byLevel.get(part.part_level) ?? [];
    list.push(part);
    byLevel.set(part.part_level, list);
  }

  return Array.from(byLevel.entries())
    .toSorted(([levelA], [levelB]) => levelA - levelB)
    .map(([level, levelParts]) => ({ level, parts: levelParts.toSorted(compareParts) }));
};

export const getPartLabel = (part: RunPart): string => {
  return part.parsed_label || part.scanner_label || part.label || part.short_label;
};
