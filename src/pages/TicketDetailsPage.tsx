import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import "../css/TicketDetailsPage.css";

import TicketService from "../services/TicketService";
import CommentService from "../services/CommentService";

import type { TicketType, TicketCommentType } from "../types/TicketType";
import { TicketPriority, TicketStatus } from "../types/Enums";
import { toast } from "react-toastify";
import Spinner from "../component/Spinner";

const formatDateTime = (iso?: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    const hour = String(d.getHours()).padStart(2, "0");
    const minute = String(d.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year}-${hour}.${minute}`;
};

type FormTicket = {
    title: string;
    description: string;
    status: TicketType["status"];
    priority: TicketType["priority"];
    assignee: string;
    tagsText: string; 
};

type NewCommentForm = {
    author: string;
    message: string;
};

export default function TicketDetailsPage() {
    const { id } = useParams();
    const ticketId = Number(id);

    const navigate = useNavigate();
    const qc = useQueryClient();

    const ticketKey = useMemo(() => ["ticket", ticketId] as const, [ticketId]);
    const commentsKey = useMemo(
        () => ["ticket-comments", ticketId] as const,
        [ticketId]
    );

    const [isEditingTicket, setIsEditingTicket] = useState(false);
    const [ticketForm, setTicketForm] = useState<FormTicket | null>(null);

    const [newComment, setNewComment] = useState<NewCommentForm>({
        author: "",
        message: "",
    });

    
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [commentEditDraft, setCommentEditDraft] = useState<{
        author: string;
        message: string;
    }>({ author: "", message: "" });

    // --- Queries ---
    const ticketQuery = useQuery({
        queryKey: ticketKey,
        queryFn: () => TicketService.getTicketById(ticketId),
        enabled: Number.isFinite(ticketId) && ticketId > 0,
    });

    const commentsQuery = useQuery({
        queryKey: commentsKey,
        queryFn: () => CommentService.getCommentsByTicketId(ticketId),
        enabled: Number.isFinite(ticketId) && ticketId > 0,
    });

    // ticket gelince formu doldur
    useEffect(() => {
        const t = ticketQuery.data;
        if (!t) return;

        setTicketForm({
            title: t.title ?? "",
            description: t.description ?? "",
            status: t.status,
            priority: t.priority,
            assignee: t.assignee ?? "",
            tagsText: Array.isArray(t.tags) ? t.tags.join(", ") : "",
        });
    }, [ticketQuery.data]);

    // --- Mutations ---
    const updateTicketMutation = useMutation({
        mutationFn: async () => {
            if (!ticketForm) return;

            const tags =
                ticketForm.tagsText
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean) || [];

            await TicketService.updateTicket(ticketId, {
                title: ticketForm.title,
                description: ticketForm.description,
                status: ticketForm.status,
                priority: ticketForm.priority,
                assignee: ticketForm.assignee.trim() ? ticketForm.assignee.trim() : null,
                tags: tags.length ? tags : null,
            });
        },
        onSuccess: async () => {
            toast.success("Ticket güncellendi.");
            await qc.invalidateQueries({ queryKey: ticketKey });
            setIsEditingTicket(false);
        },
        onError: () => {
            toast.error("Ticket güncellenemedi.");
        },
    });

    const addCommentMutation = useMutation({
        mutationFn: (payload: { author: string; message: string }) =>
            CommentService.addCommentToTicket(ticketId, payload),
        onSuccess: async () => {
            setNewComment({ author: "", message: "" });
            toast.success("Comment başarıyla eklendi.");
            await qc.invalidateQueries({ queryKey: commentsKey });
            await qc.invalidateQueries({ queryKey: ticketKey });
        },
        onError: () => {
            toast.error("Comment eklenemedi.");
        },
    });

    const updateCommentMutation = useMutation({
        mutationFn: (payload: { commentId: number; author: string; message: string }) =>
            CommentService.updateComment(payload.commentId, {
                author: payload.author,
                message: payload.message,
            }),
        onSuccess: async () => {
            setEditingCommentId(null);
            toast.success("Comment güncellendi.");
            await qc.invalidateQueries({ queryKey: commentsKey });
            await qc.invalidateQueries({ queryKey: ticketKey });
        },
        onError: () => {
            toast.error("Comment güncellenemedi.");
        },
    });

    const deleteCommentMutation = useMutation({
        mutationFn: (commentId: number) => CommentService.deleteComment(commentId),
        onSuccess: async () => {
            toast.success("Comment silindi.");
            await qc.invalidateQueries({ queryKey: commentsKey });
            await qc.invalidateQueries({ queryKey: ticketKey });
        },
        onError: () => {
            toast.error("Comment silinemedi.");
        },
    });

    // --- Loading flags ---
    const isMutating =
        updateTicketMutation.isPending ||
        addCommentMutation.isPending ||
        updateCommentMutation.isPending ||
        deleteCommentMutation.isPending;

    
    const isRefetching = ticketQuery.isFetching || commentsQuery.isFetching;

    const ticket = ticketQuery.data;
    const comments = commentsQuery.data ?? [];

    // --- Helpers ---
    const handleStartEditTicket = () => {
        if (!ticketForm) return;
        setIsEditingTicket(true);
    };

    const handleCancelEditTicket = () => {
        const t = ticketQuery.data;
        if (t) {
            setTicketForm({
                title: t.title ?? "",
                description: t.description ?? "",
                status: t.status,
                priority: t.priority,
                assignee: t.assignee ?? "",
                tagsText: Array.isArray(t.tags) ? t.tags.join(", ") : "",
            });
        }
        setIsEditingTicket(false);
    };

    const beginEditComment = (c: TicketCommentType) => {
        setEditingCommentId(c.id);
        setCommentEditDraft({ author: c.author ?? "", message: c.message ?? "" });
    };

    const cancelEditComment = () => {
        setEditingCommentId(null);
        setCommentEditDraft({ author: "", message: "" });
    };

    // Render guards 
    if (!Number.isFinite(ticketId) || ticketId <= 0) {
        return (
            <div className="tdp-page">
                <div className="tdp-header">
                    <h2>Ticket Details</h2>
                </div>
                <div className="tdp-card tdp-error">Geçersiz ticket id.</div>
            </div>
        );
    }

    
    if (ticketQuery.isLoading || commentsQuery.isLoading) {
        return (
            <div className="tdp-page tdp-page-spinner">
                <Spinner />
            </div>
        );
    }

    if (ticketQuery.isError || !ticket) {
        return (
            <div className="tdp-page">
                <div className="tdp-header">
                    <h2>Ticket Details</h2>
                    <button className="tdp-btn tdp-btn-secondary" onClick={() => navigate(-1)}>
                        Geri
                    </button>
                </div>
                <div className="tdp-card tdp-error">Ticket yüklenirken hata oluştu.</div>
            </div>
        );
    }

    return (
        <div className="tdp-page">
            
            {isRefetching ? (
                <div className="tdp-busy">
                    <Spinner />
                    <span>Güncelleniyor...</span>
                </div>
            ) : null}

            <div className="tdp-header">
                <div className="tdp-title">
                    <h2>Ticket Details</h2>
                    {ticket?.id ? <span className="tdp-badge">#{ticket.id}</span> : null}
                </div>

                <div className="tdp-header-actions">
                    <button className="tdp-btn tdp-btn-secondary" onClick={() => navigate(-1)} disabled={isMutating}>
                        Geri
                    </button>
                </div>
            </div>

            <div className="tdp-layout">
                {/* LEFT */}
                <div className="tdp-left">
                    <div className="tdp-card">
                        <div className="tdp-card-header">
                            <h3>Ticket Bilgileri</h3>

                            {!isEditingTicket ? (
                                <button className="tdp-btn" onClick={handleStartEditTicket} disabled={isMutating || !ticketForm}>
                                    Update
                                </button>
                            ) : (
                                <div className="tdp-inline-actions">
                                    <button
                                        className="tdp-btn tdp-btn-primary"
                                        onClick={() => updateTicketMutation.mutate()}
                                        disabled={isMutating || !ticketForm}
                                    >
                                        {updateTicketMutation.isPending ? <Spinner /> : "Kaydet"}
                                    </button>

                                    <button
                                        className="tdp-btn tdp-btn-secondary"
                                        onClick={handleCancelEditTicket}
                                        disabled={isMutating}
                                    >
                                        İptal
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="tdp-grid">
                            <label className="tdp-field">
                                <span>Title</span>
                                <input
                                    type="text"
                                    value={ticketForm?.title ?? ""}
                                    readOnly={!isEditingTicket}
                                    onChange={(e) => setTicketForm((p) => (p ? { ...p, title: e.target.value } : p))}
                                />
                            </label>

                            <label className="tdp-field tdp-field-full">
                                <span>Description</span>
                                <textarea
                                    value={ticketForm?.description ?? ""}
                                    readOnly={!isEditingTicket}
                                    onChange={(e) =>
                                        setTicketForm((p) => (p ? { ...p, description: e.target.value } : p))
                                    }
                                    rows={6}
                                />
                            </label>

                            <label className="tdp-field">
                                <span>Status</span>
                                <select
                                    value={ticketForm?.status ?? TicketStatus.Open}
                                    disabled={!isEditingTicket}
                                    onChange={(e) =>
                                        setTicketForm((p) => (p ? { ...p, status: e.target.value as TicketType["status"] } : p))
                                    }
                                >
                                    {Object.values(TicketStatus).map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="tdp-field">
                                <span>Priority</span>
                                <select
                                    value={ticketForm?.priority ?? TicketPriority.Low}
                                    disabled={!isEditingTicket}
                                    onChange={(e) =>
                                        setTicketForm((p) =>
                                            p ? { ...p, priority: e.target.value as TicketType["priority"] } : p
                                        )
                                    }
                                >
                                    {Object.values(TicketPriority).map((p) => (
                                        <option key={p} value={p}>
                                            {p}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="tdp-field">
                                <span>Assignee</span>
                                <input
                                    type="text"
                                    value={ticketForm?.assignee ?? ""}
                                    readOnly={!isEditingTicket}
                                    onChange={(e) => setTicketForm((p) => (p ? { ...p, assignee: e.target.value } : p))}
                                    placeholder="örn: Frontend Team"
                                />
                            </label>

                            <label className="tdp-field">
                                <span>Tags</span>
                                <input
                                    type="text"
                                    value={ticketForm?.tagsText ?? ""}
                                    readOnly={!isEditingTicket}
                                    onChange={(e) => setTicketForm((p) => (p ? { ...p, tagsText: e.target.value } : p))}
                                    placeholder="bug, ui, backend"
                                />
                            </label>

                            <div className="tdp-meta tdp-field-full">
                                <div>
                                    <span className="tdp-meta-label">Created:</span>{" "}
                                    <span className="tdp-mono">{formatDateTime(ticket?.createdAt)}</span>
                                </div>

                                <div>
                                    <span className="tdp-meta-label">Updated:</span>{" "}
                                    <span className="tdp-mono">{formatDateTime(ticket?.updatedAt)}</span>
                                </div>
                            </div>
                        </div>

                        {updateTicketMutation.isError ? (
                            <div className="tdp-error tdp-mt">Ticket update sırasında hata oluştu.</div>
                        ) : null}
                    </div>
                </div>

                {/* RIGHT */}
                <div className="tdp-right">
                    <div className="tdp-card">
                        <div className="tdp-card-header">
                            <h3>Comments</h3>
                            <span className="tdp-muted">{comments.length} adet</span>
                        </div>

                        {/* Add new comment */}
                        <div className="tdp-comment-add">
                            <div className="tdp-row">
                                <label className="tdp-field">
                                    <span>Author</span>
                                    <input
                                        type="text"
                                        value={newComment.author}
                                        onChange={(e) => setNewComment((p) => ({ ...p, author: e.target.value }))}
                                        placeholder="örn: ibrahim"
                                        disabled={isMutating}
                                    />
                                </label>
                            </div>

                            <label className="tdp-field tdp-field-full">
                                <span>Message</span>
                                <textarea
                                    value={newComment.message}
                                    onChange={(e) => setNewComment((p) => ({ ...p, message: e.target.value }))}
                                    rows={3}
                                    placeholder="Yorum yaz..."
                                    disabled={isMutating}
                                />
                            </label>

                            <div className="tdp-inline-actions">
                                <button
                                    className="tdp-btn tdp-btn-primary"
                                    disabled={isMutating || !newComment.author.trim() || !newComment.message.trim()}
                                    onClick={() =>
                                        addCommentMutation.mutate({
                                            author: newComment.author.trim(),
                                            message: newComment.message.trim(),
                                        })
                                    }
                                >
                                    {addCommentMutation.isPending ? <Spinner /> : "Comment Ekle"}
                                </button>
                            </div>

                            {addCommentMutation.isError ? (
                                <div className="tdp-error tdp-mt">Comment eklenirken hata oluştu.</div>
                            ) : null}
                        </div>

                        <div className="tdp-divider" />

                        {/* Comments list */}
                        {commentsQuery.isError ? (
                            <div className="tdp-error">Yorumlar yüklenirken hata oluştu.</div>
                        ) : comments.length === 0 ? (
                            <div className="tdp-no-comment">Bu ticket için henüz yorum yok.</div>
                        ) : (
                            <ul className="tdp-comment-list">
                                {comments.map((c) => {
                                    const isEditingThis = editingCommentId === c.id;

                                    return (
                                        <li key={c.id} className="tdp-comment-item">
                                            <div className="tdp-comment-top">
                                                <div className="tdp-comment-meta">
                                                    <span className="tdp-comment-author">{c.author}</span>
                                                    <span className="tdp-dot">•</span>
                                                    <span className="tdp-comment-date tdp-mono">{formatDateTime(c.createdAt)}</span>
                                                </div>

                                                {!isEditingThis ? (
                                                    <div className="tdp-inline-actions">
                                                        <button className="tdp-btn tdp-btn-small" onClick={() => beginEditComment(c)} disabled={isMutating}>
                                                            Düzenle
                                                        </button>
                                                        <button
                                                            className="tdp-btn tdp-btn-small tdp-btn-danger"
                                                            onClick={() => deleteCommentMutation.mutate(c.id)}
                                                            disabled={isMutating}
                                                        >
                                                            {deleteCommentMutation.isPending ? <Spinner /> : "Sil"}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="tdp-inline-actions">
                                                        <button
                                                            className="tdp-btn tdp-btn-small tdp-btn-primary"
                                                            onClick={() =>
                                                                updateCommentMutation.mutate({
                                                                    commentId: c.id,
                                                                    author: commentEditDraft.author.trim(),
                                                                    message: commentEditDraft.message.trim(),
                                                                })
                                                            }
                                                            disabled={isMutating || !commentEditDraft.author.trim() || !commentEditDraft.message.trim()}
                                                        >
                                                            {updateCommentMutation.isPending ? <Spinner /> : "Kaydet"}
                                                        </button>
                                                        <button className="tdp-btn tdp-btn-small tdp-btn-secondary" onClick={cancelEditComment} disabled={isMutating}>
                                                            İptal
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {!isEditingThis ? (
                                                <p className="tdp-comment-message">{c.message}</p>
                                            ) : (
                                                <div className="tdp-comment-edit">
                                                    <label className="tdp-field">
                                                        <span>Author</span>
                                                        <input
                                                            type="text"
                                                            value={commentEditDraft.author}
                                                            onChange={(e) => setCommentEditDraft((p) => ({ ...p, author: e.target.value }))}
                                                            disabled={isMutating}
                                                        />
                                                    </label>

                                                    <label className="tdp-field tdp-field-full">
                                                        <span>Message</span>
                                                        <textarea
                                                            value={commentEditDraft.message}
                                                            onChange={(e) => setCommentEditDraft((p) => ({ ...p, message: e.target.value }))}
                                                            rows={3}
                                                            disabled={isMutating}
                                                        />
                                                    </label>
                                                </div>
                                            )}

                                            {updateCommentMutation.isError && isEditingThis ? (
                                                <div className="tdp-error tdp-mt">Comment update sırasında hata oluştu.</div>
                                            ) : null}

                                            {deleteCommentMutation.isError ? (
                                                <div className="tdp-error tdp-mt">Comment silinirken hata oluştu.</div>
                                            ) : null}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
