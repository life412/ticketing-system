import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { formatTicketId } from "@/lib/utils";
import { ArrowLeft, Ticket as TicketIcon } from "lucide-react";
import TicketActionPanel from "@/components/tickets/ticket-action-panel";
import TicketActivityTimeline from "@/components/tickets/ticket-activity-timeline";
import TicketCommentBox from "@/components/tickets/ticket-comment-box";

interface TicketDetailPageProps {
  params: {
    id: string;
  };
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Support querying either by UUID or numeric ticketNumber
  const isNumeric = /^\d+$/.test(params.id);

  const ticket = await prisma.ticket.findFirst({
    where: isNumeric ? { ticketNumber: parseInt(params.id, 10) } : { id: params.id },
    include: {
      creator: { select: { id: true, name: true, email: true, role: true } },
      assignee: { select: { id: true, name: true, email: true, role: true } },
      activities: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket) {
    redirect("/tickets");
  }

  // Enforce RBAC access
  const isAssociated =
    user.role === Role.MANAGER ||
    user.role === Role.TECH ||
    ticket.creatorId === user.id ||
    ticket.assigneeId === user.id;

  if (!isAssociated) {
    redirect("/tickets");
  }

  // Fetch technicians for manager assignment dropdown
  const technicians = await prisma.user.findMany({
    where: {
      OR: [{ role: Role.TECH }, { role: Role.MANAGER }],
    },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 space-y-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/tickets"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Ticket List
          </Link>

          <span className="text-xs font-mono text-slate-500">
            Workspace ID: {formatTicketId(ticket.ticketNumber || ticket.id)}
          </span>
        </div>

        {/* Action Panel Header */}
        <TicketActionPanel
          ticket={ticket}
          currentUser={user}
          technicians={technicians}
        />

        {/* Ticket Description Container */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-xl space-y-3 backdrop-blur-md">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <TicketIcon className="h-5 w-5 text-blue-400" />
            <h1 className="text-xl font-extrabold tracking-tight text-slate-100">
              {ticket.title}
            </h1>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-xl backdrop-blur-md">
          <TicketActivityTimeline activities={ticket.activities} />
        </div>

        {/* Comment Box */}
        <TicketCommentBox ticketId={ticket.id} />
      </div>
    </div>
  );
}
