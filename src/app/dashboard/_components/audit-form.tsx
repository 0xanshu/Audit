"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  Trash2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useAuditStore } from "~/lib/auditStore";
import { createAuditAction } from "~/server/actions/audit";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ButtonUI,
  Input,
  Label,
} from "~/components/dashboard";

/* ─── Zod Schema ──────────────────────────────────────────────────────────────── */

const toolSchema = z.object({
  tool: z.string().min(1, "Tool name is required"),
  plan: z.string().min(1, "Plan is required"),
  monthlySpend: z.coerce
    .number()
    .min(0, "Monthly spend cannot be negative"),
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
  "ChatGPT",
  "Claude",
  "Cursor",
  "Midjourney",
  "GitHub Copilot",
  "Perplexity",
  "Notion AI",
  "OpenAI API",
  "Anthropic API",
  "Gemini",
  "Windsurf",
  "Other",
];

const COMMON_PLANS = [
  "Free",
  "Plus",
  "Pro",
  "Pro+",
  "Team",
  "Business",
  "Enterprise",
  "Ultra",
  "Max",
  "Standard",
  "Pay-as-you-go",
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
      tools: persisted.tools.length > 0 ? persisted.tools : [{ tool: "", plan: "", monthlySpend: 0, seats: 1 }],
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

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      const res = await createAuditAction(data);
      if (res.success && res.auditId) {
        resetForm();
        form.reset();
      } else {
        alert("Failed to analyze tech stack. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting the form.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Core Organization Details */}
        <Card variant="flat" className="bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Tell us about your team so we can tailor the audit to your size
              and use case.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="teamSize">Total Team Size</Label>
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
                <div className="relative">
                  <select
                    id="useCase"
                    {...form.register("useCase")}
                    defaultValue={form.getValues("useCase") || ""}
                    className="h-10 w-full appearance-none rounded-lg border border-sand-300 bg-sand-50 px-3 py-2 text-sm text-ink shadow-sm focus:border-aqua focus:outline-none focus:ring-2 focus:ring-aqua/50"
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
                  <ArrowRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -rotate-90 -translate-y-1/2 text-sand-400" />
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                AI Subscriptions
              </h2>
              <p className="mt-1 text-sm text-sand-600">
                Add each AI tool your team pays for.
              </p>
            </div>
            <ButtonUI
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
                className="bg-white/60 backdrop-blur-sm border border-sand-200/60 hover:border-sand-300/80 transition-all"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-ink">
                      Tool #{index + 1}
                    </h3>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-sand-400 transition-colors hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Tool Name */}
                    <div className="space-y-2">
                      <Label>Tool Name</Label>
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
                      <Label>Plan</Label>
                      <Input
                        placeholder="e.g. Plus, Teams"
                        {...form.register(`tools.${index}.plan`)}
                        list="plan-options"
                      />
                      <datalist id="plan-options">
                        {COMMON_PLANS.map((p) => (
                          <option key={p} value={p} />
                        ))}
                      </datalist>
                      {form.formState.errors.tools?.[index]?.plan && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.tools[index].plan.message}
                        </p>
                      )}
                    </div>

                    {/* Monthly Spend */}
                    <div className="space-y-2">
                      <Label>Monthly Spend ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`tools.${index}.monthlySpend`)}
                      />
                      {form.formState.errors.tools?.[index]?.monthlySpend && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.tools[index].monthlySpend
                            .message}
                        </p>
                      )}
                    </div>

                    {/* Seats */}
                    <div className="space-y-2">
                      <Label>Seats / Licenses</Label>
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between border-t border-sand-200 pt-6">
          <p className="text-sm text-sand-600">
            {fields.length} tool{fields.length > 1 ? "s" : ""} configured
          </p>
          <ButtonUI
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="min-w-[200px]"
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
