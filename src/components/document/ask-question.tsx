"use client";

import { useState, type FormEvent } from "react";
import { ReadAloudButton } from "@/components/document/read-aloud-button";

type AskQuestionProps = {
  documentId: string;
  languageTag: string;
};

export function AskQuestion({ documentId, languageTag }: AskQuestionProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setAnswer(null);
    try {
      const response = await fetch(`/api/documents/${documentId}/ask`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const body = (await response.json()) as { answer?: string; error?: { message: string } };
      if (!response.ok || !body.answer) throw new Error(body.error?.message);
      setAnswer(body.answer);
    } catch (caught) {
      setError((caught instanceof Error && caught.message) || "We couldn't answer that. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section aria-labelledby="ask-heading" className="rounded-lg border p-4">
      <h2 id="ask-heading" className="text-lg font-semibold">
        Ask about this document
      </h2>
      <form onSubmit={submit} className="mt-3 space-y-3">
        <label htmlFor="question" className="block text-sm font-medium">
          Your question
        </label>
        <input
          id="question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={500}
          required
          placeholder="Who do I have to pay?"
          className="min-h-11 w-full rounded-md border border-input bg-background px-3"
        />
        <button type="submit" disabled={pending} className="min-h-11 rounded-md bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60">
          {pending ? "Looking..." : "Ask"}
        </button>
      </form>
      <div aria-live="polite">
        {error && <p className="mt-3 font-medium text-destructive">{error}</p>}
        {answer && (
          <div className="mt-3 rounded-md bg-accent p-3" lang={languageTag}>
            <p className="whitespace-pre-line">{answer}</p>
            <div className="mt-2">
              <ReadAloudButton text={answer} languageTag={languageTag} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
