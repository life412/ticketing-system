import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import Sidebar from "@/components/dashboard/sidebar";
import { LogOut, User as UserIcon, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Global Navigation Sidebar */}
      <Sidebar role={user.role} />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          {/* Left search bar placeholder */}
          <div className="flex items-center gap-3 max-w-md w-full">
            <div className="relative w-full hidden sm:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search tickets, tags, or technicians (Press '/' to focus)..."
                className="w-full h-9 pl-9 pr-4 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          {/* Right User Actions */}
          <div className="flex items-center gap-4">
            {/* User Details */}
            <div className="flex items-center gap-3 border-r border-slate-800 pr-4">
              <div className="h-8 w-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-tight">{user.name || user.email.split("@")[0]}</p>
                <p className="text-[10px] text-slate-400 font-mono">{user.email}</p>
              </div>
            </div>

            {/* Logout Button */}
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white text-xs gap-2"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </form>
          </div>
        </header>

        {/* Scrollable Dashboard View Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
