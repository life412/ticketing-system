import { z } from "zod";
import { TicketPriority, TicketCategory, TicketStatus } from "@prisma/client";

export const createTicketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: "Title must be at least 3 characters long." })
    .max(100, { message: "Title cannot exceed 100 characters." }),
  description: z
    .string()
    .trim()
    .min(10, { message: "Description must be at least 10 characters long." }),
  priority: z.nativeEnum(TicketPriority, {
    message: "Please select a valid priority level.",
  }),
  category: z.nativeEnum(TicketCategory, {
    message: "Please select a valid ticket category.",
  }),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

export const assignTicketSchema = z.object({
  ticketId: z.string().min(1, { message: "Ticket ID is required." }),
  techId: z.string().min(1, { message: "Technician ID is required." }),
});

export type AssignTicketInput = z.infer<typeof assignTicketSchema>;

export const updateTicketStatusSchema = z.object({
  ticketId: z.string().min(1, { message: "Ticket ID is required." }),
  newStatus: z.nativeEnum(TicketStatus, {
    message: "Please select a valid status.",
  }),
});

export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;

export const addCommentSchema = z.object({
  ticketId: z.string().min(1, { message: "Ticket ID is required." }),
  text: z
    .string()
    .trim()
    .min(1, { message: "Comment cannot be empty." })
    .max(1000, { message: "Comment cannot exceed 1000 characters." }),
});

export type AddCommentInput = z.infer<typeof addCommentSchema>;
