"use client";

import { useState } from "react";
import { TicketStatus } from "@prisma/client";
import { formatTicketId } from "@/lib/utils";
import { updateTicketStatus } from "@/actions/ticket";
import { Wrench, Clock, CheckCircle2, Play, AlertCircle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TechViewProps {
  stats: {
    myOpen: number;
    myResolved: number;
  };
  assignedTickets: any[];
  currentUserId: string;
}

export default function TechView({ stats, assignedTickets, currentUserId }: TechViewProps) {
  const [tickets] = useState(assignedTickets);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    setErrorMessage(null);
    try {
      const res = await updateTicketStatus({ ticketId, newStatus });
      if (!res.success) {
        setErrorMessage(res.error || "Failed to update status.");
      } else {
        window.location.reload();
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred.");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
          <Wrench className="h-6 w-6 text-amber-400" /> Technician Workspace
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your assigned resolution queue and advance tickets through resolution milestones.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Card 1: My Open Tickets */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">My Active Queue</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black tracking-tight text-amber-400">{stats.myOpen}</p>
          <p className="text-[11px] text-slate-500">ASSIGNED & IN_PROGRESS tickets</p>
        </div>

        {/* Card 2: My Resolved Tickets */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">My Resolved Items</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black tracking-tight text-emerald-400">{stats.myResolved}</p>
          <p className="text-[11px] text-slate-500">Successfully resolved support requests</p>
        </div>
      </div>

      {/* Assigned Workspace List */}
      <div id="queue" className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-amber-400" />
            <h2 className="font-bold text-base text-slate-100">Assigned Tickets</h2>
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {tickets.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
            <Wrench className="h-8 w-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-medium text-slate-300">Your Queue is Empty</h3>
            <p className="text-xs text-slate-500">No support tickets are currently assigned to you.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[11px] font-bold">
                      {formatTicketId(ticket.ticketNumber || ticket.id)}
                    </span>
                    <h3 className="font-semibold text-sm text-slate-200">{ticket.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{ticket.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span>Requester: <strong className="text-slate-300">{ticket.creator?.name || ticket.creator?.email}</strong></span>
                    <span>•</span>
                    <span>Category: <strong className="text-slate-300">{ticket.category}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {ticket.status === TicketStatus.ASSIGNED && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(ticket.id, TicketStatus.IN_PROGRESS)}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-8 gap-1"
                    >
                      <Play className="h-3.5 w-3.5" /> Start Work
                    </Button>
                  )}

                  {ticket.status === TicketStatus.IN_PROGRESS && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(ticket.id, TicketStatus.RESOLVED)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mark Resolved
                    </Button>
                  )}

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      ticket.status === TicketStatus.RESOLVED
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
        )}
      </div>
    </div>
  );
}
