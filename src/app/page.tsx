import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, TrendingDown } from "lucide-react";
import { Navbar } from "~/components/navbar";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#f5ecdc]">
      {/* Top Navigation */}
      <Navbar />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-ink font-tomato text-5xl tracking-tight sm:text-7xl">
            Cut Your <span className="text-aqua font-tomato">AI Tool</span>{" "}
            Spend
          </h1>
          <p className="mx-auto max-w-2xl text-[1.3em] leading-relaxed text-black">
            We analyze your organization&apos;s AI tool subscriptions and find
            actionable ways to save money, downgrade over-provisioned plans, and
            consolidate overlapping tools.
          </p>
          <div className="flex flex-col items-center gap-4 pt-4">
            <Link href="/dashboard">
              <button className="bg-aqua text-ink hover:bg-aqua-shade inline-flex cursor-pointer items-center justify-center gap-3 rounded-[2px] px-8 py-3.5 text-base font-medium transition-colors hover:text-black">
                Get Your Free Audit
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
            <p className="text-sm text-black/50">
              Takes less than 2 minutes. No credit card required.
            </p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mx-auto mt-20 grid max-w-5xl gap-6 px-4 sm:grid-cols-3">
          <div className="border-sand-200 rounded-xl border bg-white/60 p-6 text-center backdrop-blur-sm transition-all hover:shadow-sm">
            <ShieldCheck className="text-aqua mx-auto mb-3 h-8 w-8" />
            <h3 className="text-ink font-semibold">Data-Driven</h3>
            <p className="text-sand-600 mt-2 text-sm">
              Powered by real market pricing data for 8+ AI tools.
            </p>
          </div>
          <div className="border-sand-200 rounded-xl border bg-white/60 p-6 text-center backdrop-blur-sm transition-all hover:shadow-sm">
            <Zap className="text-aqua mx-auto mb-3 h-8 w-8" />
            <h3 className="text-ink font-semibold">Instant</h3>
            <p className="text-sand-600 mt-2 text-sm">
              Get results in seconds. No meetings, no sales calls.
            </p>
          </div>
          <div className="border-sand-200 rounded-xl border bg-white/60 p-6 text-center backdrop-blur-sm transition-all hover:shadow-sm">
            <TrendingDown className="text-aqua mx-auto mb-3 h-8 w-8" />
            <h3 className="text-ink font-semibold">Actionable</h3>
            <p className="text-sand-600 mt-2 text-sm">
              Clear, specific recommendations with dollar amounts attached.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-sand-200 border-t bg-white/50 py-8">
        <div className="text-sand-600 mx-auto flex max-w-7xl items-center justify-between px-5 text-sm">
          <p> Audit. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
