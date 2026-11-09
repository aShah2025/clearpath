import type { Metadata } from "next";
import { DemoView } from "@/components/document/demo-view";

export const metadata: Metadata = {
  title: "See an example",
  description: "See how ClearPath explains a sample eviction notice.",
};

export default function DemoPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">See how it works</h1>
      <p className="mt-2 max-w-prose text-muted-foreground">
        This is a made-up eviction notice with a prepared example result. No account is needed.
      </p>
      <DemoView />
    </div>
  );
}
