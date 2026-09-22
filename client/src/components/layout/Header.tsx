import React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const formattedDate = '26 Feb 2026';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200/80 bg-white/95 px-4 sm:px-8 backdrop-blur-md">
      {/* Brand Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-red to-brand-red-hover shadow-md text-white font-black text-xl">
          SK
        </div>
        <div>
          <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-brand-red leading-none">
            Sri Karthikeya
          </h1>
          <p className="text-[10px] sm:text-xs font-semibold text-gray-500 tracking-wider">
            DELUXE MESS
          </p>
        </div>
      </div>

      {/* Right Toolbar / Connection Status & Date */}
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Connected
        </div>

        <div className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
          Today: <span className="font-bold text-gray-900">{formattedDate}</span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-gray-800">{user?.name || 'Mess Owner'}</span>
            <span className="text-[10px] font-medium text-gray-500 uppercase">{user?.role || 'ADMIN'}</span>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-brand-red transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
