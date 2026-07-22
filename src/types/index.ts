import {
  Role,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  ActionType,
  User,
  Ticket,
  Activity,
} from "@prisma/client";

export { Role, TicketStatus, TicketPriority, TicketCategory, ActionType };
export type { User, Ticket, Activity };

export type TicketWithDetails = Ticket & {
  creator: Pick<User, "id" | "name" | "email" | "role">;
  assignee?: Pick<User, "id" | "name" | "email" | "role"> | null;
  activities?: (Activity & {
    user: Pick<User, "id" | "name" | "email">;
  })[];
};

export type FormattedTicket = Omit<Ticket, "id"> & {
  id: string; // Internal UUID
  formattedId: string; // TKT-XXX visual ID
};
