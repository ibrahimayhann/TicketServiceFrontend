import axios from "axios";
import type { TicketType } from "../types/TicketType";
import type { CreateTicketRequest } from "../types/Requests";

class TicketService {
    BASE_URL = "https://localhost:7219/api/tickets";

    // GET api/tickets
    async getAllTickets(params?: {
        search?: string;
        status?: string;
        priority?: string;
        page?: number;
        pageSize?: number;
        sort?: string;
        assignee?: string;
    }) {
        const response = await axios.get(this.BASE_URL, { params });
        return response.data;
    }

    // GET api/tickets/{id}
    async getTicketById(id: number): Promise<TicketType> {
        const response = await axios.get<TicketType>(`${this.BASE_URL}/${id}`);
        return response.data;
    }

    // POST api/tickets
    async createTicket(payload: CreateTicketRequest) {
        const response = await axios.post(this.BASE_URL, payload);
        return response.data;
    }

    // PUT api/tickets/{id}
    async updateTicket(id: number, payload: Partial<TicketType>): Promise<void> {
        await axios.put(`${this.BASE_URL}/${id}`, payload);
    }

    // DELETE api/tickets/{id}
    async deleteTicket(id: number): Promise<void> {
        await axios.delete(`${this.BASE_URL}/${id}`);
    }

    // ✅ GET api/tickets/reports/status
    async getStatusReport(): Promise<{ status: string; count: number }[]> {
        const response = await axios.get(`${this.BASE_URL}/reports/status`);
        return response.data;
    }

    // ✅ GET api/tickets/reports/priority
    async getPriorityReport(): Promise<{ priority: string; count: number }[]> {
        const response = await axios.get(`${this.BASE_URL}/reports/priority`);
        return response.data;
    }
}

export default new TicketService();
