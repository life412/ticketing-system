"use client";

import { useState } from "react";
import type { TicketStatus } from "@prisma/client";
import { assignTicket, updateTicketStatus, addComment } from "@/actions/ticket";
import { UserCheck, Shield, MessageSquare, AlertCircle, Ticket as TicketIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ManagerTicketClientProps {
  technicians: any[];
  initialTickets: any[];
}

export default function ManagerTicketClient({ technicians, initialTickets }: ManagerTicketClientProps) {
  const [tickets] = useState(initialTickets);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [assigningTicketId, setAssigningTicketId] = useState<string | null>(null);

  const handleAssign = async (ticketId: string, techId: string) => {
    if (!techId) return;
    setErrorMessage(null);
    setAssigningTicketId(ticketId);

    try {
      const res = await assignTicket({ ticketId, techId });
      if (!res.success) {
        setErrorMessage(res.error || "Failed to assign technician.");
      } else {
        window.location.reload();
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred.");
    } finally {
      setAssigningTicketId(null);
    }
  };

  const handleStatusOverride = async (ticketId: string, newStatus: TicketStatus) => {
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

  const handleAddComment = async (ticketId: string) => {
    if (!commentText.trim()) return;
    try {
      const res = await addComment({ ticketId, text: commentText });
      if (res.success) {
        setCommentText("");
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold tracking-tight">All System Tickets</h2>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <TicketIcon className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-medium text-slate-300">No Tickets Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            There are currently no tickets in the system.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono text-xs font-bold">
                    {ticket.formattedId}
                  </span>
                  <h4 className="font-semibold text-base text-slate-100">{ticket.title}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                    {ticket.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {ticket.priority}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      ticket.status === "RESOLVED" || ticket.status === "CLOSED"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : ticket.status === "IN_PROGRESS"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                <div className="space-y-1">
                  <div>
                    Creator:{" "}
                    <span className="text-slate-200 font-medium">
                      {ticket.creator?.name || ticket.creator?.email} ({ticket.creator?.role})
                    </span>
                  </div>
                  <div>
                    Current Assignee:{" "}
                    <span className="text-purple-400 font-medium">
                      {ticket.assignee?.name || ticket.assignee?.email || "Unassigned"}
                    </span>
                  </div>
                </div>

                {/* Manager Controls: Assign Technician & Status Override */}
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-purple-400" />
                    <select
                      value={ticket.assigneeId || ""}
                      onChange={(e) => handleAssign(ticket.id, e.target.value)}
                      disabled={assigningTicketId === ticket.id}
                      className="h-8 rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500"
                    >
                      <option value="" disabled>
                        Assign Technician...
                      </option>
                      {technicians.map((tech) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.name || tech.email} ({tech.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusOverride(ticket.id, e.target.value as TicketStatus)}
                    className="h-8 rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveTicketId(activeTicketId === ticket.id ? null : ticket.id)}
                    className="text-slate-400 hover:text-slate-200 text-xs h-8 gap-1"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Activity ({ticket.activities?.length || 0})
                  </Button>
                </div>
              </div>

              {/* Activity Timeline & Comment Drawer */}
              {activeTicketId === ticket.id && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Audit Log & Activity</h5>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {ticket.activities?.map((act: any) => (
                      <div key={act.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="font-semibold text-purple-400">{act.user?.name || act.user?.email} ({act.user?.role})</span>
                          <span>{new Date(act.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-200">{act.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add manager comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddComment(ticket.id)}
                      className="bg-purple-600 hover:bg-purple-500 text-xs shrink-0"
                    >
                      Post Comment
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
