"use client";

import { useState } from "react";
import { Role, TicketStatus, TicketPriority } from "@prisma/client";
import { formatTicketId } from "@/lib/utils";
import { assignTicket, updateTicketStatus } from "@/actions/ticket";
import {
  UserCheck,
  Play,
  CheckCircle2,
  AlertCircle,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TicketActionPanelProps {
  ticket: any;
  currentUser: { id: string; email: string; role: Role | string };
  technicians: { id: string; name: string | null; email: string; role: string }[];
}

export default function TicketActionPanel({
  ticket,
  currentUser,
  technicians,
}: TicketActionPanelProps) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isManager = currentUser.role === Role.MANAGER || currentUser.role === "MANAGER";
  const isTech = currentUser.role === Role.TECH || currentUser.role === "TECH";
  const isEmployee = currentUser.role === Role.EMPLOYEE || currentUser.role === "EMPLOYEE";

  const isAssignee = ticket.assigneeId === currentUser.id;
  const isCreator = ticket.creatorId === currentUser.id;

  const handleAssign = async (techId: string) => {
    if (!techId) return;
    setIsAssigning(true);
    setErrorMsg(null);
    try {
      const res = await assignTicket({ ticketId: ticket.id, techId });
      if (!res.success) {
        setErrorMsg(res.error || "Failed to assign technician.");
      } else {
        window.location.reload();
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    setIsUpdatingStatus(true);
    setErrorMsg(null);
    try {
      const res = await updateTicketStatus({ ticketId: ticket.id, newStatus });
      if (!res.success) {
        setErrorMsg(res.error || "Failed to update ticket status.");
      } else {
        window.location.reload();
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-xl space-y-6 backdrop-blur-md">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-sm font-bold">
            {formatTicketId(ticket.ticketNumber || ticket.id)}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
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

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
            {ticket.category}
          </span>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
              ticket.priority === TicketPriority.CRITICAL
                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                : ticket.priority === TicketPriority.HIGH
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
            }`}
          >
            {ticket.priority} Priority
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Role-Based Workflow Controls */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-400" /> Action Controls
        </h4>

        <div className="flex flex-wrap items-center gap-3">
          {/* MANAGER: Assign Technician Dropdown */}
          {isManager && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <UserCheck className="h-4 w-4 text-purple-400 shrink-0" />
              <select
                value={ticket.assigneeId || ""}
                onChange={(e) => handleAssign(e.target.value)}
                disabled={isAssigning}
                className="h-9 rounded-lg border border-slate-800 bg-slate-900 px-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500 w-full sm:w-64"
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
          )}

          {/* TECHNICIAN (Assigned): Status Workflow Controls */}
          {isTech && isAssignee && (
            <>
              {ticket.status === TicketStatus.ASSIGNED && (
                <Button
                  size="sm"
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange(TicketStatus.IN_PROGRESS)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs gap-1.5"
                >
                  <Play className="h-3.5 w-3.5" /> Start Work (In Progress)
                </Button>
              )}

              {ticket.status === TicketStatus.IN_PROGRESS && (
                <Button
                  size="sm"
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange(TicketStatus.RESOLVED)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Mark Resolved
                </Button>
              )}
            </>
          )}

          {/* EMPLOYEE (Creator & Status RESOLVED): Confirm Resolution Button */}
          {isEmployee && isCreator && ticket.status === TicketStatus.RESOLVED && (
            <Button
              size="sm"
              disabled={isUpdatingStatus}
              onClick={() => handleStatusChange(TicketStatus.CLOSED)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Confirm Resolution & Close Ticket
            </Button>
          )}
        </div>
      </div>

      {/* Ticket Metadata Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-400 pt-2">
        <div>
          <span className="text-slate-500 block uppercase font-semibold text-[10px]">Requester</span>
          <span className="text-slate-200 font-medium">{ticket.creator?.name || ticket.creator?.email}</span>
        </div>

        <div>
          <span className="text-slate-500 block uppercase font-semibold text-[10px]">Assignee</span>
          <span className="text-purple-400 font-medium">
            {ticket.assignee?.name || ticket.assignee?.email || "Unassigned"}
          </span>
        </div>

        <div>
          <span className="text-slate-500 block uppercase font-semibold text-[10px]">Created Date</span>
          <span className="text-slate-300 font-mono">
            {new Date(ticket.createdAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div>
          <span className="text-slate-500 block uppercase font-semibold text-[10px]">Last Updated</span>
          <span className="text-slate-300 font-mono">
            {new Date(ticket.updatedAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
