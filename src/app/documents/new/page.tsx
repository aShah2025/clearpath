import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { UploadForm } from "@/components/document/upload-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Add a document" };

async function SignedInForm() {
  if (!(await getCurrentUser())) redirect("/sign-in");
  return <UploadForm />;
}

export default function NewDocumentPage() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Add a document</h1>
      <p className="mt-2 text-muted-foreground">Only you can see what you add. You can delete it at any time.</p>
      <Suspense fallback={<p className="mt-6">Loading...</p>}>
        <SignedInForm />
      </Suspense>
    </div>
  );
}
