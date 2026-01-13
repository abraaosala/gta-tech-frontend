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
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row h-screen overflow-hidden">

      {/* Mobile Header */}
      <div className="lg:hidden bg-slate-900 text-white p-4 h-16 flex justify-between items-center shadow-md z-50 fixed top-0 left-0 right-0 w-full">
        <div className="flex items-center space-x-2">
          <img src="/logo.jpg" alt="GTA Tech" className="h-10 w-auto object-contain rounded-full" />
          <span className="font-bold text-lg hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">GTA Tech</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              logout();
              window.location.href = '#/login';
            }}
            className="text-white/80 hover:text-red-400 focus:outline-none p-2 rounded hover:bg-slate-800 transition-colors"
            title="Sair"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
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
      </div>

      {/* Sidebar Overlay (Mobile Only) - Adjusted for topbar */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden pt-16"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar / Navbar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        bg-slate-900 text-white flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out
        lg:w-64 lg:h-screen lg:translate-y-0 lg:opacity-100
        ${isMobileMenuOpen
          ? 'top-16 left-0 right-0 w-full h-auto max-h-[calc(100vh-4rem)] shadow-xl translate-y-0 opacity-100'
          : '-translate-y-full opacity-0 lg:translate-y-0 pointer-events-none lg:pointer-events-auto absolute lg:relative top-0'
        }
      `}>
        <div className="p-6 border-b border-slate-700 flex justify-between items-center hidden lg:flex">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <img src="/logo.jpg" alt="GTA Tech" className="h-12 w-auto object-contain rounded-lg shadow-sm" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">GTA Tech</span>
            </div>
            <p className="text-sm text-slate-400 mt-1">{user.name}</p>
            <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300 mt-2 inline-block">
              {isAdmin ? 'ADMINISTRADOR' : 'VENDEDOR'}
            </span>
          </div>
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

        <div className="p-4 border-t border-slate-700 hidden lg:block">
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
      <main className="flex-1 overflow-y-auto bg-gray-50 h-full w-full relative pt-16 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};