import { RunPart } from "@jield/solodb-typescript-core";

type ResolvedSlotAnchor = {
  left: number | null;
  trayRow: number | null;
  trayColumn: number | null;
};

type PartLookup = Map<number, RunPart>;

const compareNullableNumber = (a: number | null | undefined, b: number | null | undefined) => {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return a - b;
};

const comparePartsWithinGroup = (a: RunPart, b: RunPart) => {
  return compareNullableNumber(a.left, b.left) || a.id - b.id;
};

const getSplitGroupKey = (runPart: RunPart) => {
  return runPart.parent?.id ?? runPart.root_id ?? runPart.id;
};

const compareSplitGroups = (a: RunPart[], b: RunPart[]) => {
  const firstA = a[0];
  const firstB = b[0];

  return (
    compareNullableNumber(firstA?.parent?.left, firstB?.parent?.left) ||
    compareNullableNumber(firstA?.parent?.id, firstB?.parent?.id) ||
    comparePartsWithinGroup(firstA, firstB)
  );
};

export const resolvePartSlotAnchor = (
  runPart: RunPart | null | undefined,
  partLookup: PartLookup,
  cache: Map<number, ResolvedSlotAnchor> = new Map()
): ResolvedSlotAnchor => {
  if (!runPart) {
    return {
      left: null,
      trayRow: null,
      trayColumn: null,
    };
  }

  const cached = cache.get(runPart.id);
  if (cached) {
    return cached;
  }

  const parent = runPart.parent?.id ? partLookup.get(runPart.parent.id) ?? runPart.parent : null;

  const resolved = parent
    ? resolvePartSlotAnchor(parent, partLookup, cache)
    : {
        left: runPart.left ?? null,
        trayRow: runPart.tray_row ?? null,
        trayColumn: runPart.tray_column ?? null,
      };

  cache.set(runPart.id, resolved);
  return resolved;
};

export const buildSplitSlotAssignments = ({
  parts,
  slotCount,
  getSlotIndex,
}: {
  parts: RunPart[];
  slotCount: number;
  getSlotIndex: (runPart: RunPart) => number | null;
}): RunPart[][] => {
  const slots = Array.from({ length: slotCount }, () => [] as RunPart[][]);
  const groupedParts = new Map<number, RunPart[]>();

  parts.forEach((runPart) => {
    const groupKey = getSplitGroupKey(runPart);
    const group = groupedParts.get(groupKey) ?? [];
    group.push(runPart);
    groupedParts.set(groupKey, group);
  });

  Array.from(groupedParts.values())
    .map((group) => [...group].sort(comparePartsWithinGroup))
    .forEach((group) => {
      const preferredSlotIndex = getSlotIndex(group[0]);
      const slotIndex =
        preferredSlotIndex !== null && preferredSlotIndex >= 0 && preferredSlotIndex < slotCount
          ? preferredSlotIndex
          : slots.reduce((bestIndex, slotGroups, index) => {
              if (bestIndex === -1 || slotGroups.length < slots[bestIndex].length) {
                return index;
              }
              return bestIndex;
            }, -1);

      if (slotIndex !== -1) {
        slots[slotIndex].push(group);
      }
    });

  return slots.map((slotGroups) => slotGroups.sort(compareSplitGroups).flat());
};

export const buildDisplaySlotIndexByPartId = ({
  parts,
  getOverrideSlotIndex,
  getDirectSlotIndex,
  slotCount,
}: {
  parts: RunPart[];
  getOverrideSlotIndex?: (runPart: RunPart) => number | null;
  getDirectSlotIndex: (runPart: RunPart) => number | null;
  slotCount?: number;
}) => {
  const slotIndexByPartId = new Map<number, number>();
  const levels = [...new Set(parts.map((part) => part.part_level))].sort((a, b) => a - b);

  const sortedParts = [...parts].sort((a, b) => {
    if (a.root_id && b.root_id && a.root_id !== b.root_id) {
      return a.root_id - b.root_id;
    }

    return compareNullableNumber(a.left, b.left) || a.id - b.id;
  });

  levels.forEach((level) => {
    const levelParts = sortedParts.filter((part) => part.part_level === level);
    const occupiedSlots = new Set<number>();
    const pendingParts: RunPart[] = [];

    levelParts.forEach((runPart) => {
      const overrideSlotIndex = getOverrideSlotIndex?.(runPart);
      if (
        overrideSlotIndex !== undefined &&
        overrideSlotIndex !== null &&
        overrideSlotIndex >= 0 &&
        (slotCount === undefined || overrideSlotIndex < slotCount)
      ) {
        slotIndexByPartId.set(runPart.id, overrideSlotIndex);
        occupiedSlots.add(overrideSlotIndex);
        return;
      }

      const parentSlotIndex = runPart.parent?.id ? slotIndexByPartId.get(runPart.parent.id) : undefined;
      if (parentSlotIndex !== undefined) {
        slotIndexByPartId.set(runPart.id, parentSlotIndex);
        occupiedSlots.add(parentSlotIndex);
        return;
      }

      const directSlotIndex = getDirectSlotIndex(runPart);
      if (
        directSlotIndex !== null &&
        directSlotIndex >= 0 &&
        (slotCount === undefined || directSlotIndex < slotCount) &&
        !occupiedSlots.has(directSlotIndex)
      ) {
        slotIndexByPartId.set(runPart.id, directSlotIndex);
        occupiedSlots.add(directSlotIndex);
        return;
      }

      pendingParts.push(runPart);
    });

    pendingParts.forEach((runPart) => {
      let nextSlotIndex = 0;
      while (occupiedSlots.has(nextSlotIndex)) {
        nextSlotIndex += 1;
      }

      if (slotCount !== undefined && nextSlotIndex >= slotCount) {
        return;
      }

      slotIndexByPartId.set(runPart.id, nextSlotIndex);
      occupiedSlots.add(nextSlotIndex);
    });
  });

  return slotIndexByPartId;
};
