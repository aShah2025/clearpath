const RESOURCES = [
  { name: "LawHelp.org", detail: "Find free legal aid and know-your-rights guides by state.", href: "https://www.lawhelp.org" },
  { name: "Legal Services Corporation", detail: "Find a federally funded legal aid office near you.", href: "https://www.lsc.gov/about-lsc/what-legal-aid/get-legal-help" },
  { name: "211", detail: "Call 211 for help with rent, food, and bills.", href: "https://www.211.org" },
] as const;

export function LegalHelp() {
  return (
    <section aria-labelledby="legal-help-heading" className="rounded-lg border bg-muted p-4">
      <h2 id="legal-help-heading" className="text-lg font-semibold">
        Talk to a real person for free
      </h2>
      <ul className="mt-3 space-y-3">
        {RESOURCES.map((resource) => (
          <li key={resource.name}>
            <a href={resource.href} target="_blank" rel="noreferrer" className="font-semibold text-primary underline underline-offset-4">
              {resource.name}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <p className="text-sm">{resource.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
