import { ReactNode, useState } from 'react';
import { useLogout, useGetIdentity } from '@refinedev/core';
import { Link, useLocation } from 'react-router-dom';

interface SuperAdminLayoutProps {
  children: ReactNode;
}

export const SuperAdminLayout = ({ children }: SuperAdminLayoutProps) => {
  const { mutate: logout } = useLogout();
  const { data: identity } = useGetIdentity<{ email: string }>();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/super-admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/super-admin/gyms', label: 'Gimnasios', icon: '🏢' },
    { path: '/super-admin/invoices', label: 'Facturas', icon: '💰' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 lg:p-6 border-b flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-blue-600">GymApp</h1>
            <p className="text-xs lg:text-sm text-gray-500 mt-1">Super Admin</p>
          </div>
          <button
            onClick={closeMobileMenu}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <nav className="p-3 lg:p-4">
          <ul className="space-y-1 lg:space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg lg:text-xl">{item.icon}</span>
                  <span className="text-sm lg:text-base">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-8 py-3 lg:py-4">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="text-base lg:text-xl font-semibold text-gray-800">
                Panel Super Admin
              </h2>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-xs lg:text-sm font-medium text-gray-700 truncate max-w-[150px] lg:max-w-none">
                  {identity?.email}
                </p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>

              <button
                onClick={() => logout()}
                className="px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
