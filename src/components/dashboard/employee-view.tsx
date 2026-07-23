"use client";

import { useState } from "react";
import type { TicketStatus } from "@prisma/client";
import { formatTicketId } from "@/lib/utils";
import { updateTicketStatus } from "@/actions/ticket";
import { Ticket, CheckCircle2, Clock, PlusCircle, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmployeeViewProps {
  stats: {
    activeTickets: number;
    awaitingConfirmation: number;
  };
  myTickets: any[];
}

export default function EmployeeView({ stats, myTickets }: EmployeeViewProps) {
  const [tickets] = useState(myTickets);

  const handleConfirmClose = async (ticketId: string) => {
    try {
      const res = await updateTicketStatus({ ticketId, newStatus: "CLOSED" as TicketStatus });
      if (res.success) {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
            <Ticket className="h-6 w-6 text-blue-400" /> Employee Helpdesk Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Submit IT/Facilities/HR issues and confirm ticket resolutions.
          </p>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Card 1: Active Tickets */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">My Active Requests</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black tracking-tight text-blue-400">{stats.activeTickets}</p>
          <p className="text-[11px] text-slate-500">Tickets in OPEN, ASSIGNED, or IN_PROGRESS status</p>
        </div>

        {/* Card 2: Awaiting Confirmation */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Awaiting My Confirmation</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black tracking-tight text-emerald-400">{stats.awaitingConfirmation}</p>
          <p className="text-[11px] text-slate-500">RESOLVED tickets requiring your sign-off</p>
        </div>
      </div>

      {/* Submitted Requests List */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            <h2 className="font-bold text-base text-slate-100">Submitted Tickets</h2>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
            <Ticket className="h-8 w-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-medium text-slate-300">No Support Tickets Created</h3>
            <p className="text-xs text-slate-500">Submit a support request whenever you encounter technical issues.</p>
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
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[11px] font-bold">
                      {formatTicketId(ticket.ticketNumber || ticket.id)}
                    </span>
                    <h3 className="font-semibold text-sm text-slate-200">{ticket.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{ticket.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span>Assigned Tech: <strong className="text-slate-300">{ticket.assignee?.name || ticket.assignee?.email || "Unassigned"}</strong></span>
                    <span>•</span>
                    <span>Category: <strong className="text-slate-300">{ticket.category}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {ticket.status === "RESOLVED" && (
                    <Button
                      size="sm"
                      onClick={() => handleConfirmClose(ticket.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Confirm & Close
                    </Button>
                  )}

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      ticket.status === "RESOLVED"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : ticket.status === "CLOSED"
                        ? "bg-slate-800 text-slate-400 border-slate-700"
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
