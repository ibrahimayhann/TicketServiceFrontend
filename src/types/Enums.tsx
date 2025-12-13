export const TicketStatus = {
    Open: "Open",
    InProgress: "InProgress",
    Resolved: "Resolved",
    Closed: "Closed",
} as const;

export type TicketStatus =
    (typeof TicketStatus)[keyof typeof TicketStatus];

export const TicketPriority = {
    Low: "Low",
    Medium: "Medium",
    High: "High",
    Urgent: "Urgent",
} as const;

export type TicketPriority =
    (typeof TicketPriority)[keyof typeof TicketPriority];
