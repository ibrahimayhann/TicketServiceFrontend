import "../css/DashboardPage.css";
import { useQuery } from "@tanstack/react-query";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
} from "recharts";
import TicketService from "../services/TicketService";

const STATUS_COLORS: Record<string, string> = {
    Open: "#3b82f6",
    InProgress: "#f59e0b",
    Resolved: "#22c55e",
    Closed: "#64748b",
};

const PRIORITY_COLORS: Record<string, string> = {
    Low: "#22c55e",
    Medium: "#facc15",
    High: "#f97316",
    Urgent: "#ef4444",
};

type StatusReportItem = { status: string; count: number };
type PriorityReportItem = { priority: string; count: number };

export default function DashboardPage() {
    const q = useQuery({
        queryKey: ["dashboard-reports"],
        queryFn: async () => {
            const [status, priority] = await Promise.all([
                TicketService.getStatusReport() as Promise<StatusReportItem[]>,
                TicketService.getPriorityReport() as Promise<PriorityReportItem[]>,
            ]);
            return { status, priority };
        },
    });

    if (q.isLoading) return <div className="dashboard-loading">Yükleniyor…</div>;
    if (q.isError || !q.data)
        return <div className="dashboard-error">Dashboard verisi alınamadı</div>;

    const statusData = q.data.status.map((x) => ({ name: x.status, value: x.count }));
    const priorityData = q.data.priority.map((x) => ({ name: x.priority, value: x.count }));

    const totalTickets = q.data.status.reduce((sum, x) => sum + x.count, 0);
    const openTickets = q.data.status.find((x) => x.status === "Open")?.count ?? 0;
    const resolvedTickets = q.data.status.find((x) => x.status === "Resolved")?.count ?? 0;

    const priorityTotal = q.data.priority.reduce((sum, x) => sum + x.count, 0);

    return (
        <div className="dashboard-page">
            <h2 className="dashboard-title">Ticket Analytics</h2>

            <div className="dashboard-cards">
                <div className="dashboard-card">
                    <span>Total Tickets</span>
                    <strong>{totalTickets}</strong>
                </div>
                <div className="dashboard-card">
                    <span>Open Tickets</span>
                    <strong>{openTickets}</strong>
                </div>
                <div className="dashboard-card">
                    <span>Resolved Tickets</span>
                    <strong>{resolvedTickets}</strong>
                </div>
            </div>

            <div className="dashboard-charts">
                <div className="dashboard-chart-card">
                    <h3>Tickets by Status</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={statusData}>
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {statusData.map((e) => (
                                    <Cell key={e.name} fill={STATUS_COLORS[e.name] ?? "#94a3b8"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="dashboard-chart-card">
                    <h3>Tickets by Priority</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={priorityData}
                                dataKey="value"
                                nameKey="name"
                                cx="40%"
                                cy="50%"
                                outerRadius={90}
                            >
                                {priorityData.map((e) => (
                                    <Cell key={e.name} fill={PRIORITY_COLORS[e.name] ?? "#94a3b8"} />
                                ))}
                            </Pie>

                            <Tooltip />
                            <Legend
                                layout="vertical"
                                align="right"
                                verticalAlign="middle"
                                formatter={(value, entry: any) => {
                                    const v = entry?.payload?.value ?? 0;
                                    const pct = priorityTotal ? Math.round((v / priorityTotal) * 100) : 0;
                                    return `${value} (${pct}%)`;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
