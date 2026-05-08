import Link from "next/link";
import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0F1117] p-4 text-white">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to save your money!
          </p>
        </div>

        <form className="mt-4 space-y-6">
          <div className="space-y-4">
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

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="text-brand focus:ring-brand h-4 w-4 rounded border-gray-700 bg-[#1A1D24] focus:ring-offset-[#0F1117]"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-300"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="text-brand hover:text-brand/80 font-medium"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <Button
              variant="pill"
              className="bg-brand hover:bg-brand/90 h-11 w-full text-base font-bold text-[#0C0C0E]"
              type="submit"
            >
              Sign In
            </Button>
          </div>
        </form>

        <div className="mt-4">
          <form
            action={async () => {
              "use server";
              const { signIn } = await import("~/server/auth");
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

        <p className="mt-8 text-center text-sm text-[#8E8E93]">
          Not a member?{" "}
          <Link
            href="/register"
            className="text-brand hover:text-brand/80 font-medium"
          >
            Join Now
          </Link>
        </p>
      </div>
    </main>
  );
}
