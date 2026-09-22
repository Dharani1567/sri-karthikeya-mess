import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Calendar,
  History,
  FileText,
  Building2,
  Utensils,
  BarChart3,
} from 'lucide-react';
import { clsx } from 'clsx';

export const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Daily Meal Entry', path: '/daily-entry', icon: PlusCircle },
  { name: 'Bulk Date Entry', path: '/bulk-entry', icon: Calendar },
  { name: 'Supply History', path: '/history', icon: History },
  { name: 'Monthly Invoices', path: '/invoices', icon: FileText },
  { name: 'Corporate Partners', path: '/companies', icon: Building2 },
  { name: 'Meal Configurator', path: '/meals', icon: Utensils },
  { name: 'Supply Analytics', path: '/reports', icon: BarChart3 },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-gray-200/80 bg-white min-h-[calc(100vh-4rem)] p-4 space-y-2 shrink-0">
      <div className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
        Navigation Menu
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all',
                  isActive
                    ? 'bg-rose-50 text-brand-red shadow-xs border border-rose-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
