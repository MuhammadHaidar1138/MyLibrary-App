import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Template from "../layouts/Template";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "../middleware/ProtectedRoute";
import MembersIndex from "../pages/members";
import BooksIndex from "../pages/books";

export const router = createBrowserRouter([
    { path: '/login', element: <Login /> },
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <Template />
            </ProtectedRoute>
        ),
        children: [
            { path: '/', element: <Navigate to="/dashboard" replace /> },
            { path: '/dashboard', element: <Dashboard /> },
            { path: '/member', element: <MembersIndex /> },
            { path: '/book', element: <BooksIndex /> }, 
        ],
    },
]);