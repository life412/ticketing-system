"use client";

import { useState } from "react";
import type { TicketStatus } from "@prisma/client";
import { updateTicketStatus, addComment } from "@/actions/ticket";
import { Play, CheckCircle2, MessageSquare, AlertCircle, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TechTicketClientProps {
  currentUserId: string;
  initialTickets: any[];
}

export default function TechTicketClient({ currentUserId, initialTickets }: TechTicketClientProps) {
  const [tickets] = useState(initialTickets);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
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
        <h2 className="text-xl font-bold tracking-tight">Assigned Work Queue</h2>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <Wrench className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-medium text-slate-300">No Assigned Tickets</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            You currently have no support tickets assigned to your queue.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const isAssignedToMe = ticket.assigneeId === currentUserId;

            return (
              <div
                key={ticket.id}
                className={`p-6 rounded-xl border transition-colors space-y-4 ${
                  isAssignedToMe
                    ? "bg-slate-900/80 border-slate-800"
                    : "bg-slate-900/30 border-slate-800/60 opacity-80"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-bold">
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
                        ticket.status === "RESOLVED"
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

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                  <div>
                    Creator: <span className="text-slate-200 font-medium">{ticket.creator?.name || ticket.creator?.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Action Buttons for Technician */}
                    {isAssignedToMe && (
                      <>
                        {ticket.status === "ASSIGNED" && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(ticket.id, "IN_PROGRESS" as TicketStatus)}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-8 gap-1"
                          >
                            <Play className="h-3.5 w-3.5" /> Start Work (In Progress)
                          </Button>
                        )}

                        {ticket.status === "IN_PROGRESS" && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(ticket.id, "RESOLVED" as TicketStatus)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Mark Resolved
                          </Button>
                        )}
                      </>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setActiveTicketId(activeTicketId === ticket.id ? null : ticket.id)}
                      className="text-slate-400 hover:text-slate-200 text-xs h-8 gap-1"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Comments ({ticket.activities?.length || 0})
                    </Button>
                  </div>
                </div>

                {/* Activity & Comment Section */}
                {activeTicketId === ticket.id && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Activity Timeline</h5>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {ticket.activities?.map((act: any) => (
                        <div key={act.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="font-semibold text-amber-400">{act.user?.name || act.user?.email}</span>
                            <span>{new Date(act.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-200">{act.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Post resolution note or comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="text-xs"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(ticket.id)}
                        className="bg-amber-600 hover:bg-amber-500 text-xs shrink-0"
                      >
                        Post Note
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
