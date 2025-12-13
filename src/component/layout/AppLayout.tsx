import { Outlet } from "react-router-dom";
import Navbar from "../navbar";
import { Box, Container } from "@mui/material";

export default function AppLayout() {
    return (
        <>
            <Navbar />

            <Box>
                <Container maxWidth="xl">
                    <Outlet />
                </Container>
            </Box>
        </>
    );
}
