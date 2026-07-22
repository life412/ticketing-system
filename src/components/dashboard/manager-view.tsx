"use client";

import { useState } from "react";
import { TicketStatus, TicketPriority } from "@prisma/client";
import { formatTicketId } from "@/lib/utils";
import { assignTicket, updateTicketStatus } from "@/actions/ticket";
import {
  Ticket,
  AlertTriangle,
  Clock,
  Users,
  CheckCircle2,
  UserCheck,
  BarChart3,
  Shield,
  Layers,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ManagerViewProps {
  stats: {
    totalOpen: number;
    highPriority: number;
    unassigned: number;
  };
  teamWorkload: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    activeCount: number;
  }[];
  allTickets: any[];
}

export default function ManagerView({ stats, teamWorkload, allTickets }: ManagerViewProps) {
  const [tickets] = useState(allTickets);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const handleAssign = async (ticketId: string, techId: string) => {
    if (!techId) return;
    setAssigningId(ticketId);
    try {
      await assignTicket({ ticketId, techId });
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-400" /> Manager Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time system health, technician capacity metrics, and ticket queue management.
          </p>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Total Open */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Open</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Ticket className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black tracking-tight text-slate-100">{stats.totalOpen}</p>
          <p className="text-[11px] text-slate-500">Active tickets requiring attention</p>
        </div>

        {/* Card 2: High Priority */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">High Priority</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black tracking-tight text-rose-400">{stats.highPriority}</p>
          <p className="text-[11px] text-slate-500">HIGH & CRITICAL severity issues</p>
        </div>

        {/* Card 3: Unassigned */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Unassigned</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black tracking-tight text-amber-400">{stats.unassigned}</p>
          <p className="text-[11px] text-slate-500">Awaiting technician assignment</p>
        </div>
      </div>

      {/* Team Workload Section */}
      <div id="workload" className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" />
            <h2 className="font-bold text-base text-slate-100">Team Workload & Active Capacity</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">{teamWorkload.length} Technicians</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {teamWorkload.map((tech) => (
            <div
              key={tech.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs">
                    {tech.name ? tech.name[0].toUpperCase() : tech.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{tech.name || tech.email.split("@")[0]}</p>
                    <p className="text-[10px] text-slate-500">{tech.email}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {tech.activeCount} Active
                </span>
              </div>

              {/* Workload Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Capacity</span>
                  <span>{Math.min(100, tech.activeCount * 20)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      tech.activeCount >= 5
                        ? "bg-rose-500"
                        : tech.activeCount >= 3
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(10, tech.activeCount * 20))}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tickets Work Queue Table */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-400" />
            <h2 className="font-bold text-base text-slate-100">All Organization Tickets</h2>
          </div>
        </div>

        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[11px] font-bold">
                    {formatTicketId(ticket.ticketNumber || ticket.id)}
                  </span>
                  <h3 className="font-semibold text-sm text-slate-200">{ticket.title}</h3>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">{ticket.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                  <span>Creator: <strong className="text-slate-300">{ticket.creator?.name || ticket.creator?.email}</strong></span>
                  <span>•</span>
                  <span>Category: <strong className="text-slate-300">{ticket.category}</strong></span>
                </div>
              </div>

              {/* Assignment & Status Controls */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-purple-400 hidden sm:block" />
                  <select
                    value={ticket.assigneeId || ""}
                    onChange={(e) => handleAssign(ticket.id, e.target.value)}
                    disabled={assigningId === ticket.id}
                    className="h-8 rounded-lg border border-slate-800 bg-slate-900 px-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="" disabled>Assign Tech...</option>
                    {teamWorkload.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name || tech.email} ({tech.activeCount})
                      </option>
                    ))}
                  </select>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : ticket.status === TicketStatus.IN_PROGRESS
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  {ticket.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
