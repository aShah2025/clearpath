import Link from "next/link";

type SiteHeaderProps = {
  appName: string;
};

export function SiteHeader({ appName }: SiteHeaderProps) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4">
        <Link
          href="/"
          className="rounded-md text-lg font-semibold tracking-tight text-foreground"
        >
          {appName}
        </Link>
        <nav aria-label="Main">
          <ul className="flex items-center gap-1 text-sm font-medium">
            <li>
              <Link
                href="/demo"
                className="inline-flex min-h-11 items-center rounded-md px-2 text-foreground underline-offset-4 hover:underline"
              >
                Example
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard"
                className="inline-flex min-h-11 items-center rounded-md px-2 text-foreground underline-offset-4 hover:underline"
              >
                My documents
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
