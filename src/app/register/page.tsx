import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "./register-form";
import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { signInWithGitHub } from "~/server/actions/auth";
import { auth } from "~/server/auth";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ claimAudit?: string }>;
}) {
  const session = await auth();
  if (session) redirect("/dashboard");

  const { claimAudit } = await searchParams;

  return (
    <main className="bg-sand-100 flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="border-sand-200 rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-center">
            <h2 className="text-ink text-2xl font-bold tracking-tight">
              Create an account
            </h2>
            <p className="text-sand-600 mt-2 text-sm">
              {claimAudit
                ? "Create an account to save your audit report"
                : "Join Audit to analyze your AI spend"}
            </p>
          </div>

          <RegisterForm claimAudit={claimAudit} />

          <div className="relative my-6">
            <div className="flex items-center">
              <div className="border-sand-200 flex-grow border-t" />
              <span className="text-sand-500 mx-4 text-sm">OR</span>
              <div className="border-sand-200 flex-grow border-t" />
            </div>
          </div>

          <form action={signInWithGitHub}>
            <Button
              variant="outline"
              className="border-sand-300 hover:bg-sand-50 flex h-11 w-full items-center justify-center gap-2 text-sm"
              type="submit"
            >
              <Icons.gitHub className="text-ink h-5 w-5" />
              Continue with GitHub
            </Button>
          </form>

          <p className="text-sand-600 mt-8 text-center text-sm">
            Already a member?{" "}
            <Link
              href="/login"
              className="text-aqua hover:text-aqua-shade font-medium transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
