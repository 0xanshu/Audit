import Link from "next/link";
import { auth } from "~/server/auth";
import { logoutAction } from "~/server/actions/auth";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f5ecdc]/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-ink font-tomato text-3xl font-semibold tracking-tight">
              Audit
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="text-ink hover:text-aqua text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <div className="h-4 w-px bg-black/20" />
              <span className="text-sand-800 text-sm font-medium">
                {session.user.name ?? session.user.email}
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-sand-600 hover:text-ink cursor-pointer text-sm font-medium transition-colors"
                  title="Log out"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hover:text-sand-600 text-ink text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <div className="h-4 w-px bg-black/20" />
              <Link
                href="/register"
                className="hover:text-sand-600 text-ink text-sm font-medium transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
