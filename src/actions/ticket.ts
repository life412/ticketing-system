"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Role, TicketStatus, ActionType } from "@prisma/client";
import {
  createTicketSchema,
  assignTicketSchema,
  updateTicketStatusSchema,
  addCommentSchema,
  CreateTicketInput,
  AssignTicketInput,
  UpdateTicketStatusInput,
  AddCommentInput,
} from "@/lib/validations/ticket";
import { z } from "zod";

export interface TicketActionResult<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Server Action: Create a new ticket
 * Authorization: Allowed for EMPLOYEE (and MANAGER)
 */
export async function createTicket(input: CreateTicketInput): Promise<TicketActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Authentication required. Please sign in." };
    }

    const validation = createTicketSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Invalid ticket data.",
      };
    }

    const { title, description, priority, category } = validation.data;

    // Create ticket & initial activity log in a transaction
    const ticket = await prisma.$transaction(async (tx) => {
      const createdTicket = await tx.ticket.create({
        data: {
          title,
          description,
          priority,
          category,
          status: TicketStatus.OPEN,
          creatorId: currentUser.id,
        },
      });

      await tx.activity.create({
        data: {
          ticketId: createdTicket.id,
          userId: currentUser.id,
          actionType: ActionType.STATUS_CHANGE,
          newStatus: TicketStatus.OPEN,
          text: "Ticket created",
        },
      });

      return createdTicket;
    });

    revalidatePath("/dashboard");
    revalidatePath("/tickets");

    return { success: true, data: ticket };
  } catch (error) {
    console.error("createTicket error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create ticket. Please try again.",
    };
  }
}

/**
 * Server Action: Assign a ticket to a technician
 * Authorization: Allowed for MANAGER only
 */
export async function assignTicket(input: AssignTicketInput): Promise<TicketActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Authentication required. Please sign in." };
    }

    if (currentUser.role !== Role.MANAGER) {
      return { success: false, error: "Unauthorized. Only Managers can assign tickets." };
    }

    const validation = assignTicketSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Invalid assignment data.",
      };
    }

    const { ticketId, techId } = validation.data;

    const techUser = await prisma.user.findUnique({
      where: { id: techId },
    });

    if (!techUser) {
      return { success: false, error: "Selected technician does not exist." };
    }

    if (techUser.role !== Role.TECH && techUser.role !== Role.MANAGER) {
      return { success: false, error: "User must have a TECH or MANAGER role to be assigned." };
    }

    const existingTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!existingTicket) {
      return { success: false, error: "Ticket not found." };
    }

    const previousStatus = existingTicket.status;

    const updatedTicket = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.update({
        where: { id: ticketId },
        data: {
          assigneeId: techId,
          status: TicketStatus.ASSIGNED,
        },
      });

      await tx.activity.create({
        data: {
          ticketId,
          userId: currentUser.id,
          actionType: ActionType.ASSIGNMENT,
          previousStatus,
          newStatus: TicketStatus.ASSIGNED,
          text: `Assigned ticket to ${techUser.name || techUser.email}`,
        },
      });

      return ticket;
    });

    revalidatePath("/dashboard");
    revalidatePath("/tickets");
    revalidatePath(`/tickets/${ticketId}`);

    return { success: true, data: updatedTicket };
  } catch (error) {
    console.error("assignTicket error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assign ticket.",
    };
  }
}

/**
 * Server Action: Update ticket status
 * Authorization Rules:
 *  - TECH: ASSIGNED -> IN_PROGRESS -> RESOLVED
 *  - EMPLOYEE: RESOLVED -> CLOSED (for created tickets)
 *  - MANAGER: Any transition
 */
