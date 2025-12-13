import type { TicketPriority } from "./Enums";

export type CreateTicketRequest = {
    title: string;
    description: string;
    priority: TicketPriority;
    assignee?: string | null;
    tags?: string | null;
};
