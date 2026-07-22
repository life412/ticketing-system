"use client";

import { TicketStatus, TicketPriority } from "@prisma/client";
import { formatTicketId } from "@/lib/utils";
import { Tag, Calendar, User, Clock, AlertTriangle } from "lucide-react";

interface TicketDataTableProps {
  tickets: any[];
}

export default function TicketDataTable({ tickets }: TicketDataTableProps) {
  if (tickets.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
        <Tag className="h-10 w-10 text-slate-600 mx-auto" />
        <h3 className="text-lg font-medium text-slate-300">No Tickets Match Search Criteria</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Try adjusting your search terms or clearing active status, priority, or category filters.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-xl backdrop-blur-md">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
            <th className="py-3.5 px-4">Ticket ID</th>
            <th className="py-3.5 px-4">Title & Details</th>
            <th className="py-3.5 px-4">Category</th>
            <th className="py-3.5 px-4">Priority</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4">Requester</th>
            <th className="py-3.5 px-4">Assignee</th>
            <th className="py-3.5 px-4">Created Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-slate-300">
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="hover:bg-slate-800/30 transition-colors group"
            >
              {/* Formatted Ticket ID */}
              <td className="py-4 px-4 whitespace-nowrap font-mono">
                <span className="px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold">
                  {formatTicketId(ticket.ticketNumber || ticket.id)}
                </span>
              </td>

              {/* Title & Details */}
              <td className="py-4 px-4 max-w-xs md:max-w-md">
                <div className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                  {ticket.title}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {ticket.description}
                </p>
              </td>

              {/* Category */}
              <td className="py-4 px-4 whitespace-nowrap">
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
                  {ticket.category}
                </span>
              </td>

              {/* Priority */}
              <td className="py-4 px-4 whitespace-nowrap">
                <span
                  className={`px-2.5 py-1 rounded-full font-bold border ${
                    ticket.priority === TicketPriority.CRITICAL
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      : ticket.priority === TicketPriority.HIGH
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : ticket.priority === TicketPriority.MEDIUM
                      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {ticket.priority}
                </span>
              </td>

              {/* Status */}
              <td className="py-4 px-4 whitespace-nowrap">
                <span
                  className={`px-2.5 py-1 rounded-full font-bold border ${
                    ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : ticket.status === TicketStatus.IN_PROGRESS
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  {ticket.status}
                </span>
              </td>

              {/* Requester */}
              <td className="py-4 px-4 whitespace-nowrap">
                <div className="text-slate-200 font-medium">{ticket.creator?.name || ticket.creator?.email}</div>
                <div className="text-[10px] text-slate-500 font-mono">{ticket.creator?.role}</div>
              </td>

              {/* Assignee */}
              <td className="py-4 px-4 whitespace-nowrap">
                {ticket.assignee ? (
                  <span className="text-purple-400 font-medium">
                    {ticket.assignee.name || ticket.assignee.email}
                  </span>
                ) : (
                  <span className="text-slate-500 italic">Unassigned</span>
                )}
              </td>

              {/* Created Date */}
              <td className="py-4 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
