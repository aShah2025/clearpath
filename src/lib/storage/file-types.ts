export type AllowedFile = {
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "application/pdf";
  extension: string;
  maxBytes: number;
};

const MB = 1024 * 1024;
// Claude accepts images up to 5 MB once base64-encoded (about 3.7 MB raw).
const IMAGE_MAX = Math.floor(3.7 * MB);
const PDF_MAX = 9 * MB;

/** Identifies a file by its leading bytes; the browser's claimed type is not trusted. */
export function detectFileType(bytes: Uint8Array): AllowedFile | null {
  const starts = (signature: number[], offset = 0) =>
    signature.every((value, index) => bytes[offset + index] === value);

  if (starts([0xff, 0xd8, 0xff])) return { mediaType: "image/jpeg", extension: "jpg", maxBytes: IMAGE_MAX };
  if (starts([0x89, 0x50, 0x4e, 0x47])) return { mediaType: "image/png", extension: "png", maxBytes: IMAGE_MAX };
  if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8)) {
    return { mediaType: "image/webp", extension: "webp", maxBytes: IMAGE_MAX };
  }
  if (starts([0x25, 0x50, 0x44, 0x46])) return { mediaType: "application/pdf", extension: "pdf", maxBytes: PDF_MAX };
  return null;
}
