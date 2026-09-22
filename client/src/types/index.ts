export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: string;
}

export interface CompanyMealRate {
  id: string;
  companyId: string;
  mealTypeId: string;
  customPrice: number;
  mealType?: MealType;
}

export interface Company {
  id: string;
  name: string;
  gstin: string;
  address?: string;
  billingCycle: string;
  status: string;
  customRates?: CompanyMealRate[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MealType {
  id: string;
  code: string;
  name: string;
  ledgerCode: string;
  defaultPrice: number;
  status: string;
  displayOrder: number;
}

export interface SupplyItem {
  id: string;
  supplyLogId: string;
  mealTypeId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  mealType: MealType;
}

export interface SupplyLog {
  id: string;
  companyId: string;
  deliveryDate: string;
  status: 'DRAFT' | 'SUBMITTED';
  totalQuantity: number;
  totalAmount: number;
  notes?: string;
  company: Company;
  items: SupplyItem[];
}

export interface TodayStanding {
  companyId: string;
  companyName: string;
  veg: number;
  chicken: number;
  special: number;
  mutton: number;
  fish: number;
  prawns: number;
  totalMeals: number;
  totalBilling: number;
  status: 'Delivered' | 'Pending';
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  mealTypeId?: string;
  mealTypeName: string;
  totalQuantity: number;
  rate: number;
  totalAmount: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNo?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  companyId: string;
  monthPeriod: string;
  startDate: string;
  endDate: string;
  subtotal: number;
  cgstRate: number;
  sgstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  totalAmount: number;
  status: 'DRAFT' | 'UNPAID' | 'PAID' | 'CANCELLED';
  issuedDate: string;
  company: Company;
  items: InvoiceItem[];
  payments?: Payment[];
}

export interface AnalyticsData {
  metrics: {
    consolidatedSupply: number;
    accruedRevenue: number;
    averageRateIndex: number;
    activeCorporateAccounts: number;
    pendingInvoicesCount: number;
  };
  weeklyTrends: Array<{ week: string; supply: number }>;
  companyBreakdown: Array<{ name: string; qty: number; rev: number }>;
  mealCategoryTotals: Record<string, number>;
}
