import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, TicketStatus, TicketPriority } from "@prisma/client";
import ManagerView from "@/components/dashboard/manager-view";
import TechView from "@/components/dashboard/tech-view";
import EmployeeView from "@/components/dashboard/employee-view";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // MANAGER DASHBOARD VIEW
  if (user.role === Role.MANAGER) {
    const totalOpen = await prisma.ticket.count({
      where: {
        status: {
          notIn: [TicketStatus.CLOSED, TicketStatus.RESOLVED],
        },
      },
    });

    const highPriority = await prisma.ticket.count({
      where: {
        priority: { in: [TicketPriority.HIGH, TicketPriority.CRITICAL] },
        status: { not: TicketStatus.CLOSED },
      },
    });

    const unassigned = await prisma.ticket.count({
      where: {
        assigneeId: null,
        status: { not: TicketStatus.CLOSED },
      },
    });

    const technicians = await prisma.user.findMany({
      where: {
        OR: [{ role: Role.TECH }, { role: Role.MANAGER }],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        assignedTickets: {
          where: {
            status: { notIn: [TicketStatus.CLOSED, TicketStatus.RESOLVED] },
          },
          select: { id: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const teamWorkload = technicians.map((tech) => ({
      id: tech.id,
      name: tech.name,
      email: tech.email,
      role: tech.role,
      activeCount: tech.assignedTickets.length,
    }));

    const allTickets = await prisma.ticket.findMany({
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return (
      <ManagerView
        stats={{ totalOpen, highPriority, unassigned }}
        teamWorkload={teamWorkload}
        allTickets={allTickets}
      />
    );
  }

  // TECHNICIAN DASHBOARD VIEW
  if (user.role === Role.TECH) {
    const myOpen = await prisma.ticket.count({
      where: {
        assigneeId: user.id,
        status: { in: [TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS] },
      },
    });

    const myResolved = await prisma.ticket.count({
      where: {
        assigneeId: user.id,
        status: TicketStatus.RESOLVED,
      },
    });

    const assignedTickets = await prisma.ticket.findMany({
      where: {
        OR: [{ assigneeId: user.id }, { status: TicketStatus.OPEN }],
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return (
      <TechView
        stats={{ myOpen, myResolved }}
        assignedTickets={assignedTickets}
        currentUserId={user.id}
      />
    );
  }

  // EMPLOYEE DASHBOARD VIEW
  const activeTickets = await prisma.ticket.count({
    where: {
      creatorId: user.id,
      status: { in: [TicketStatus.OPEN, TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS] },
    },
  });

  const awaitingConfirmation = await prisma.ticket.count({
    where: {
      creatorId: user.id,
      status: TicketStatus.RESOLVED,
    },
  });

  const myTickets = await prisma.ticket.findMany({
    where: { creatorId: user.id },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <EmployeeView
      stats={{ activeTickets, awaitingConfirmation }}
      myTickets={myTickets}
    />
  );
}
