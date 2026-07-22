import { Ticket, ShieldCheck, Users, Clock } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-950 text-slate-100">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
          <Ticket className="w-4 h-4" /> Ticketing System Initialized
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Enterprise Ticket Management
        </h1>
        
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Built with Next.js 14, App Router, Prisma, PostgreSQL, Tailwind CSS, and shadcn/ui.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
            <h3 className="font-semibold text-lg">Role-Based Access</h3>
            <p className="text-sm text-slate-400">MANAGER, TECH, and EMPLOYEE role support configured with Prisma.</p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <Ticket className="w-8 h-8 text-indigo-400" />
            <h3 className="font-semibold text-lg">Ticket Tracking</h3>
            <p className="text-sm text-slate-400">Formatted visual Ticket IDs (TKT-XXX), status workflows, priorities & categories.</p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <Clock className="w-8 h-8 text-emerald-400" />
            <h3 className="font-semibold text-lg">Activity Audit Log</h3>
            <p className="text-sm text-slate-400">Full comment and activity timeline for status changes & assignments.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
