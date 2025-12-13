import { TicketPriority, TicketStatus } from './Enums';
// Ticket type
export type TicketType = {
    id: number;

    title: string;
    description: string;

    status: TicketStatus;
    priority: TicketPriority;

    createdAt: string;
    updatedAt?: string | null;

    assignee?: string | null;
    tags?: string[] | null;

    comments?: TicketCommentType[] | null;
};



// Comment type
export type TicketCommentType = {
    id: number;
    author: string;
    message: string;
    createdAt: string; // ISO date string
};