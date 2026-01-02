import React from 'react';
import { createRouter, createRoute, createRootRoute, redirect, createHashHistory } from '@tanstack/react-router';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminProducts } from './pages/admin/Products';
import { AdminUsers } from './pages/admin/Users';
import { AdminReports } from './pages/admin/Reports';
import { SellerPOS } from './pages/seller/POS';
import { SellerHistory } from './pages/seller/History';
import { LandingSettings } from './pages/admin/LandingSettings';
import { LandingLeads } from './pages/admin/LandingLeads';
import { LandingServices } from './pages/admin/LandingServices';
import { AuthState } from './types';

// Root route with context for auth
const rootRoute = createRootRoute({
  component: Layout,
});

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Admin Routes
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'admin',
  component: ProtectedRoute, // Protect all child routes
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'dashboard',
  component: AdminDashboard,
});

const adminProductsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'products',
  component: AdminProducts,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'users',
  component: AdminUsers,
});

const adminReportsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'reports',
  component: AdminReports,
});

const adminLandingSettingsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'landing/settings',
  component: LandingSettings,
});

const adminLandingLeadsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'landing/leads',
  component: LandingLeads,
});

const adminLandingServicesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'landing/services',
  component: LandingServices,
});

// Seller Routes
const sellerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'seller',
  component: ProtectedRoute, // Protect all child routes
});

const sellerPosRoute = createRoute({
  getParentRoute: () => sellerRoute,
  path: 'pos',
  component: SellerPOS,
});

const sellerHistoryRoute = createRoute({
  getParentRoute: () => sellerRoute,
  path: 'history',
  component: SellerHistory,
});

// Index redirect
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/login' });
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  adminRoute.addChildren([
    adminDashboardRoute,
    adminProductsRoute,
    adminUsersRoute,
    adminReportsRoute,
    adminLandingSettingsRoute,
    adminLandingLeadsRoute,
    adminLandingServicesRoute
  ]),
  sellerRoute.addChildren([sellerPosRoute, sellerHistoryRoute]),
]);

// Use HashHistory for client-side only routing without server configuration
const hashHistory = createHashHistory();

export const router = createRouter({
  routeTree,
  history: hashHistory
});

// Fix: Commented out module augmentation to avoid "module not found" error
/*
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
*/