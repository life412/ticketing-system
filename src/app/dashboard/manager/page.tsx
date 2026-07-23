import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { prisma } from "@/lib/prisma";
import { formatTicketId } from "@/lib/utils";
import { Role, TicketStatus } from "@prisma/client";
import { Ticket, Shield, Users, CheckCircle2, Clock, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import ManagerTicketClient from "./client";

export default async function ManagerDashboardPage() {
  const user = await getCurrentUser();

  // Fetch all tickets with full creator, assignee, and activity relations
  const tickets = await prisma.ticket.findMany({
    include: {
      creator: { select: { id: true, name: true, email: true, role: true } },
      assignee: { select: { id: true, name: true, email: true, role: true } },
      activities: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch all technicians for assignment dropdown
  const technicians = await prisma.user.findMany({
    where: {
      OR: [{ role: Role.TECH }, { role: Role.MANAGER }],
    },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });

  const totalTickets = tickets.length;
  const unassignedTickets = tickets.filter((t) => !t.assigneeId).length;
  const resolvedTickets = tickets.filter((t) => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED).length;

  // Calculate Technician Workloads for the Availability Matrix
  const technicianWorkloads = technicians.map((tech) => {
    const activeTickets = tickets.filter(
      (t) => t.assigneeId === tech.id && (t.status === TicketStatus.ASSIGNED || t.status === TicketStatus.IN_PROGRESS)
    ).length;

    let status = "Available";
    if (activeTickets >= 3) {
      status = "Max Capacity";
    } else if (activeTickets > 0) {
      status = "Busy";
    }

    return {
      ...tech,
      activeTickets,
      status,
    };
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Shield className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Manager Control Panel</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-300">
              <UserIcon className="h-4 w-4 text-slate-400" />
              <span>{user?.name || user?.email}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400">
                MANAGER
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
        <div className="p-8 rounded-2xl bg-gradient-to-r from-purple-900/30 via-slate-900 to-indigo-900/30 border border-slate-800 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
            /dashboard/manager
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            System Operations & Workload Overview
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Monitor company-wide support tickets, assign technicians (`assignTicket`), override ticket statuses, and inspect full activity timelines.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Total System Tickets</p>
              <p className="text-2xl font-bold text-slate-100">{totalTickets}</p>
            </div>
            <Ticket className="h-8 w-8 text-purple-400" />
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Unassigned Queue</p>
              <p className="text-2xl font-bold text-amber-400">{unassignedTickets}</p>
            </div>
            <Clock className="h-8 w-8 text-amber-400" />
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Completed / Closed</p>
              <p className="text-2xl font-bold text-emerald-400">{resolvedTickets}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
        </div>

        {/* Manager Ticket Client */}
        <ManagerTicketClient
          technicians={technicians}
          technicianWorkloads={technicianWorkloads}
          initialTickets={tickets.map((t) => ({
            ...t,
            formattedId: formatTicketId(t.id),
          }))}
        />
      </main>
    </div>
  );
}
