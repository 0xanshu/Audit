import type { ToolRecommendation } from "~/lib/auditEngine";
import { Card, CardContent, CardTitle, Badge } from "~/components/dashboard";

interface HistoricalAuditsProps {
  audits: {
    id: string;
    createdAt: Date;
    totalSavingsMonthly: number | null;
    userInput: unknown;
    auditResult: unknown;
  }[];
}

export function HistoricalAudits({ audits }: HistoricalAuditsProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-ink">
          Past Audits
        </h2>
        {audits.length > 0 && (
          <span className="text-sm text-sand-600">
            {audits.length} saved audit{audits.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {audits.length === 0 ? (
        <Card
          variant="flat"
          className="bg-sand-50 border border-dashed border-sand-300"
        >
          <CardContent className="p-12 text-center">
            <p className="text-sand-600">
              No audits yet. Fill out the form above to get your first savings
              report.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {audits.map((audit) => {
            const recommendations = (audit.auditResult as ToolRecommendation[]) ?? [];
            const userInput = (audit.userInput as { tools?: { tool: string }[] }) ?? { tools: [] };
            const toolCount = Array.isArray(userInput.tools)
              ? userInput.tools.length
              : 0;
            const actionCount = recommendations.filter(
              (r) => r.savingsMonthly > 0
            ).length;

            return (
              <Card
                key={audit.id}
                variant="default"
                className="overflow-hidden hover:shadow-md transition-all"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col border-b border-sand-200 bg-sand-50/50 p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Audit from {audit.createdAt.toLocaleDateString()}
                      </CardTitle>
                      <p className="mt-1 text-sm text-sand-600">
                        {toolCount} tool{toolCount !== 1 ? "s" : ""} scanned ·{" "}
                        {actionCount} action item{actionCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-4 md:mt-0">
                      <div className="text-right">
                        <p className="text-sm text-sand-600">
                          Potential Savings
                        </p>
                        <p className="text-2xl font-bold text-aqua">
                          $
                          {(audit.totalSavingsMonthly ?? 0).toFixed(2)}/mo
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap gap-2">
                      {recommendations.map((rec, i) => (
                        <Badge
                          key={i}
                          variant={
                            rec.status === "keep"
                              ? "default"
                              : rec.status === "downgrade" ||
                                rec.status === "cancel"
                              ? "danger"
                              : "warning"
                          }
                        >
                          {rec.tool}: {rec.status}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
