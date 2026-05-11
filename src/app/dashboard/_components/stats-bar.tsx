import { TrendingDown, BarChart3, Layers, ArrowUpRight } from "lucide-react";
import { StatCard } from "~/components/dashboard";

interface StatsBarProps {
  totalSavings: number;
  auditCount: number;
  totalTools: number;
}

export function StatsBar({ totalSavings, auditCount, totalTools }: StatsBarProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Savings Found"
        value={`$${totalSavings.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`}
        subtext="Per month"
        icon={<TrendingDown className="h-5 w-5" />}
        tone={totalSavings > 0 ? "success" : "default"}
      />
      <StatCard
        label="Audits Run"
        value={String(auditCount)}
        subtext={auditCount === 1 ? "Audit" : "Audits"}
        icon={<BarChart3 className="h-5 w-5" />}
      />
      <StatCard
        label="Tools Scanned"
        value={String(totalTools)}
        subtext={totalTools === 1 ? "Tool" : "Tools"}
        icon={<Layers className="h-5 w-5" />}
      />
      <StatCard
        label="Avg. Savings / Audit"
        value={`$${
          auditCount > 0
            ? (totalSavings / auditCount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : "0.00"
        }`}
        subtext="Per month"
        icon={<ArrowUpRight className="h-5 w-5" />}
      />
    </section>
  );
}
