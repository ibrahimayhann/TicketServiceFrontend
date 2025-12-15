import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import "../css/TicketCreate.css";
import { toast } from "react-toastify";


import TicketService from "../services/TicketService";
import type { TicketPriority, TicketStatus } from "../types/Enums";
import {
    TicketPriority as TicketPriorityEnum,
    TicketStatus as TicketStatusEnum,
} from "../types/Enums";
import type { CreateTicketRequest } from "../types/Requests"

type CreateTicketForm = {
    title: string;
    description: string;
    priority: TicketPriority;
    status: TicketStatus; 
    assignee: string;
    tagsText: string; 
};

export default function TicketCreate() {
    const navigate = useNavigate();
    const qc = useQueryClient();

    const [form, setForm] = useState<CreateTicketForm>({
        title: "",
        description: "",
        priority: TicketPriorityEnum.Medium,
        status: TicketStatusEnum.Open,
        assignee: "",
        tagsText: "",
    });

    const payload: CreateTicketRequest = useMemo(
        () => ({
            title: form.title.trim(),
            description: form.description.trim(),
            priority: form.priority,
            assignee: form.assignee.trim() ? form.assignee.trim() : null,
            tags: form.tagsText.trim() ? form.tagsText.trim() : null,
        }),
        [form]
    );

    const createMutation = useMutation({
        mutationFn: () => TicketService.createTicket(payload),
        onSuccess: async (created) => {
            await qc.invalidateQueries({ queryKey: ["tickets"] });
            toast.success("Ticket başarıyla oluşturuldu.");
            navigate(`/tickets/${created.id}`);
        },
    });

    const canSave =
        payload.title.length > 0 &&
        payload.description.length > 0 &&
        !createMutation.isPending;

    return (
        <div className="tc-page">
            <div className="tc-header">
                <h2>Create Ticket</h2>

                <div className="tc-actions">
                    <button
                        className="tc-btn tc-btn-secondary"
                        onClick={() => navigate(-1)}
                        disabled={createMutation.isPending}
                    >
                        Geri
                    </button>

                    <button
                        className="tc-btn tc-btn-primary"
                        onClick={() => createMutation.mutate()}
                        disabled={!canSave}
                    >
                        {createMutation.isPending ? "Kaydediliyor..." : "Save"}
                    </button>
                </div>
            </div>

            <div className="tc-card">
                <div className="tc-grid">
                    <label className="tc-field tc-full">
                        <span>Title</span>
                        <input
                            value={form.title}
                            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                            placeholder="Örn: Log formatı standardizasyonu"
                        />
                    </label>

                    <label className="tc-field tc-full">
                        <span>Description</span>
                        <textarea
                            value={form.description}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, description: e.target.value }))
                            }
                            placeholder="Ticket açıklaması..."
                            rows={7}
                        />
                    </label>

                    <label className="tc-field">
                        <span>Status</span>
                        <select
                            value={form.status}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, status: e.target.value as TicketStatus }))
                            }
                        >
                            {Object.values(TicketStatusEnum).map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="tc-field">
                        <span>Priority</span>
                        <select
                            value={form.priority}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    priority: e.target.value as TicketPriority,
                                }))
                            }
                        >
                            {Object.values(TicketPriorityEnum).map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="tc-field">
                        <span>Assignee</span>
                        <input
                            value={form.assignee}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, assignee: e.target.value }))
                            }
                            placeholder="örn: devops"
                        />
                    </label>

                    <label className="tc-field">
                        <span>Tags</span>
                        <input
                            value={form.tagsText}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, tagsText: e.target.value }))
                            }
                            placeholder="bug, ui, backend"
                        />
                    </label>
                </div>

                {createMutation.isError ? (
                    <div className="tc-error">Ticket create sırasında hata oluştu.</div>

                ) : null}
            </div>
        </div>
    );
}
