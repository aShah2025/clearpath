import { describe, expect, it } from "vitest";
import { detectFileType } from "@/lib/storage/file-types";

describe("detectFileType", () => {
  it.each([
    ["image/jpeg", [0xff, 0xd8, 0xff, 0xe0]],
    ["image/png", [0x89, 0x50, 0x4e, 0x47]],
    ["application/pdf", [0x25, 0x50, 0x44, 0x46]],
    ["image/webp", [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]],
  ])("recognizes %s", (mediaType, bytes) => {
    expect(detectFileType(new Uint8Array(bytes))?.mediaType).toBe(mediaType);
  });

  it("rejects anything else", () => {
    expect(detectFileType(new TextEncoder().encode("<html><script>"))).toBeNull();
  });
});
