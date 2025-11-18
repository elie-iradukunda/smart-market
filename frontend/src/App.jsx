import React from 'react';
import { BrowserRouter, NavLink, useRoutes } from 'react-router-dom';
import { routes } from './router/routes';

function AppRoutes() {
  const element = useRoutes(routes);
  return element;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">TOP Design</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                Intelligent Business Platform
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <NavLink
                to="/dashboard/admin"
                className={({ isActive }) =>
                  `px-2 py-1 rounded ${
                    isActive ? 'text-indigo-700 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                Admin
              </NavLink>
              <NavLink
                to="/dashboard/reception"
                className={({ isActive }) =>
                  `px-2 py-1 rounded ${
                    isActive ? 'text-indigo-700 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                Reception
              </NavLink>
              <NavLink
                to="/dashboard/accountant"
                className={({ isActive }) =>
                  `px-2 py-1 rounded ${
                    isActive ? 'text-indigo-700 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                Accountant
              </NavLink>
              <NavLink
                to="/dashboard/marketing"
                className={({ isActive }) =>
                  `px-2 py-1 rounded ${
                    isActive ? 'text-indigo-700 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                Marketing
              </NavLink>
              <NavLink
                to="/dashboard/technician"
                className={({ isActive }) =>
                  `px-2 py-1 rounded ${
                    isActive ? 'text-indigo-700 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                Technician
              </NavLink>
              <NavLink
                to="/dashboard/controller"
                className={({ isActive }) =>
                  `px-2 py-1 rounded ${
                    isActive ? 'text-indigo-700 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                Controller
              </NavLink>
            </nav>
          </div>
          <div className="bg-gray-50 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap gap-3 text-xs">
              <NavLink
                to="/crm/leads"
                className={({ isActive }) =>
                  `px-2 py-1 rounded border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                  }`
                }
              >
                CRM
              </NavLink>
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `px-2 py-1 rounded border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                  }`
                }
              >
                Orders
              </NavLink>
              <NavLink
                to="/production/work-orders"
                className={({ isActive }) =>
                  `px-2 py-1 rounded border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                  }`
                }
              >
                Production
              </NavLink>
              <NavLink
                to="/inventory/materials"
                className={({ isActive }) =>
                  `px-2 py-1 rounded border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                  }`
                }
              >
                Inventory
              </NavLink>
              <NavLink
                to="/pos/terminal"
                className={({ isActive }) =>
                  `px-2 py-1 rounded border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                  }`
                }
              >
                POS
              </NavLink>
              <NavLink
                to="/finance/invoices"
                className={({ isActive }) =>
                  `px-2 py-1 rounded border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                  }`
                }
              >
                Finance
              </NavLink>
              <NavLink
                to="/marketing/campaigns"
                className={({ isActive }) =>
                  `px-2 py-1 rounded border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                  }`
                }
              >
                Marketing
              </NavLink>
              <NavLink
                to="/communications/inbox"
                className={({ isActive }) =>
                  `px-2 py-1 rounded border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                  }`
                }
              >
                Communications
              </NavLink>
              <NavLink
                to="/ai/overview"
                className={({ isActive }) =>
                  `px-2 py-1 rounded border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                  }`
                }
              >
                AI
              </NavLink>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `px-2 py-1 rounded border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                  }`
                }
              >
                Admin
              </NavLink>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <AppRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}
