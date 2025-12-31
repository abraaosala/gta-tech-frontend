import React from 'react';
import { Navigate, Outlet } from '@tanstack/react-router';
import { useAuth } from "../../context/AuthContext";

export const ProtectedRoute = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div>Carregando...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
};
