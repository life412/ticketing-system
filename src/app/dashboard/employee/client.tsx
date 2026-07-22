"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TicketPriority, TicketCategory, TicketStatus } from "@prisma/client";
import { createTicketSchema, CreateTicketInput } from "@/lib/validations/ticket";
import { createTicket, updateTicketStatus, addComment } from "@/actions/ticket";
import { PlusCircle, Loader2, AlertCircle, MessageSquare, CheckCircle2, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface EmployeeTicketClientProps {
  initialTickets: any[];
}

export default function EmployeeTicketClient({ initialTickets }: EmployeeTicketClientProps) {
  const [tickets, setTickets] = useState(initialTickets);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.IT_SUPPORT,
    },
  });

  const handleCreateSubmit = async (data: CreateTicketInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await createTicket(data);
      if (!res.success) {
        setServerError(res.error || "Failed to create ticket.");
      } else {
        setShowCreateForm(false);
        reset();
        window.location.reload();
      }
    } catch (err) {
      setServerError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    try {
      const res = await updateTicketStatus({ ticketId, newStatus: TicketStatus.CLOSED });
      if (res.success) {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
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
      {/* Create Ticket Toggle Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Your Support Tickets</h2>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-500 text-white gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          {showCreateForm ? "Cancel" : "New Ticket"}
        </Button>
      </div>

      {/* Create Ticket Form Modal/Accordion */}
      {showCreateForm && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-lg font-semibold border-b border-slate-800 pb-2">Submit New Support Ticket</h3>

          {serverError && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(handleCreateSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title</Label>
              <Input
                id="title"
                placeholder="e.g. Cannot access company VPN"
                {...register("title")}
              />
              {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  {...register("category")}
                  className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                >
                  <option value={TicketCategory.IT_SUPPORT}>IT Support</option>
                  <option value={TicketCategory.FACILITIES}>Facilities</option>
                  <option value={TicketCategory.HR}>HR</option>
                  <option value={TicketCategory.OTHER}>Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  {...register("priority")}
                  className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                >
                  <option value={TicketPriority.LOW}>Low</option>
                  <option value={TicketPriority.MEDIUM}>Medium</option>
                  <option value={TicketPriority.HIGH}>High</option>
                  <option value={TicketPriority.CRITICAL}>Critical</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description</Label>
              <textarea
                id="description"
                rows={4}
                placeholder="Describe the issue, steps to reproduce, and any error messages..."
                {...register("description")}
                className="flex w-full rounded-md border border-slate-800 bg-slate-900 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
              />
              {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 text-white">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Ticket...
                </>
              ) : (
                "Submit Ticket"
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <Tag className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-medium text-slate-300">No Tickets Created Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Click "New Ticket" above to submit your first IT, Facilities, or HR support request.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs font-bold">
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
                      ticket.status === TicketStatus.RESOLVED
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : ticket.status === TicketStatus.CLOSED
                        ? "bg-slate-800 text-slate-400 border-slate-700"
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
                  Assigned Tech:{" "}
                  <span className="text-slate-200 font-medium">
                    {ticket.assignee?.name || ticket.assignee?.email || "Unassigned"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {ticket.status === TicketStatus.RESOLVED && (
                    <Button
                      size="sm"
                      onClick={() => handleCloseTicket(ticket.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Confirm & Close Ticket
                    </Button>
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

              {/* Activity / Comments Drawer */}
              {activeTicketId === ticket.id && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Activity & Comments</h5>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {ticket.activities?.map((act: any) => (
                      <div key={act.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="font-semibold text-blue-400">{act.user?.name || act.user?.email}</span>
                          <span>{new Date(act.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-200">{act.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddComment(ticket.id)}
                      className="bg-blue-600 hover:bg-blue-500 text-xs shrink-0"
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
