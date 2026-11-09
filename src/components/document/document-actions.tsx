"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DocumentActionsProps = {
  documentId: string;
  canRetry: boolean;
};

export function DocumentActions({ documentId, canRetry }: DocumentActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<"retry" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function retry() {
    setBusy("retry");
    setError(null);
    const response = await fetch(`/api/documents/${documentId}/process`, { method: "POST" }).catch(() => null);
    if (!response?.ok) setError("We still couldn't read it. Please try again in a minute.");
    setBusy(null);
    router.refresh();
  }

  async function remove() {
    if (!window.confirm("Delete this document for good? This can't be undone.")) return;
    setBusy("delete");
    setError(null);
    const response = await fetch(`/api/documents/${documentId}`, { method: "DELETE" }).catch(() => null);
    if (response?.ok) {
      router.push("/dashboard");
      router.refresh();
      return;
    }
    setError("We couldn't delete it. Please try again.");
    setBusy(null);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {canRetry && (
          <button type="button" onClick={retry} disabled={busy !== null} className="min-h-11 rounded-md bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60">
            {busy === "retry" ? "Reading..." : "Try again"}
          </button>
        )}
        <button type="button" onClick={remove} disabled={busy !== null} className="min-h-11 rounded-md border border-destructive px-4 font-medium text-destructive disabled:opacity-60">
          {busy === "delete" ? "Deleting..." : "Delete document"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
