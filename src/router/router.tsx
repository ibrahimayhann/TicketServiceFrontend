import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../component/layout/AppLayout";
import DashboardPage from "../pages/DashboardPage";
import TicketListPage from "../pages/TicketListPage";
import TicketCreatePage from "../pages/TicketCreatePage";
import TicketDetailsPage from "../pages/TicketDetailsPage";

export const router = createBrowserRouter([
    {
        path: "/",                // ✅ ROOT
        element: <AppLayout />,
        children: [
            // ✅ site açılınca otomatik buraya gitsin
            { index: true, element: <Navigate to="/tickets" replace /> },

            { path: "dashboard", element: <DashboardPage /> },
            { path: "tickets", element: <TicketListPage /> },
            { path: "tickets/new", element: <TicketCreatePage /> },
            { path: "tickets/:id", element: <TicketDetailsPage /> },
        ],
    },
]);
