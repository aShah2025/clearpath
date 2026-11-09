import Link from "next/link";

const STEPS = [
  {
    title: "Add your document",
    body: "Take a photo or upload the notice, letter, or form you received.",
  },
  {
    title: "Read it in plain words",
    body: "Get a short summary of what the document means for you.",
  },
  {
    title: "Know what to do and when",
    body: "See your next steps in order and every deadline you must meet.",
  },
] as const;

const FEATURES = [
  "Works from a phone photo",
  "Explains in 12 languages",
  "Reads your explanation out loud",
  "Adds deadlines to your calendar",
  "Answers your questions about the document",
  "Points you to free legal help",
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-16">
      <section aria-labelledby="hero-heading" className="space-y-4">
        <h1
          id="hero-heading"
          className="text-3xl font-bold tracking-tight text-balance sm:text-4xl"
        >
          Got a confusing notice? We&apos;ll explain it.
        </h1>
        <p className="max-w-prose text-lg text-muted-foreground">
          ClearPath reads eviction notices, court papers, and government letters and tells
          you, in plain language, what they say, what to do next, and by when.
        </p>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Link href="/documents/new" className="inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-6 font-semibold text-primary-foreground">
            Explain my document
          </Link>
          <Link href="/demo" className="inline-flex min-h-12 items-center justify-center rounded-md border px-6 font-semibold hover:bg-accent">
            See an example first
          </Link>
        </div>
      </section>

      <section aria-labelledby="how-heading" className="mt-12">
        <h2 id="how-heading" className="text-xl font-semibold">
          How it works
        </h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-lg border bg-card p-4 text-card-foreground">
              <p className="text-sm font-semibold text-primary">Step {index + 1}</p>
              <h3 className="mt-1 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="features-heading" className="mt-12">
        <h2 id="features-heading" className="text-xl font-semibold">
          Made for real life
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <li key={feature} className="rounded-lg bg-muted p-4 text-sm font-medium">
              {feature}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
