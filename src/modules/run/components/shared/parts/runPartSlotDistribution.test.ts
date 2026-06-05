import { describe, expect, it } from "vitest";
import { RunPart } from "@jield/solodb-typescript-core";
import { buildDisplaySlotIndexByPartId, buildSplitSlotAssignments } from "./runPartSlotDistribution";

const makePart = (overrides: Partial<RunPart>) =>
  ({
    id: 0,
    left: null,
    tray_row: null,
    tray_column: null,
    ...overrides,
  }) as RunPart;

describe("runPartSlotDistribution", () => {
  it("anchors first-level split parts to the parent slot", () => {
    const parent1 = makePart({ id: 1, left: 1, short_label: "S001" });
    const parent2 = makePart({ id: 2, left: 2, short_label: "S002" });
    const parent3 = makePart({ id: 3, left: 3, short_label: "S003" });
    const parts = [
      makePart({ id: 11, left: 1, root_id: 1, short_label: "S001-A1", parent: { id: 1 } as RunPart }),
      makePart({ id: 12, left: 2, root_id: 1, short_label: "S001-A2", parent: { id: 1 } as RunPart }),
      makePart({ id: 13, left: 3, root_id: 1, short_label: "S001-A3", parent: { id: 1 } as RunPart }),
      makePart({ id: 21, left: 4, root_id: 2, short_label: "S002-A1", parent: { id: 2 } as RunPart }),
      makePart({ id: 22, left: 5, root_id: 2, short_label: "S002-A2", parent: { id: 2 } as RunPart }),
      makePart({ id: 23, left: 6, root_id: 2, short_label: "S002-A3", parent: { id: 2 } as RunPart }),
      makePart({ id: 31, left: 7, root_id: 3, short_label: "S003-A1", parent: { id: 3 } as RunPart }),
      makePart({ id: 32, left: 8, root_id: 3, short_label: "S003-A2", parent: { id: 3 } as RunPart }),
      makePart({ id: 33, left: 9, root_id: 3, short_label: "S003-A3", parent: { id: 3 } as RunPart }),
    ];

    const slots = buildSplitSlotAssignments({
      parts,
      slotCount: 3,
      getSlotIndex: (runPart) =>
        buildDisplaySlotIndexByPartId({
          parts: [parent1, parent2, parent3, ...parts],
          getDirectSlotIndex: (part) => (part.left ?? 1) - 1,
        }).get(runPart.id) ?? null,
    });

    expect(slots.map((slot) => slot.map((part) => part.short_label))).toEqual([
      ["S001-A1", "S001-A2", "S001-A3"],
      ["S002-A1", "S002-A2", "S002-A3"],
      ["S003-A1", "S003-A2", "S003-A3"],
    ]);
  });

  it("keeps deeper split levels grouped by the immediate parent within the same root slot", () => {
    const root1 = makePart({ id: 1, left: 1, short_label: "S001" });
    const root2 = makePart({ id: 2, left: 2, short_label: "S002" });
    const parentA1 = makePart({ id: 11, left: 1, root_id: 1, short_label: "S001-A1", parent: { id: 1 } as RunPart });
    const parentA2 = makePart({ id: 12, left: 2, root_id: 1, short_label: "S001-A2", parent: { id: 1 } as RunPart });
    const parentB1 = makePart({ id: 21, left: 1, root_id: 2, short_label: "S002-A1", parent: { id: 2 } as RunPart });
    const parts = [
      makePart({ id: 111, left: 1, root_id: 1, short_label: "S001-A1-B1", parent: { id: 11 } as RunPart }),
      makePart({ id: 112, left: 2, root_id: 1, short_label: "S001-A1-B2", parent: { id: 11 } as RunPart }),
      makePart({ id: 121, left: 3, root_id: 1, short_label: "S001-A2-B1", parent: { id: 12 } as RunPart }),
      makePart({ id: 211, left: 4, root_id: 2, short_label: "S002-A1-B1", parent: { id: 21 } as RunPart }),
    ];

    const slots = buildSplitSlotAssignments({
      parts,
      slotCount: 2,
      getSlotIndex: (runPart) =>
        buildDisplaySlotIndexByPartId({
          parts: [root1, root2, parentA1, parentA2, parentB1, ...parts],
          getDirectSlotIndex: (part) => (part.left ?? 1) - 1,
        }).get(runPart.id) ?? null,
    });

    expect(slots.map((slot) => slot.map((part) => part.short_label))).toEqual([
      ["S001-A1-B1", "S001-A1-B2", "S001-A2-B1"],
      ["S002-A1-B1"],
    ]);
  });

  it("uses the parent tray position for split tray slots", () => {
    const parent1 = makePart({ id: 1, tray_row: 1, tray_column: 1, short_label: "S001" });
    const parent2 = makePart({ id: 2, tray_row: 1, tray_column: 2, short_label: "S002" });
    const parent3 = makePart({ id: 3, tray_row: 1, tray_column: 3, short_label: "S003" });
    const parts = [
      makePart({ id: 11, tray_row: 1, tray_column: 1, root_id: 1, short_label: "S001-A1", parent: { id: 1 } as RunPart }),
      makePart({ id: 12, tray_row: 1, tray_column: 2, root_id: 1, short_label: "S001-A2", parent: { id: 1 } as RunPart }),
      makePart({ id: 13, tray_row: 1, tray_column: 3, root_id: 1, short_label: "S001-A3", parent: { id: 1 } as RunPart }),
      makePart({ id: 21, tray_row: 1, tray_column: 4, root_id: 2, short_label: "S002-A1", parent: { id: 2 } as RunPart }),
      makePart({ id: 22, tray_row: 1, tray_column: 5, root_id: 2, short_label: "S002-A2", parent: { id: 2 } as RunPart }),
      makePart({ id: 23, tray_row: 1, tray_column: 6, root_id: 2, short_label: "S002-A3", parent: { id: 2 } as RunPart }),
      makePart({ id: 31, tray_row: 1, tray_column: 7, root_id: 3, short_label: "S003-A1", parent: { id: 3 } as RunPart }),
      makePart({ id: 32, tray_row: 1, tray_column: 8, root_id: 3, short_label: "S003-A2", parent: { id: 3 } as RunPart }),
      makePart({ id: 33, tray_row: 1, tray_column: 9, root_id: 3, short_label: "S003-A3", parent: { id: 3 } as RunPart }),
    ];

    const slots = buildSplitSlotAssignments({
      parts,
      slotCount: 3,
      getSlotIndex: (runPart) =>
        buildDisplaySlotIndexByPartId({
          parts: [parent1, parent2, parent3, ...parts],
          slotCount: 3,
          getDirectSlotIndex: (part) => {
            if (!part.tray_row || !part.tray_column) return null;
            return (part.tray_row - 1) * 3 + (part.tray_column - 1);
          },
        }).get(runPart.id) ?? null,
    });

    expect(slots.map((slot) => slot.map((part) => part.short_label))).toEqual([
      ["S001-A1", "S001-A2", "S001-A3"],
      ["S002-A1", "S002-A2", "S002-A3"],
      ["S003-A1", "S003-A2", "S003-A3"],
    ]);
  });

  it("inherits the rendered parent slot when parents share the same raw left value", () => {
    const level0Parts = [
      makePart({ id: 1, part_level: 0, left: 1, short_label: "S001" }),
      makePart({ id: 2, part_level: 0, left: 1, short_label: "S002" }),
      makePart({ id: 3, part_level: 0, left: 1, short_label: "S003" }),
    ];
    const level1Parts = [
      makePart({ id: 11, part_level: 1, left: 1, root_id: 1, short_label: "S001-A1", parent: { id: 1 } as RunPart }),
      makePart({ id: 21, part_level: 1, left: 1, root_id: 2, short_label: "S002-A1", parent: { id: 2 } as RunPart }),
      makePart({ id: 31, part_level: 1, left: 1, root_id: 3, short_label: "S003-A1", parent: { id: 3 } as RunPart }),
    ];
    const displaySlotIndexByPartId = buildDisplaySlotIndexByPartId({
      parts: [...level0Parts, ...level1Parts],
      getDirectSlotIndex: (part) => (part.left ?? 1) - 1,
    });

    const slots = buildSplitSlotAssignments({
      parts: level1Parts,
      slotCount: 3,
      getSlotIndex: (runPart) => displaySlotIndexByPartId.get(runPart.id) ?? null,
    });

    expect(slots.map((slot) => slot.map((part) => part.short_label))).toEqual([
      ["S001-A1"],
      ["S002-A1"],
      ["S003-A1"],
    ]);
  });

  it("uses override slot positions before inherited parent slots", () => {
    const parent = makePart({ id: 1, left: 1, short_label: "S001" });
    const child = makePart({ id: 11, left: 1, root_id: 1, short_label: "S001-A1", parent: { id: 1 } as RunPart });

    const displaySlotIndexByPartId = buildDisplaySlotIndexByPartId({
      parts: [parent, child],
      getOverrideSlotIndex: (part) => (part.id === child.id ? 2 : null),
      getDirectSlotIndex: (part) => (part.left ?? 1) - 1,
    });

    expect(displaySlotIndexByPartId.get(parent.id)).toBe(0);
    expect(displaySlotIndexByPartId.get(child.id)).toBe(2);
  });

  it("does not loop forever when finite tray slots are full", () => {
    const displaySlotIndexByPartId = buildDisplaySlotIndexByPartId({
      parts: [
        makePart({ id: 1, short_label: "S001" }),
        makePart({ id: 2, short_label: "S002" }),
        makePart({ id: 3, short_label: "S003" }),
      ],
      slotCount: 2,
      getDirectSlotIndex: () => null,
    });

    expect(displaySlotIndexByPartId.get(1)).toBe(0);
    expect(displaySlotIndexByPartId.get(2)).toBe(1);
    expect(displaySlotIndexByPartId.has(3)).toBe(false);
  });
});
