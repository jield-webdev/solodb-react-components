import { describe, expect, it } from "vitest";
import { getAllowedActionsForState, getErrorMessage } from "./irisOperatorEventDetailsUtils";

describe("getAllowedActionsForState", () => {
  it("returns transitions allowed from started", () => {
    expect(getAllowedActionsForState("started").map((action) => action.action)).toEqual(["reject", "fail"]);
  });

  it("returns transitions allowed from uploading", () => {
    expect(getAllowedActionsForState("uploading").map((action) => action.action)).toEqual(["finish", "reject", "fail"]);
  });

  it("returns transitions allowed from awaiting approval", () => {
    expect(getAllowedActionsForState("awaiting_approval").map((action) => action.action)).toEqual([
      "approve",
      "reject",
      "fail",
    ]);
  });

  it("returns no actions for terminal states", () => {
    expect(getAllowedActionsForState("completed")).toEqual([]);
    expect(getAllowedActionsForState("error")).toEqual([]);
    expect(getAllowedActionsForState("rejected")).toEqual([]);
  });
});

describe("getErrorMessage", () => {
  it("reads api message from response payload", () => {
    expect(getErrorMessage({ response: { data: { message: "invalid transition" } } })).toBe("invalid transition");
  });

  it("falls back to regular error message", () => {
    expect(getErrorMessage(new Error("network failed"))).toBe("network failed");
  });
});
