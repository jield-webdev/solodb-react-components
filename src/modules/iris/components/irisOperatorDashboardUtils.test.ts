import { describe, expect, it } from "vitest";
import { getContentEntries, getStateBadgeClass } from "./irisOperatorDashboardUtils";

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
    expect(getContentEntries({ "report.txt": "hello" })).toEqual([["report.txt", "hello"]]);
  });

  it("returns no entries for missing content", () => {
    expect(getContentEntries(null)).toEqual([]);
  });
});
