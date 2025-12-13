// src/services/CommentService.ts
import axios from "axios";
import type { TicketCommentType } from "../types/TicketType";

export type CreateTicketCommentRequest = {
    author: string;
    message: string;
};

export type UpdateTicketCommentRequest = {
    author: string;
    message: string;
};

class CommentService {
    private BASE_URL = "https://localhost:7219/api/tickets";

    // GET api/tickets/{ticketId}/comments
    async getCommentsByTicketId(ticketId: number): Promise<TicketCommentType[]> {
        const response = await axios.get<TicketCommentType[]>(
            `${this.BASE_URL}/${ticketId}/comments`
        );
        return response.data;
    }

    // POST api/tickets/{ticketId}/comments
    async addCommentToTicket(
        ticketId: number,
        payload: CreateTicketCommentRequest
    ): Promise<TicketCommentType> {
        const response = await axios.post<TicketCommentType>(
            `${this.BASE_URL}/${ticketId}/comments`,
            payload
        );
        return response.data;
    }

    // PUT api/tickets/comments/{commentId}
    async updateComment(
        commentId: number,
        payload: UpdateTicketCommentRequest
    ): Promise<void> {
        await axios.put(`${this.BASE_URL}/comments/${commentId}`, payload);
    }

    // DELETE api/tickets/comments/{commentId}
    async deleteComment(commentId: number): Promise<void> {
        await axios.delete(`${this.BASE_URL}/comments/${commentId}`);
    }
}

export default new CommentService();
