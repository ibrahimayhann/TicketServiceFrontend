import { Outlet } from "react-router-dom";
import Navbar from "../navbar";
import { Box, Container } from "@mui/material";
import { ToastContainer } from "react-toastify";


export default function AppLayout() {
    return (
        <>
            <Navbar />

            <Box>
                <Container maxWidth="xl">
                    <Outlet />
                </Container>
            </Box>
            <ToastContainer
                position="top-right"
                autoClose={2500}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                draggable
            />
        </>
    );
}
