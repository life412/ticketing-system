"use server";

import { prisma } from "@/lib/prisma";
import { TicketCategory, TicketPriority, TicketStatus, ActionType } from "@/types";

export async function createTicket(data: {
  title: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
  creatorId: string;
}) {
  const ticket = await prisma.ticket.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority ?? TicketPriority.MEDIUM,
      creatorId: data.creatorId,
      status: TicketStatus.OPEN,
    },
  });

  await prisma.activity.create({
    data: {
      ticketId: ticket.id,
      userId: data.creatorId,
      actionType: ActionType.STATUS_CHANGE,
      newStatus: TicketStatus.OPEN,
      text: "Ticket created",
    },
  });

  return ticket;
}

export async function updateTicketStatus(data: {
  ticketId: string;
  userId: string;
  newStatus: TicketStatus;
}) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: data.ticketId },
  });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  const previousStatus = ticket.status;

  const updatedTicket = await prisma.ticket.update({
    where: { id: data.ticketId },
    data: { status: data.newStatus },
  });

  await prisma.activity.create({
    data: {
      ticketId: data.ticketId,
      userId: data.userId,
      actionType: ActionType.STATUS_CHANGE,
      previousStatus,
      newStatus: data.newStatus,
      text: `Status changed from ${previousStatus} to ${data.newStatus}`,
    },
  });

  return updatedTicket;
}
