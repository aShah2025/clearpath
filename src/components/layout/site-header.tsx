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
          <ul className="flex items-center gap-4 text-sm font-medium">
            <li>
              <Link
                href="/"
                className="inline-flex min-h-11 items-center rounded-md px-2 text-foreground underline-offset-4 hover:underline"
              >
                Home
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
