"use client";

type ErrorPageProps = {
  retry: () => void;
};

export default function ErrorPage({ retry }: ErrorPageProps) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mt-2">Your documents are safe. Please try again in a moment.</p>
      <button type="button" onClick={retry} className="mt-4 min-h-11 rounded-md bg-primary px-4 font-semibold text-primary-foreground">
        Try again
      </button>
    </div>
  );
}
