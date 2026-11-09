"use client";

import { Camera, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { TARGET_LANGUAGES } from "@/lib/ai/languages";
import { cn } from "@/lib/utils";

type Mode = "file" | "text";
type Stage = "idle" | "uploading" | "reading" | "error";

const MAX_IMAGE_EDGE = 2200;

/** Shrinks phone photos so uploads are fast on mobile data. PDFs pass through. */
async function prepareFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { message?: string; issues?: { message: string }[] } };
    return body.error?.issues?.[0]?.message ?? body.error?.message ?? "Something went wrong. Please try again.";
  } catch {
    return "Something went wrong. Please try again.";
  }
}

export function UploadForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("file");
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const busy = stage === "uploading" || stage === "reading";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStage("uploading");

    try {
      const data = new FormData(event.currentTarget);
      const file = data.get("file");
      if (mode === "file" && file instanceof File && file.size > 0) {
        data.set("file", await prepareFile(file));
      } else {
        data.delete("file");
      }

      const created = await fetch("/api/documents", { method: "POST", body: data });
      if (!created.ok) throw new Error(await errorMessage(created));
      const { document } = (await created.json()) as { document: { id: string } };

      setStage("reading");
      const processed = await fetch(`/api/documents/${document.id}/process`, { method: "POST" });
      if (!processed.ok && processed.status !== 502) throw new Error(await errorMessage(processed));
      // A failed reading still has a page, with a "try again" button.
      router.push(`/documents/${document.id}`);
    } catch (caught) {
      setStage("error");
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    }
  }

  const tabClass = (active: boolean) =>
    cn(
      "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border px-3 font-medium",
      active ? "bg-primary text-primary-foreground" : "hover:bg-accent",
    );

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <div role="group" aria-label="How to add your document" className="flex gap-2">
        <button type="button" aria-pressed={mode === "file"} onClick={() => setMode("file")} className={tabClass(mode === "file")}>
          <Camera className="size-4" aria-hidden /> Photo or PDF
        </button>
        <button type="button" aria-pressed={mode === "text"} onClick={() => setMode("text")} className={tabClass(mode === "text")}>
          <FileText className="size-4" aria-hidden /> Type or paste
        </button>
      </div>

      {mode === "file" ? (
        <div>
          <label htmlFor="file" className="block font-medium">
            Take a photo or choose a file
          </label>
          <input
            id="file"
            name="file"
            type="file"
            required
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="mt-1 block min-h-11 w-full rounded-md border border-input bg-background p-2"
          />
          <p className="mt-1 text-sm text-muted-foreground">Lay the page flat in good light. Include the whole page.</p>
        </div>
      ) : (
        <div>
          <label htmlFor="text" className="block font-medium">
            Document text
          </label>
          <textarea id="text" name="text" required rows={10} className="mt-1 w-full rounded-md border border-input bg-background p-3" />
        </div>
      )}

      <div>
        <label htmlFor="targetLanguage" className="block font-medium">
          Explain it to me in
        </label>
        <select id="targetLanguage" name="targetLanguage" defaultValue="en" className="mt-1 min-h-11 w-full rounded-md border border-input bg-background px-3">
          {TARGET_LANGUAGES.map((language) => (
            <option key={language.tag} value={language.tag} lang={language.tag}>
              {language.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p role="alert" className="font-medium text-destructive">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="min-h-11 w-full rounded-md bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60">
        {stage === "uploading" ? "Adding your document..." : stage === "reading" ? "Reading it now. This can take a minute..." : "Explain this document"}
      </button>
      <p role="status" className="sr-only">
        {stage === "reading" ? "Reading your document. This can take a minute." : ""}
      </p>
    </form>
  );
}
