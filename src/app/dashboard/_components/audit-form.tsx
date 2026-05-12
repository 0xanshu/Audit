"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Loader2, ArrowRight } from "lucide-react";
import { useAuditStore } from "~/lib/auditStore";
import { createAuditAction } from "~/server/actions/audit";
import { AI_TOOLS_PRICING } from "~/data/pricing";
import {
  Card,
  CardContent,
  ButtonUI,
  Input,
  Label,
} from "~/components/dashboard";

/* ─── Zod Schema ──────────────────────────────────────────────────────────────── */

const toolSchema = z.object({
  tool: z.string().min(1, "Tool name is required"),
  plan: z.string().min(1, "Plan is required"),
  monthlySpend: z.coerce.number().min(0, "Monthly spend cannot be negative"),
  seats: z.coerce.number().min(1, "Must have at least 1 seat"),
});

const formSchema = z.object({
  teamSize: z.coerce.number().min(1, "Must have at least 1 member"),
  useCase: z.string().min(2, "Use case is required"),
  tools: z.array(toolSchema).min(1, "Add at least one tool"),
});

export type FormValues = z.infer<typeof formSchema>;

/* ─── Constants ──────────────────────────────────────────────────────────────── */

const COMMON_TOOLS = [
  ...Object.values(AI_TOOLS_PRICING).map((t) => t.tool),
  "Other",
];

const USE_CASES = [
  "Software Engineering",
  "Content Creation",
  "Data Analysis",
  "Research",
  "Customer Support",
  "Design",
  "General Productivity",
  "Heavy AI Workloads",
];

/* ─── Component ───────────────────────────────────────────────────────────────── */

