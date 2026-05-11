import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { signInWithGitHub } from "~/server/actions/auth";
import { auth } from "~/server/auth";

export default async function LoginPage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-sand-100 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-sand-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-ink">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-sand-600">
              Sign in to view your audits
            </p>
          </div>

          <LoginForm />

          <div className="relative my-6">
            <div className="flex items-center">
              <div className="flex-grow border-t border-sand-200" />
              <span className="mx-4 text-sm text-sand-500">OR</span>
              <div className="flex-grow border-t border-sand-200" />
            </div>
          </div>

          <form action={signInWithGitHub}>
            <Button
              variant="outline"
              className="flex h-11 w-full items-center justify-center gap-2 text-sm border-sand-300 hover:bg-sand-50"
              type="submit"
            >
              <Icons.gitHub className="h-5 w-5 text-ink" />
              Continue with GitHub
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-sand-600">
            Not a member?{" "}
            <Link
              href="/register"
              className="text-aqua hover:text-aqua-shade font-medium transition-colors"
            >
              Join Now
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
