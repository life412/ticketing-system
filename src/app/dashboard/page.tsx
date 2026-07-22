import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { Ticket, Shield, User as UserIcon, Mail, LogOut, Activity, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "MANAGER":
        return "bg-purple-500/10 border-purple-500/20 text-purple-400";
      case "TECH":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      default:
        return "bg-blue-500/10 border-blue-500/20 text-blue-400";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Ticket className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Ticketing System</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-300">
              <span className="text-slate-400">{user?.email}</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                  user?.role
                )}`}
              >
                {user?.role}
              </span>
            </div>

            <form action={logoutAction}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Dashboard Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-900/30 border border-slate-800 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
            Protected Dashboard Route
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || user?.email?.split("@")[0] || "User"}!
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            You are securely authenticated using custom JWTs in HTTP-Only cookies. Middleware has injected your context directly into request headers.
          </p>
        </div>

        {/* User Session Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">User ID</p>
                <p className="font-mono text-sm text-slate-200 truncate">{user?.id || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Email</p>
                <p className="text-sm font-medium text-slate-200">{user?.email || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Role</p>
                <p className="text-sm font-semibold text-slate-200">{user?.role || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions / Activity Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Activity className="h-5 w-5 text-blue-400" />
              <h2 className="font-semibold text-lg">System Status</h2>
            </div>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center justify-between">
                <span>Authentication Mode</span>
                <span className="text-slate-200 font-medium">Custom `jose` JWT</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Cookie Protection</span>
                <span className="text-emerald-400 font-medium">HTTP-Only (Lax)</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Route Protection</span>
                <span className="text-slate-200 font-medium">Next.js Middleware</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock className="h-5 w-5 text-indigo-400" />
              <h2 className="font-semibold text-lg">Session Info</h2>
            </div>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center justify-between">
                <span>Token Expiration</span>
                <span className="text-slate-200 font-medium">7 Days</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Edge Compatible</span>
                <span className="text-emerald-400 font-medium">Yes</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
