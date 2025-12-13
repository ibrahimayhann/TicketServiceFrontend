import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    IconButton
} from "@mui/material";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { NavLink } from "react-router-dom";

const linkSx = {
    textTransform: "none",
    fontWeight: 600,
    borderRadius: 2,
    px: 2,
};

export default function Navbar() {
    return (
        <AppBar
            position="sticky"
            elevation={1}
            sx={{
                background: "linear-gradient(90deg, #0f172a, #020617)", // dark slate → near black
            }}
        >
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                {/* Sol: icon + app adı */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                    <IconButton edge="start" sx={{ color: "#38bdf8" }}>
                        <SupportAgentIcon />
                    </IconButton>

                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 800,
                            letterSpacing: 0.5,
                            color: "#e5e7eb",
                        }}
                    >
                        TicketFlow
                    </Typography>
                </Box>

                {/* Sağ: nav butonları */}
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                        component={NavLink}
                        to="/dashboard"
                        sx={{
                            ...linkSx,
                            color: "#cbd5f5",
                            "&.active": {
                                backgroundColor: "rgba(255,255,255,0.12)",
                            },
                        }}
                    >
                        Dashboard
                    </Button>

                    <Button
                        component={NavLink}
                        to="/tickets"
                        sx={{
                            ...linkSx,
                            color: "#cbd5f5",
                            "&.active": {
                                backgroundColor: "rgba(255,255,255,0.12)",
                            },
                        }}
                    >
                        Tickets
                    </Button>

                    <Button
                        component={NavLink}
                        to="/tickets/new"
                        variant="contained"
                        sx={{
                            ...linkSx,
                            fontWeight: 700,
                            backgroundColor: "#38bdf8",
                            color: "#020617",
                            "&:hover": {
                                backgroundColor: "#0ea5e9",
                            },
                        }}
                    >
                        Create Ticket
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
