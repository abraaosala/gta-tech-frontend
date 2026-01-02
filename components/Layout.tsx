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
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar / Navbar */}
      <aside className="bg-slate-900 text-white w-full md:w-64 flex-shrink-0 flex flex-col transition-all duration-300">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            GTA - Tech
          </h1>
          <p className="text-sm text-slate-400 mt-1">{user.name}</p>
          <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300 mt-2 inline-block">
            {isAdmin ? 'ADMINISTRADOR' : 'VENDEDOR'}
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {(isAdmin ? adminLinks : sellerLinks).map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
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
          <Button variant="danger" onClick={logout} className="w-full justify-center">
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};