import React from 'react';
import { Link, Outlet, useLocation } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';


export const Layout = () => {
  const { user, logout } = useAuth();
  // We use useLocation from @tanstack/react-router properly in v1
  const location = useLocation();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Outlet />
      </div>
    );
  }

  const isAdmin = user.role === 'ADMIN';

  const [landingMenuOpen, setLandingMenuOpen] = React.useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/products', label: 'Produtos' },
    { to: '/admin/users', label: 'Usuários' },
    { to: '/admin/reports', label: 'Relatórios' },
  ];

  const landingLinks = [
    { to: '/admin/landing/services', label: 'Serviços Site' },
    { to: '/admin/landing/settings', label: 'Configurações Site' },
    { to: '/admin/landing/leads', label: 'Mensagens Site' },
  ];

  const sellerLinks = [
    { to: '/seller/pos', label: 'PDV' },
    { to: '/seller/history', label: 'Histórico' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row h-screen overflow-hidden">

      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-40 flex-shrink-0">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
          GTA - Tech
        </h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white focus:outline-none p-2 rounded hover:bg-slate-800"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar Overlay (Mobile Only) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar / Navbar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        bg-slate-900 text-white w-64 flex-shrink-0 flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              GTA - Tech
            </h1>
            <p className="text-sm text-slate-400 mt-1">{user.name}</p>
            <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300 mt-2 inline-block">
              {isAdmin ? 'ADMINISTRADOR' : 'VENDEDOR'}
            </span>
          </div>
          {/* Close button for mobile sidebar header */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {(isAdmin ? adminLinks : sellerLinks).map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)} // Close menu on click (mobile)
                  className="block px-4 py-3 rounded-lg transition-colors hover:bg-slate-800"
                  activeProps={{ className: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {/* Collapsible Landing Page Menu */}
            {isAdmin && (
              <li className="mt-4">
                <button
                  onClick={() => setLandingMenuOpen(!landingMenuOpen)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
                >
                  Gestão do Site
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${landingMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {landingMenuOpen && (
                  <ul className="mt-1 space-y-1 ml-2 border-l border-slate-700">
                    {landingLinks.map((link) => (
                      <li key={link.to}>
                        <Link
                          to={link.to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-2 text-sm rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800"
                          activeProps={{ className: "text-white bg-slate-800 font-medium" }}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <Button
            variant="danger"
            onClick={() => {
              logout();
              // Force navigation to login to avoid "Something went wrong"
              window.location.href = '#/login';
            }}
            className="w-full justify-center"
          >
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 h-full w-full relative">
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};