import { Button } from "~/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0F1117] text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-800 bg-[#1A1D24] px-12 py-6">
        <div className="flex items-center gap-4">
          <h1 className="text-brand text-xl font-bold tracking-tight">
            Audits<span className="text-white">Pro</span>
          </h1>
          <nav className="hidden gap-4 md:flex">
            <a href="#" className="text-sm font-medium text-white">
              Overview
            </a>
            <a
              href="#"
              className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
              Integrations
            </a>
            <a
              href="#"
              className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
              Settings
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="pill" size="sm">
            Learn More
          </Button>
          <Button variant="pill" size="sm">
            New Audit
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex w-full flex-1 flex-col gap-4 p-4 md:flex-row">
        {/* Sidebar */}
        <aside className="flex w-full shrink-0 flex-col gap-2 md:w-64">
          <div className="rounded-lg border border-gray-800 bg-[#1A1D24] p-4">
            <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Menu
            </h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="#"
                  className="block rounded-md bg-gray-800 px-3 py-2 text-sm font-medium text-white"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block rounded-md px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                >
                  My Audits
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block rounded-md px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                >
                  Team
                </a>
              </li>
            </ul>
          </div>

          <div className="mt-auto rounded-lg border border-gray-800 bg-[#1A1D24] p-4">
            <div className="flex items-center gap-4">
              <div className="from-brand h-10 w-10 rounded-full bg-gradient-to-tr to-purple-500"></div>
              <div>
                <p className="text-sm font-medium">Jane Doe</p>
                <p className="text-xs text-gray-400">Pro Plan</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Dashboard Content */}
        <main className="flex flex-1 flex-col gap-4">
          <div className="rounded-lg border border-gray-800 bg-[#1A1D24] p-4">
            <h2 className="mb-2 text-2xl font-bold">Welcome back, Jane!</h2>
            <p className="mb-6 text-gray-400">
              Here&apos;s what&apos;s happening with your projects today.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-md border border-gray-800 bg-[#0F1117] p-4">
                <p className="mb-1 text-sm text-gray-400">Total Savings</p>
                <p className="text-brand text-3xl font-bold">$4,250</p>
              </div>
              <div className="rounded-md border border-gray-800 bg-[#0F1117] p-4">
                <p className="mb-1 text-sm text-gray-400">Active Audits</p>
                <p className="text-3xl font-bold text-white">12</p>
              </div>
              <div className="rounded-md border border-gray-800 bg-[#0F1117] p-4">
                <p className="mb-1 text-sm text-gray-400">Recommendations</p>
                <p className="text-3xl font-bold text-white">5</p>
              </div>
            </div>
          </div>

          <div className="flex-1 rounded-lg border border-gray-800 bg-[#1A1D24] p-4">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Audits</h3>
              <Button variant="pill" size="sm">
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md border border-gray-800 bg-[#0F1117] p-4"
                >
                  <div>
                    <h4 className="mb-1 font-medium text-white">
                      Project Delta {i}
                    </h4>
                    <p className="text-xs text-gray-400">Executed 2 days ago</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-brand text-sm font-bold">
                      -$300/mo
                    </span>
                    <Button variant="pill" size="sm" className="h-8 text-xs">
                      Apply Fix
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
