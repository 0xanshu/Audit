import { db } from "~/server/db";
import { AuditForm } from "./_components/audit-form";
import { StatsBar } from "./_components/stats-bar";
import { AuditResults } from "./_components/audit-results";
import { HistoricalAudits } from "./_components/historical-audits";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "~/server/actions/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const audits = await db.audit.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const totalSavings = audits.reduce(
    (sum, a) => sum + (a.totalSavingsMonthly ?? 0),
    0,
  );

  const totalTools = audits.reduce(
    (sum, a) =>
      sum +
      (Array.isArray((a.userInput as unknown as { tools?: unknown[] })?.tools)
        ? ((a.userInput as unknown as { tools?: unknown[] }).tools?.length ?? 0)
        : 0),
    0,
  );

  return (
    <div className="bg-sand-100 min-h-screen">
      {/* Top Navigation */}
      <header className="border-sand-200/50 sticky top-0 z-50 border-b bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-aqua text-ink flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                CA
              </div>
              <span className="text-ink text-sm font-semibold tracking-tight">
                Audit
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sand-600 text-sm">
              {session.user.name ?? session.user.email}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sand-600 hover:text-ink text-sm transition-colors"
                title="Log out"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-12 px-5 py-12">
        {/* Hero */}
        <section>
          <h1 className="text-ink text-4xl font-bold tracking-tight sm:text-5xl">
            AI Spend <span className="text-aqua">Audit</span>
          </h1>
          <p className="text-sand-600 mt-3 max-w-2xl text-lg">
            Find savings in your AI tool stack. Input your subscriptions and get
            an instant, data-backed savings report.
          </p>
        </section>

        {/* Stats Bar */}
        <StatsBar
          totalSavings={totalSavings}
          auditCount={audits.length}
          totalTools={totalTools}
        />

        {/* Audit Form */}
        <section id="audit-form" className="scroll-mt-24">
          <AuditForm />
        </section>

        {/* Audit Results */}
        <AuditResults />

        {/* Historical Audits */}
        <HistoricalAudits audits={audits} />
      </main>

      {/* Footer */}
      <footer className="border-sand-200 border-t bg-white/50 py-8">
        <div className="text-sand-600 mx-auto flex max-w-7xl items-center justify-between px-5 text-sm">
          <p> Audit. All rights reserved.</p>
          <Link href="/" className="hover:text-ink transition-colors">
            Terms &middot; Privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}
