import { Company, MealType, SupplyLog, TodayStanding, Invoice, AnalyticsData } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('mess_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth
  login: async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },

  // Companies
  getCompanies: async (): Promise<Company[]> => {
    const res = await fetch(`${API_BASE}/companies`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch companies');
    return res.json();
  },

  createCompany: async (data: Partial<Company> & { rates?: any[] }): Promise<Company> => {
    const res = await fetch(`${API_BASE}/companies`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create partner');
    }
    return res.json();
  },

  updateCompany: async (id: string, data: Partial<Company> & { rates?: any[] }): Promise<Company> => {
    const res = await fetch(`${API_BASE}/companies/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update partner');
    return res.json();
  },

  deleteCompany: async (id: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/companies/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete partner');
    return res.json();
  },

  // Meal Types
  getMealTypes: async (): Promise<MealType[]> => {
    const res = await fetch(`${API_BASE}/meal-types`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch meal types');
    return res.json();
  },

  createMealType: async (data: { name: string; defaultPrice: number; ledgerCode?: string; code?: string }): Promise<MealType> => {
    const res = await fetch(`${API_BASE}/meal-types`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create meal type');
    }
    return res.json();
  },

  updateMealType: async (id: string, data: Partial<MealType>): Promise<MealType> => {
    const res = await fetch(`${API_BASE}/meal-types/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update meal type');
    return res.json();
  },

  // Daily & Bulk Supply Logs
  getTodayStandings: async (date?: string): Promise<{ date: string; allDispatched: boolean; standings: TodayStanding[] }> => {
    const query = date ? `?date=${date}` : '';
    const res = await fetch(`${API_BASE}/supply-logs/today-standings${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch standings');
    return res.json();
  },

  getSingleSupplyLog: async (companyId: string, date: string): Promise<SupplyLog | null> => {
    const res = await fetch(`${API_BASE}/supply-logs/single?companyId=${companyId}&date=${date}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch single log');
    return res.json();
  },

  saveSingleSupplyLog: async (data: { companyId: string; date: string; quantities: Record<string, number>; notes?: string }) => {
    const res = await fetch(`${API_BASE}/supply-logs/single`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save meal log');
    return res.json();
  },

  bulkSupplyLogs: async (data: { companyId: string; entries: Array<{ date: string; quantities: Record<string, number> }> }) => {
    const res = await fetch(`${API_BASE}/supply-logs/bulk`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit bulk logs');
    return res.json();
  },

  getHistoricalLogs: async (params: { companyId?: string; dateRange?: string; search?: string; page?: number }): Promise<{ data: SupplyLog[]; pagination: any }> => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/supply-logs?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  getUnsubmittedDates: async (companyId: string, startDate: string, endDate: string) => {
    const res = await fetch(`${API_BASE}/supply-logs/unsubmitted-dates?companyId=${companyId}&startDate=${startDate}&endDate=${endDate}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to check unsubmitted dates');
    return res.json();
  },

  // Monthly Invoices
  getInvoices: async (monthPeriod: string = '2026-02'): Promise<{ summary: any; invoices: Invoice[] }> => {
    const res = await fetch(`${API_BASE}/invoices?monthPeriod=${monthPeriod}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch invoices');
    return res.json();
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    const res = await fetch(`${API_BASE}/invoices/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch invoice');
    return res.json();
  },

  generateAllInvoices: async (monthPeriod: string, startDate: string, endDate: string) => {
    const res = await fetch(`${API_BASE}/invoices/generate-all`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ monthPeriod, startDate, endDate }),
    });
    if (!res.ok) throw new Error('Failed to generate invoices');
    return res.json();
  },

  recordPayment: async (id: string, paymentData: { amount?: number; paymentDate?: string; paymentMethod?: string; referenceNo?: string }) => {
    const res = await fetch(`${API_BASE}/invoices/${id}/payment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paymentData),
    });
    if (!res.ok) throw new Error('Failed to record payment');
    return res.json();
  },

  // Reports
  getAnalytics: async (companyId: string = 'all'): Promise<AnalyticsData> => {
    const res = await fetch(`${API_BASE}/reports/analytics?companyId=${companyId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },
};
