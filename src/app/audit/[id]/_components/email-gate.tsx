"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { captureLeadAction } from "~/server/actions/lead";

export function EmailGate({ auditId }: { auditId: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("auditId", auditId);
    setError(null);

    startTransition(async () => {
      const res = await captureLeadAction(fd);
      if (res.error) {
        setError(res.error);
      } else {
        setSubmitted(true);
      }
    });
  }

  // Encode auditId so register page can claim it after account creation
  const registerHref = `/register?claimAudit=${auditId}`;

  return (
    <div className="mt-8 rounded-2xl bg-zinc-900 text-white shadow-xl">
      <div className="flex flex-col items-center p-10 text-center">
        <h2 className="mb-3 text-2xl font-bold">
          Don&apos;t lose your savings plan
        </h2>
        <p className="mb-8 max-w-lg text-zinc-400">
          Save this report and get a shareable link for your team. No credit
          card required.
        </p>

        {submitted ? (
          <div className="space-y-4">
            <p className="text-lg font-semibold text-teal-400">
              ✓ Got it — create an account to save your report permanently.
            </p>
            <Link href={registerHref}>
              <Button
                size="lg"
                className="bg-aqua mt-2 font-semibold text-black hover:bg-teal-400"
              >
                Create Free Account
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                name="email"
                type="email"
                required
                placeholder="your@email.com"
                className="h-11 flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 text-sm text-white placeholder-zinc-500 focus:border-teal-400 focus:outline-none"
              />
              <Button
                type="submit"
                disabled={isPending}
                className="bg-aqua h-11 shrink-0 font-semibold text-black hover:bg-teal-400"
              >
                {isPending ? "Saving..." : "Save Report"}
              </Button>
            </form>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            <p className="mt-4 text-xs text-zinc-500">
              Already have an account?{" "}
              <Link
                href={`/login?callbackUrl=/audit/${auditId}`}
                className="text-teal-400 hover:underline"
              >
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
