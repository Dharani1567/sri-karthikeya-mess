import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Sidebar, navItems } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { Modal } from './components/ui/Modal';

import { Dashboard } from './pages/Dashboard';
import { DailyEntry } from './pages/DailyEntry';
import { BulkEntry } from './pages/BulkEntry';
import { SupplyHistory } from './pages/SupplyHistory';
import { MonthlyInvoices } from './pages/MonthlyInvoices';
import { CorporatePartners } from './pages/CorporatePartners';
import { MealConfigurator } from './pages/MealConfigurator';
import { SupplyReports } from './pages/SupplyReports';
import { Login } from './pages/Login';

const queryClient = new QueryClient();

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF5]">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      <BottomNav onOpenMore={() => setIsMobileMenuOpen(true)} />

      {/* Mobile Slide-Out Drawer / Modal */}
      <Modal
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Navigation Menu"
        maxWidth="sm"
      >
        <div className="space-y-1 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    isActive
                      ? 'bg-rose-50 text-brand-red border border-rose-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Icon className="h-5 w-5 text-brand-red" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/daily-entry" element={<DailyEntry />} />
                    <Route path="/bulk-entry" element={<BulkEntry />} />
                    <Route path="/history" element={<SupplyHistory />} />
                    <Route path="/invoices" element={<MonthlyInvoices />} />
                    <Route path="/companies" element={<CorporatePartners />} />
                    <Route path="/meals" element={<MealConfigurator />} />
                    <Route path="/reports" element={<SupplyReports />} />
                  </Routes>
                </MainLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
