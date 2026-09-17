import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ScannerProvider } from "./scannerProvider";

describe("ScannerProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reads scanner keys on keydown so shifted characters are preserved", () => {
    const addEventListener = vi.spyOn(document, "addEventListener");
    const removeEventListener = vi.spyOn(document, "removeEventListener");

    const { unmount } = render(
      <ScannerProvider>
        <div />
      </ScannerProvider>
    );

    const keydownRegistration = addEventListener.mock.calls.find(([eventName]) => eventName === "keydown");
    expect(keydownRegistration).toBeDefined();

    unmount();

    expect(removeEventListener.mock.calls.some(([eventName]) => eventName === "keydown")).toBe(true);
  });
});