export function AuditForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    formState: persisted,
    setTools,
    setField,
    resetForm,
  } = useAuditStore();

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      teamSize: persisted.teamSize ?? 1,
      useCase: persisted.useCase ?? "",
      tools:
        persisted.tools.length > 0
          ? persisted.tools
          : [{ tool: "", plan: "", monthlySpend: 0, seats: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "tools",
    control: form.control,
  });

  // Sync React Hook Form with Zustand (side effects → useEffect)
  const watchedTeamSize = form.watch("teamSize");
  const watchedUseCase = form.watch("useCase");
  const watchedTools = form.watch("tools");

  useEffect(() => {
    setField("teamSize", watchedTeamSize);
  }, [watchedTeamSize, setField]);

  useEffect(() => {
    setField("useCase", watchedUseCase);
  }, [watchedUseCase, setField]);

  useEffect(() => {
    setTools(watchedTools);
  }, [watchedTools, setTools]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (
        name?.startsWith("tools.") &&
        (name.endsWith(".tool") ||
          name.endsWith(".plan") ||
          name.endsWith(".seats"))
      ) {
        const match = /tools\.(\d+)\.(.*)/.exec(name);
        if (match?.[1]) {
          const index = parseInt(match[1], 10);
          const currentTool = value.tools?.[index];
          if (currentTool?.tool && currentTool?.plan) {
            const toolPricing = Object.values(AI_TOOLS_PRICING).find(
              (t) => t.tool === currentTool.tool,
            );
            if (toolPricing?.plans) {
              const planKey = Object.keys(toolPricing.plans).find(
                (k) =>
                  toolPricing.plans[k]?.name.toLowerCase() ===
                  currentTool.plan?.toLowerCase(),
              );
              if (planKey) {
                const planPricing = toolPricing.plans[planKey];
                if (planPricing) {
                  const seats = Number(currentTool.seats) || 1;
                  const cost = planPricing.priceMonthly * seats;
                  form.setValue(`tools.${index}.monthlySpend`, cost, {
                    shouldValidate: true,
                  });
                }
              }
            }
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      const store = useAuditStore.getState();
      store.setIsProcessing(true);

      const res = await createAuditAction(data);
      if (res.success && res.auditId) {
        resetForm();
        form.reset();
        setTimeout(() => {
          window.location.href = `/dashboard/audit/${res.auditId}`;
        }, 500);
      } else {
        alert("Failed to analyze tech stack. Please try again.");
        store.setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting the form.");
      const store = useAuditStore.getState();
      store.setIsProcessing(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Core Organization Details */}
        <div>
          <h2 className="text-ink text-2xl font-semibold tracking-tight">
            Organization Details
          </h2>
          <p className="text-sand-600 mt-1 text-sm">
            Tell us about your team so we can tailor the audit to your size and
            use case.
          </p>
        </div>
        <Card variant="flat" className="bg-white backdrop-blur-sm">
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <div className="mb-1">
                  <Label htmlFor="teamSize">Total Team Size</Label>
                </div>
                <Input
                  id="teamSize"
                  type="number"
                  placeholder="e.g. 10"
                  {...form.register("teamSize")}
                />
                {form.formState.errors.teamSize && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.teamSize.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="useCase">Primary Use Case</Label>
                <div className="relative mt-1 cursor-pointer">
                  <select
                    id="useCase"
                    {...form.register("useCase")}
                    defaultValue={form.getValues("useCase") || ""}
                    className="border-sand-300 bg-sand-50 text-ink focus:border-aqua focus:ring-aqua/50 h-10 w-full appearance-none rounded-lg border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:outline-none"
                  >
                    <option value="" disabled>
                      Select your primary use case...
                    </option>
                    {USE_CASES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                  <ArrowRight className="text-sand-400 pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 -rotate-90" />
                </div>
                {form.formState.errors.useCase && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.useCase.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Tool Listing */}
        <div className="mt-12 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-ink text-2xl font-semibold tracking-tight">
                AI Subscriptions
              </h2>
              <p className="text-sand-600 mt-1 text-sm">
                Add each AI tool your team pays for.
              </p>
            </div>
            <ButtonUI
              className="cursor-pointer"
              type="button"
              variant="secondary"
              onClick={() =>
                append({ tool: "", plan: "", monthlySpend: 0, seats: 1 })
              }
            >
              <Plus className="h-4 w-4" />
              Add Tool
            </ButtonUI>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card
                key={field.id}
                variant="borderless"
                className="bg-white backdrop-blur-sm transition-all"
              >
                <CardContent className="">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-ink text-lg font-semibold">
                      Tool {index + 1}
                    </h3>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-sand-400 cursor-pointer transition-colors hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Tool Name */}
                    <div className="space-y-2">
                      <div className="mb-1">
                        <Label>Tool Name</Label>
                      </div>
                      <Input
                        placeholder="e.g. ChatGPT"
                        {...form.register(`tools.${index}.tool`)}
                        list="tool-options"
                      />
                      <datalist id="tool-options">
                        {COMMON_TOOLS.map((t) => (
                          <option key={t} value={t} />
                        ))}
                      </datalist>
                      {form.formState.errors.tools?.[index]?.tool && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.tools[index].tool.message}
                        </p>
                      )}
                    </div>

                    {/* Plan */}
                    <div className="space-y-2">
                      <div className="mb-1">
                        <Label>Plan</Label>
                      </div>
                      <Input
                        placeholder="e.g. Plus, Teams"
                        {...form.register(`tools.${index}.plan`)}
                        list={`plan-options-${index}`}
                      />
                      <datalist id={`plan-options-${index}`}>
                        {(() => {
                          const tName = watchedTools?.[index]?.tool;
                          const tPricing = Object.values(AI_TOOLS_PRICING).find(
                            (t) => t.tool === tName,
                          );
                          if (tPricing) {
                            return Object.values(tPricing.plans).map((p) => (
                              <option key={p.name} value={p.name} />
                            ));
                          }
                          return ["Free", "Pro", "Enterprise", "Other"].map(
                            (p) => <option key={p} value={p} />,
                          );
                        })()}
                      </datalist>
                      {form.formState.errors.tools?.[index]?.plan && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.tools[index].plan.message}
                        </p>
                      )}
                    </div>

                    {/* Seats */}
                    <div className="space-y-2">
                      <div className="mb-1">
                        <Label>Seats / Licenses</Label>
                      </div>
                      <Input
                        type="number"
                        {...form.register(`tools.${index}.seats`)}
                      />
                      {form.formState.errors.tools?.[index]?.seats && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.tools[index].seats.message}
                        </p>
                      )}
                    </div>

                    {/* Monthly Spend */}
                    <div className="space-y-2">
                      <div className="mb-1">
                        <Label>Monthly Spend ($)</Label>
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`tools.${index}.monthlySpend`)}
                      />
                      {form.formState.errors.tools?.[index]?.monthlySpend && (
                        <p className="text-sm text-red-500">
                          {
                            form.formState.errors.tools[index].monthlySpend
                              .message
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="border-sand-200 flex items-center justify-between border-t pt-6">
          <p className="text-sand-600 text-sm">
            {fields.length} tool{fields.length > 1 ? "s" : ""} configured
          </p>
          <ButtonUI
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="min-w-[200px] cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing Stack...
              </>
            ) : (
              <>
                Generate Savings Report
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </ButtonUI>
        </div>
      </form>
    </div>
  );
}
