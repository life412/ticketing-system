import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, TicketStatus, TicketPriority, TicketCategory } from "@prisma/client";
import { PlusCircle, Ticket as TicketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import TicketFilterToolbar from "@/components/tickets/ticket-filter-toolbar";
import TicketDataTable from "@/components/tickets/ticket-data-table";

interface TicketsPageProps {
  searchParams: {
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: string;
    query?: string;
    sort?: string;
  };
}

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Construct RBAC Scope Clause
  let rbacWhere: any = {};
  if (user.role === Role.EMPLOYEE) {
    rbacWhere = { creatorId: user.id };
  } else if (user.role === Role.TECH) {
    rbacWhere = {
      OR: [{ assigneeId: user.id }, { assigneeId: null }],
    };
  }
  // MANAGER has no base RBAC restriction (sees all)

  // 2. Construct searchParams Filters
  const filterWhere: any = {};

  if (searchParams.status && Object.values(TicketStatus).includes(searchParams.status as TicketStatus)) {
    filterWhere.status = searchParams.status as TicketStatus;
  }

  if (searchParams.priority && Object.values(TicketPriority).includes(searchParams.priority as TicketPriority)) {
    filterWhere.priority = searchParams.priority as TicketPriority;
  }

  if (searchParams.category && Object.values(TicketCategory).includes(searchParams.category as TicketCategory)) {
    filterWhere.category = searchParams.category as TicketCategory;
  }

  if (searchParams.assignedTo) {
    if (searchParams.assignedTo === "unassigned") {
      filterWhere.assigneeId = null;
    } else {
      filterWhere.assigneeId = searchParams.assignedTo;
    }
  }

  if (searchParams.query) {
    filterWhere.title = {
      contains: searchParams.query,
    };
  }

  // Construct orderBy sorting
  let orderBy: any = { createdAt: "desc" };
  if (searchParams.sort === "oldest") {
    orderBy = { createdAt: "asc" };
  } else if (searchParams.sort === "priority") {
    orderBy = { priority: "desc" };
  } else if (searchParams.sort === "status") {
    orderBy = { status: "asc" };
  }

  // Combine RBAC where & searchParams filters
  const finalWhere = {
    AND: [rbacWhere, filterWhere],
  };

  // Fetch filtered & sorted tickets
  const tickets = await prisma.ticket.findMany({
    where: finalWhere,
    include: {
      creator: { select: { id: true, name: true, email: true, role: true } },
      assignee: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy,
  });

  // Fetch technicians list for filter dropdown
  const technicians = await prisma.user.findMany({
    where: {
      OR: [{ role: Role.TECH }, { role: Role.MANAGER }],
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
              <TicketIcon className="h-6 w-6 text-blue-400" /> Ticket Management Directory
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Browse, filter, and search system support tickets with role-based visibility.
            </p>
          </div>

          <Link href="/tickets/new">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2 font-medium">
              <PlusCircle className="h-4 w-4" /> Create Ticket
            </Button>
          </Link>
        </div>

        {/* Search & Filter Toolbar */}
        <TicketFilterToolbar technicians={technicians} />

        {/* Tickets Data Table */}
        <TicketDataTable tickets={tickets} />
      </div>
    </div>
  );
}
