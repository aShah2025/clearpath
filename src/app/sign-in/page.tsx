import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

async function LinkError({ searchParams }: { searchParams: PageProps<"/sign-in">["searchParams"] }) {
  const { error } = await searchParams;
  if (!error) return null;
  return (
    <p role="alert" className="mt-4 text-sm font-medium text-destructive">
      That sign-in link didn&apos;t work or has expired. Please ask for a new one.
    </p>
  );
}

export default function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
      <p className="mt-2 text-muted-foreground">
        No password needed. Your documents are private and only you can see them.
      </p>
      <Suspense>
        <LinkError searchParams={searchParams} />
      </Suspense>
      <SignInForm />
    </div>
  );
}
