import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { prisma } from "@/lib/prisma";
import { formatTicketId } from "@/lib/utils";
import { TicketStatus } from "@prisma/client";
import { Ticket, Wrench, Clock, CheckCircle2, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import TechTicketClient from "./client";

export default async function TechDashboardPage() {
  const user = await getCurrentUser();

  // Fetch tickets assigned to this technician or unassigned open tickets
  const tickets = await prisma.ticket.findMany({
    where: {
      OR: [{ assigneeId: user?.id }, { status: TicketStatus.OPEN }],
    },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      activities: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const assignedCount = tickets.filter((t) => t.assigneeId === user?.id).length;
  const inProgressCount = tickets.filter((t) => t.assigneeId === user?.id && t.status === TicketStatus.IN_PROGRESS).length;
  const resolvedCount = tickets.filter((t) => t.assigneeId === user?.id && t.status === TicketStatus.RESOLVED).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Technician Portal</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-300">
              <User className="h-4 w-4 text-slate-400" />
              <span>{user?.name || user?.email}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
                TECH
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-amber-900/30 via-slate-900 to-orange-900/30 border border-slate-800 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
            /dashboard/tech
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Technician Resolution Console
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Inspect assigned support tickets, transition ticket workflow states (ASSIGNED → IN_PROGRESS → RESOLVED), and log technical resolution notes.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Assigned To You</p>
              <p className="text-2xl font-bold text-slate-100">{assignedCount}</p>
            </div>
            <Ticket className="h-8 w-8 text-amber-400" />
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Currently In Progress</p>
              <p className="text-2xl font-bold text-blue-400">{inProgressCount}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Resolved Tickets</p>
              <p className="text-2xl font-bold text-emerald-400">{resolvedCount}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
        </div>

        {/* Client Component */}
        <TechTicketClient
          currentUserId={user?.id || ""}
          initialTickets={tickets.map((t) => ({
            ...t,
            formattedId: formatTicketId(t.id),
          }))}
        />
      </main>
    </div>
  );
}
