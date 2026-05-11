"use client";

import { useActionState } from "react";
import { Button } from "~/components/ui/button";
import { registerAction } from "~/server/actions/auth";

export function RegisterForm() {
  const [error, formAction, isPending] = useActionState<
    { error: string } | undefined,
    FormData
  >(async (prevState: { error: string } | undefined, formData: FormData) => {
    const result = await registerAction(formData);
    if (result?.error) {
      return result;
    }
  }, undefined);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <div>
        <label htmlFor="name" className="text-ink block text-sm font-medium">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="border-sand-300 bg-sand-50 text-ink placeholder:text-sand-600 focus:border-aqua focus:ring-aqua mt-2 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-all focus:ring-1 focus:outline-none"
          placeholder="Jane Doe"
        />
      </div>
      <div>
        <label htmlFor="email" className="text-ink block text-sm font-medium">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="border-sand-300 bg-sand-50 text-ink placeholder:text-sand-600 focus:border-aqua focus:ring-aqua mt-2 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-all focus:ring-1 focus:outline-none"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="text-ink block text-sm font-medium"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="border-sand-300 bg-sand-50 text-ink placeholder:text-sand-600 focus:border-aqua focus:ring-aqua mt-2 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-all focus:ring-1 focus:outline-none"
          placeholder="••••••••"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error.error}</p>}

      <div className="flex flex-col gap-4">
        <Button
          variant="pill"
          className="bg-aqua text-ink hover:bg-aqua-shade h-11 w-full font-semibold hover:text-white"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Creating account..." : "Sign Up"}
        </Button>
      </div>
    </form>
  );
}