export async function updateTicketStatus(
  input: UpdateTicketStatusInput
): Promise<TicketActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Authentication required. Please sign in." };
    }

    const validation = updateTicketStatusSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Invalid status update data.",
      };
    }

    const { ticketId, newStatus } = validation.data;

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return { success: false, error: "Ticket not found." };
    }

    const currentStatus = ticket.status;

    if (currentStatus === newStatus) {
      return { success: false, error: `Ticket is already in ${newStatus} status.` };
    }

    // Role-based status transition checks
    if (currentUser.role === Role.EMPLOYEE) {
      if (ticket.creatorId !== currentUser.id) {
        return { success: false, error: "Employees can only update status for tickets they created." };
      }
      if (currentStatus !== TicketStatus.RESOLVED || newStatus !== TicketStatus.CLOSED) {
        return {
          success: false,
          error: "Employees can only close tickets that are in RESOLVED status.",
        };
      }
    } else if (currentUser.role === Role.TECH) {
      const isAssignee = ticket.assigneeId === currentUser.id;
      if (!isAssignee) {
        return { success: false, error: "Technicians can only update tickets assigned to them." };
      }

      const isValidTechTransition =
        (currentStatus === TicketStatus.ASSIGNED && newStatus === TicketStatus.IN_PROGRESS) ||
        (currentStatus === TicketStatus.IN_PROGRESS && newStatus === TicketStatus.RESOLVED) ||
        (currentStatus === TicketStatus.OPEN && newStatus === TicketStatus.IN_PROGRESS);

      if (!isValidTechTransition) {
        return {
          success: false,
          error: `Technicians cannot transition status from ${currentStatus} to ${newStatus}. Permitted flow: ASSIGNED -> IN_PROGRESS -> RESOLVED.`,
        };
      }
    }

    // Perform status update and activity log
    const updatedTicket = await prisma.$transaction(async (tx) => {
      const updated = await tx.ticket.update({
        where: { id: ticketId },
        data: { status: newStatus },
      });

      await tx.activity.create({
        data: {
          ticketId,
          userId: currentUser.id,
          actionType: ActionType.STATUS_CHANGE,
          previousStatus: currentStatus,
          newStatus,
          text: `Status changed from ${currentStatus} to ${newStatus}`,
        },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath("/tickets");
    revalidatePath(`/tickets/${ticketId}`);

    return { success: true, data: updatedTicket };
  } catch (error) {
    console.error("updateTicketStatus error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update ticket status.",
    };
  }
}

/**
 * Server Action: Claim an unassigned ticket
 * Authorization: Allowed for TECH only, and only if they have 0 active tickets.
 */
export async function claimTicket(ticketId: string): Promise<TicketActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Authentication required. Please sign in." };
    }

    if (currentUser.role !== Role.TECH) {
      return { success: false, error: "Unauthorized. Only Technicians can claim tickets." };
    }

    // Check active workload
    const activeTicketsCount = await prisma.ticket.count({
      where: {
        assigneeId: currentUser.id,
        status: { in: [TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS] },
      },
    });

    if (activeTicketsCount > 0) {
      return {
        success: false,
        error: "You must resolve your current active tickets before claiming a new one.",
      };
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return { success: false, error: "Ticket not found." };
    }

    if (ticket.assigneeId || ticket.status !== TicketStatus.OPEN) {
      return { success: false, error: "Ticket is already assigned or not open." };
    }

    const previousStatus = ticket.status;

    const updatedTicket = await prisma.$transaction(async (tx) => {
      const updated = await tx.ticket.update({
        where: { id: ticketId },
        data: {
          assigneeId: currentUser.id,
          status: TicketStatus.ASSIGNED,
        },
      });

      await tx.activity.create({
        data: {
          ticketId,
          userId: currentUser.id,
          actionType: ActionType.ASSIGNMENT,
          previousStatus,
          newStatus: TicketStatus.ASSIGNED,
          text: `Technician claimed ticket`,
        },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath("/tickets");
    revalidatePath(`/tickets/${ticketId}`);

    return { success: true, data: updatedTicket };
  } catch (error) {
    console.error("claimTicket error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to claim ticket.",
    };
  }
}

/**
 * Server Action: Add a comment/activity to a ticket
 * Authorization: Allowed for users associated with the ticket (Creator, Assignee, or MANAGER)
 */
export async function addComment(input: AddCommentInput): Promise<TicketActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Authentication required. Please sign in." };
    }

    const validation = addCommentSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Invalid comment text.",
      };
    }

    const { ticketId, text } = validation.data;

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return { success: false, error: "Ticket not found." };
    }

    const isAssociated =
      currentUser.role === Role.MANAGER ||
      ticket.creatorId === currentUser.id ||
      ticket.assigneeId === currentUser.id;

    if (!isAssociated) {
      return {
        success: false,
        error: "Unauthorized. You can only comment on tickets you created or are assigned to.",
      };
    }

    const activity = await prisma.activity.create({
      data: {
        ticketId,
        userId: currentUser.id,
        actionType: ActionType.COMMENT,
        text,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/tickets");
    revalidatePath(`/tickets/${ticketId}`);

    return { success: true, data: activity };
  } catch (error) {
    console.error("addComment error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add comment.",
    };
  }
}

/**
 * Helper Server Action: Get tickets based on user role
 */
export async function getTickets() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return [];

  let whereClause = {};

  if (currentUser.role === Role.EMPLOYEE) {
    whereClause = { creatorId: currentUser.id };
  } else if (currentUser.role === Role.TECH) {
    const activeCount = await prisma.ticket.count({
      where: {
        assigneeId: currentUser.id,
        status: { in: [TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS] },
      },
    });

    if (activeCount > 0) {
      whereClause = { assigneeId: currentUser.id };
    } else {
      whereClause = {
        OR: [{ assigneeId: currentUser.id }, { status: TicketStatus.OPEN, assigneeId: null }],
      };
    }
  }
  // MANAGER sees all tickets

  return await prisma.ticket.findMany({
    where: whereClause,
    include: {
      creator: { select: { id: true, name: true, email: true, role: true } },
      assignee: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Helper Server Action: Get single ticket with full details and activity log
 */
export async function getTicketById(ticketId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
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

  if (!ticket) return null;

  const isAssociated =
    currentUser.role === Role.MANAGER ||
    ticket.creatorId === currentUser.id ||
    ticket.assigneeId === currentUser.id ||
    currentUser.role === Role.TECH;

  if (!isAssociated) return null;

  return ticket;
}
