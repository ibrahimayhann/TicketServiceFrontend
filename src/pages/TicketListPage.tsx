import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import {
    Box,
    Button,
    Chip,
    Container,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {
    DataGrid,
    type GridColDef,
    type GridPaginationModel,
} from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

import "../css/TicketListPage.css";

import TicketService from "../services/TicketService";
import type { TicketType } from "../types/TicketType";
import { TicketPriority, TicketStatus } from "../types/Enums";

type PagedResult<T> = {
    items: T[];
    totalCount: number;
    page?: number;
    pageSize?: number;
};

export default function TicketListPage() {
    const navigate = useNavigate();

    // Filters
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<TicketStatus | "">("");
    const [priority, setPriority] = useState<TicketPriority | "">("");
    const [assignee, setAssignee] = useState("");

    // Pagination 
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10,
    });

    const { data, isLoading, isError, error, isFetching } = useQuery({
        queryKey: [
            "tickets",
            paginationModel.page,
            paginationModel.pageSize,
            search,
            status,
            priority,
            assignee,
        ],
        queryFn: async () => {
            const res = (await TicketService.getAllTickets({
                page: paginationModel.page + 1, // backend 1-based
                pageSize: paginationModel.pageSize,
                search: search || undefined,
                status: status || undefined,
                priority: priority || undefined,
                assignee: assignee || undefined,
            })) as PagedResult<TicketType>;

            return res;
        },
        placeholderData: (prev) => prev, 
    });

    const items = data?.items ?? [];
    const totalCount = data?.totalCount ?? 0;

    const columns: GridColDef<TicketType>[] = useMemo(
        () => [
            { field: "id", headerName: "Ticket ID", width: 110 },
            { field: "title", headerName: "Title", flex: 1, minWidth: 320 },

            {
                field: "status",
                headerName: "Status",
                width: 140,
                renderCell: (params) => (
                    <Chip size="small" label={params.value} className="tf-statusChip" />
                ),
            },

            {
                field: "priority",
                headerName: "Priority",
                width: 140,
                renderCell: (params) => {
                    const p = params.value as string;

                    const className =
                        p === "Urgent"
                            ? "tf-priorityChip tf-priorityUrgent"
                            : p === "High"
                                ? "tf-priorityChip tf-priorityHigh"
                                : p === "Medium"
                                    ? "tf-priorityChip tf-priorityMedium"
                                    : "tf-priorityChip tf-priorityLow";

                    return <Chip size="small" label={p} className={className} />;
                },
            },

            { field: "assignee", headerName: "Assignee", width: 200 },

            {
                field: "createdAt",
                headerName: "Created Date",
                width: 180,
                valueGetter: (_v, row) => row.createdAt,
            },

            {
                field: "actions",
                headerName: "Actions",
                width: 110,
                sortable: false,
                filterable: false,
                renderCell: (params) => (
                    <Button
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation(); // row click ile çakışmasın
                            navigate(`/tickets/${params.row.id}`);
                        }}
                        className="tf-actionsBtn"
                    >
                        ...
                    </Button>
                ),
            },
        ],
        [navigate]
    );

    const from =
        totalCount === 0
            ? 0
            : paginationModel.page * paginationModel.pageSize + 1;

    const to = Math.min(
        totalCount,
        (paginationModel.page + 1) * paginationModel.pageSize
    );

    if (isError) {
        return (
            <Container maxWidth="xl" disableGutters className="tf-page">
                <Typography className="tf-error">
                    Error: {(error as any)?.message ?? "Unknown error"}
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" disableGutters className="tf-page">
            {/* Header + Filters */}
            <Paper elevation={0} className="tf-panel">
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    className="tf-header"
                >
                    <Typography variant="h4" className="tf-title">
                        Tickets
                    </Typography>

                    
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <TextField
                        size="small"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPaginationModel((p) => ({ ...p, page: 0 }));
                        }}
                        className="tf-search"
                    />

                    <TextField
                        size="small"
                        select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value as any);
                            setPaginationModel((p) => ({ ...p, page: 0 }));
                        }}
                        className="tf-filter"
                        SelectProps={{
                            displayEmpty: true,
                            renderValue: (selected) =>
                                selected ? String(selected) : "Status",
                        }}
                    >
                        <MenuItem value="">All Status</MenuItem>
                        {Object.values(TicketStatus).map((s) => (
                            <MenuItem key={s} value={s}>
                                {s}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        size="small"
                        select
                        value={priority}
                        onChange={(e) => {
                            setPriority(e.target.value as any);
                            setPaginationModel((p) => ({ ...p, page: 0 }));
                        }}
                        className="tf-filter"
                        SelectProps={{
                            displayEmpty: true,
                            renderValue: (selected) =>
                                selected ? String(selected) : "Priority",
                        }}
                    >
                        <MenuItem value="">All Priority</MenuItem>
                        {Object.values(TicketPriority).map((p) => (
                            <MenuItem key={p} value={p}>
                                {p}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        size="small"
                        placeholder="Assignee"
                        value={assignee}
                        onChange={(e) => {
                            setAssignee(e.target.value);
                            setPaginationModel((p) => ({ ...p, page: 0 }));
                        }}
                        className="tf-assignee"
                    />
                </Stack>
            </Paper>

            {/* Table */}
            <Paper elevation={0} className="tf-tableWrap">
                <Box className="tf-gridBox">
                    <DataGrid
                        rows={items}
                        columns={columns}
                        getRowId={(row) => row.id}
                        loading={isLoading || isFetching}
                        rowCount={totalCount}
                        paginationMode="server"
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[10, 25, 50]}
                        disableRowSelectionOnClick
                        onRowClick={(params) => navigate(`/tickets/${params.row.id}`)}
                        getRowClassName={(params) =>
                            (params.row.priority as any) === "Urgent" ? "tf-urgentRow" : ""
                        }
                        className="tf-dataGrid"
                    />
                </Box>

                <Box className="tf-footer">
                    <Typography variant="body2" className="tf-footerText">
                        Showing {from}-{to} of {totalCount} tickets
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}
