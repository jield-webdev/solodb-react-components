import { describe, expect, it } from "vitest";
import { getContentEntries, getStateBadgeClass } from "./irisOperatorDashboardUtils";

function asContent(value: unknown) {
  return value as never;
}

describe("getStateBadgeClass", () => {
  it("returns success styles for completed states", () => {
    expect(getStateBadgeClass("completed")).toBe("text-bg-success");
    expect(getStateBadgeClass("uploaded")).toBe("text-bg-success");
  });

  it("returns warning styles for active states", () => {
    expect(getStateBadgeClass("running")).toBe("text-bg-warning");
    expect(getStateBadgeClass("in_progress")).toBe("text-bg-warning");
  });

  it("returns danger styles for error states", () => {
    expect(getStateBadgeClass("failed")).toBe("text-bg-danger");
    expect(getStateBadgeClass("validation_error")).toBe("text-bg-danger");
  });

  it("falls back to info for unknown states", () => {
    expect(getStateBadgeClass("custom-status")).toBe("text-bg-info");
  });
});

describe("getContentEntries", () => {
  it("reads entries from supported content shapes", () => {
    expect(getContentEntries(new Map([["report.txt", "hello"]]))).toEqual([["report.txt", "hello"]]);
    expect(getContentEntries(asContent([["report.txt", "hello"]]))).toEqual([["report.txt", "hello"]]);
    expect(getContentEntries(asContent({ "report.txt": "hello" }))).toEqual([["report.txt", "hello"]]);
  });

  it("ignores invalid content entries", () => {
    expect(
      getContentEntries([
        ["report.txt", 10],
        ["valid.txt", "hello"],
      ] as never)
    ).toEqual([["valid.txt", "hello"]]);
    expect(getContentEntries(null as never)).toEqual([]);
  });
});
