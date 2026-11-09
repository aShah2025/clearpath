import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { AskQuestion } from "@/components/document/ask-question";
import { DocumentActions } from "@/components/document/document-actions";
import { DocumentResult } from "@/components/document/document-result";
import { getCurrentUser } from "@/lib/auth";
import { getDocument, type DocumentDetail } from "@/lib/data/documents";
import { NotFoundError } from "@/lib/errors";

export const metadata: Metadata = { title: "Your document" };

type Params = PageProps<"/documents/[id]">["params"];

async function loadDocument(userId: string, id: string): Promise<DocumentDetail> {
  try {
    return await getDocument(userId, id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
}

async function DocumentContent({ params }: { params: Params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;
  const document = await loadDocument(user.id, id);
  const finished = document.status === "COMPLETED" && document.plainSummary;

  return (
    <>
      <h1 className="mt-2 text-2xl font-bold tracking-tight break-words">{document.fileName}</h1>
      <div className="mt-6 space-y-8">
        {finished ? (
          <>
            <DocumentResult
              summary={document.plainSummary!}
              languageTag={document.targetLanguage}
              persist
              items={document.actionItems.map((item) => ({
                ...item,
                dueDate: item.dueDate?.toISOString() ?? null,
              }))}
            />
            <AskQuestion documentId={document.id} languageTag={document.targetLanguage} />
          </>
        ) : (
          <p role="status" className="rounded-lg border bg-muted p-4">
            {document.status === "PROCESSING"
              ? "We're still reading this document. Refresh this page in a minute."
              : "We couldn't read this document yet. A clearer photo may help."}
          </p>
        )}
        <DocumentActions documentId={document.id} canRetry={document.status === "FAILED" || document.status === "PENDING"} />
      </div>
    </>
  );
}

export default function DocumentPage({ params }: PageProps<"/documents/[id]">) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Link href="/dashboard" className="text-sm font-medium text-primary underline underline-offset-4">
        Back to my documents
      </Link>
      <Suspense fallback={<p className="mt-6">Loading your document...</p>}>
        <DocumentContent params={params} />
      </Suspense>
    </div>
  );
}
