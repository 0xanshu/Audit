import { db } from "~/server/db";
import { AuditForm } from "./_components/audit-form";
import { StatsBar } from "./_components/stats-bar";
import { AuditResults } from "./_components/audit-results";
import { HistoricalAudits } from "./_components/historical-audits";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "~/components/navbar";

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
    <div className="min-h-screen bg-[#f5ecdc]/80">
      {/* Top Navigation */}
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-12 px-5 py-12">
        {/* Hero */}
        <section>
          <h1 className="text-ink font-tomato text-4xl font-semibold tracking-tight sm:text-5xl">
            AI Spend <span className="text-aqua">Audit</span>
          </h1>
          <p className="text-sand-600 text-md mt-3 max-w-2xl">
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
