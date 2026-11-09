import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { signOut } from "@/app/sign-in/actions";
import { getCurrentUser } from "@/lib/auth";
import { listTimeline } from "@/lib/data/action-items";
import { listDocuments } from "@/lib/data/documents";

export const metadata: Metadata = { title: "My documents" };

const STATUS_LABELS = { PENDING: "Not read yet", PROCESSING: "Reading", COMPLETED: "Ready", FAILED: "Needs another try" } as const;

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(date);
}

async function DashboardContent() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [{ documents }, timeline] = await Promise.all([listDocuments(user.id), listTimeline(user.id)]);
  const upcoming = timeline.filter((item) => item.dueDate).slice(0, 5);

  return (
    <div className="mt-8 space-y-10">
      {upcoming.length > 0 && (
        <section aria-labelledby="upcoming-heading">
          <h2 id="upcoming-heading" className="text-xl font-semibold">
            Coming up
          </h2>
          <ul className="mt-3 space-y-2">
            {upcoming.map((item) => (
              <li key={item.id} className="rounded-lg border-l-4 border-destructive bg-card p-3">
                <p className="text-sm font-semibold">{formatDate(item.dueDate!)}</p>
                <Link href={`/documents/${item.documentId}`} className="font-medium underline underline-offset-4">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="documents-heading">
        <h2 id="documents-heading" className="text-xl font-semibold">
          Documents
        </h2>
        {documents.length === 0 ? (
          <p className="mt-3 text-muted-foreground">Nothing here yet. Add a notice or letter to get started.</p>
        ) : (
          <ul className="mt-3 divide-y rounded-lg border">
            {documents.map((document) => (
              <li key={document.id}>
                <Link href={`/documents/${document.id}`} className="flex min-h-14 items-center justify-between gap-3 p-3 hover:bg-accent">
                  <span className="min-w-0 truncate font-medium">{document.fileName}</span>
                  <span className="shrink-0 text-sm text-muted-foreground">{STATUS_LABELS[document.status]}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form action={signOut}>
        <button type="submit" className="min-h-11 text-sm font-medium underline underline-offset-4">
          Sign out
        </button>
      </form>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">My documents</h1>
        <Link href="/documents/new" className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 font-semibold text-primary-foreground">
          Add a document
        </Link>
      </div>
      <Suspense fallback={<p className="mt-8">Loading your documents...</p>}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
