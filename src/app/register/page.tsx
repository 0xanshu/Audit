import Link from "next/link";
import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { signIn } from "~/server/auth";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0F1117] p-4 text-white">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Join AuditsPro to start analyzing
          </p>
        </div>

        <form className="mt-4 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="focus:border-brand focus:ring-brand mt-2 block w-full rounded-md border border-gray-700 bg-[#1A1D24] px-3 py-2 text-white placeholder-gray-500 transition-colors focus:ring-1 focus:outline-none"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="focus:border-brand focus:ring-brand mt-2 block w-full rounded-md border border-gray-700 bg-[#1A1D24] px-3 py-2 text-white placeholder-gray-500 transition-colors focus:ring-1 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="focus:border-brand focus:ring-brand mt-2 block w-full rounded-md border border-gray-700 bg-[#1A1D24] px-3 py-2 text-white placeholder-gray-500 transition-colors focus:ring-1 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <Button
              variant="pill"
              className="bg-brand hover:bg-brand/90 h-11 w-full text-base font-bold text-[#0C0C0E]"
              type="submit"
            >
              Sign Up
            </Button>
          </div>
        </form>

        <div className="mt-4">
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
          >
            <Button
              variant="pill"
              className="flex h-11 w-full items-center justify-center gap-2 text-base"
              type="submit"
            >
              <Icons.gitHub className="text-brand h-5 w-5" />
              Continue with GitHub
            </Button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          Already a member?{" "}
          <Link
            href="/login"
            className="text-brand hover:text-brand/80 font-medium"
          >
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
