import { describe, expect, it } from "vitest";
import { extractRoomNumber, normalizeScannedQrCodeContent, scannedCodeIsRoomCode } from "./chemicalContainerUtils";

describe("chemical scanner QR utilities", () => {
  it("identifies and extracts room QR codes", () => {
    expect(scannedCodeIsRoomCode("/r/42")).toBe(true);
    expect(scannedCodeIsRoomCode("https://example.test/r/42")).toBe(true);
    expect(scannedCodeIsRoomCode("/l/42")).toBe(false);
    expect(extractRoomNumber("/r/42")).toBe(42);
  });

  it("removes unnecessary escapes from pipe-delimited label contents", () => {
    expect(normalizeScannedQrCodeContent("CH-910528-0\\|STBL2267\\|0052622942\\|001\\|")).toBe(
      "CH-910528-0|STBL2267|0052622942|001|"
    );
  });
});
