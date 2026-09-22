import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Calendar, FileText, Menu } from 'lucide-react';
import { clsx } from 'clsx';

export const BottomNav: React.FC<{ onOpenMore: () => void }> = ({ onOpenMore }) => {
  const mainMobileItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Daily Entry', path: '/daily-entry', icon: PlusCircle },
    { name: 'Bulk Entry', path: '/bulk-entry', icon: Calendar },
    { name: 'Invoices', path: '/invoices', icon: FileText },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around backdrop-blur-md">
      {mainMobileItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-bold transition-all min-w-[60px]',
                isActive ? 'text-brand-red font-extrabold' : 'text-gray-500 hover:text-gray-800'
              )
            }
          >
            <Icon className="h-5 w-5 mb-0.5" />
            <span>{item.name}</span>
          </NavLink>
        );
      })}

      <button
        onClick={onOpenMore}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-bold text-gray-500 hover:text-gray-800 min-w-[60px]"
      >
        <Menu className="h-5 w-5 mb-0.5" />
        <span>More</span>
      </button>
    </nav>
  );
};
