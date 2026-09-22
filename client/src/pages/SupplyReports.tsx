import React, { useState, useEffect } from 'react';
import { Download, BarChart2, TrendingUp, DollarSign, Building, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, KPICard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api } from '../services/api';
import { AnalyticsData, Company } from '../types';

export const SupplyReports: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedPartner, setSelectedPartner] = useState('all');
  const [selectedRange, setSelectedRange] = useState('Last 30 Days');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCompanies(), api.getAnalytics(selectedPartner)])
      .then(([compList, analyticsData]) => {
        setCompanies(compList);
        setAnalytics(analyticsData);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [selectedPartner]);

  const handleExport = () => {
    window.location.href = '/api/reports/export';
  };

  const metrics = analytics?.metrics || {
    consolidatedSupply: 34820,
    accruedRevenue: 3135000,
    averageRateIndex: 90.03,
    activeCorporateAccounts: 8,
    pendingInvoicesCount: 0,
  };

  const weeklyTrends = analytics?.weeklyTrends || [
    { week: 'W1', supply: 7200 },
    { week: 'W2', supply: 9800 },
    { week: 'W3', supply: 8400 },
    { week: 'W4', supply: 9420 },
  ];

  const maxSupply = Math.max(...weeklyTrends.map((w) => w.supply), 10000);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Title */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-brand-dark tracking-tight">
          Supply Analytics & Reports
        </h1>
        <p className="text-xs sm:text-sm font-medium text-gray-500">
          Consolidated metrics of business growth, contract delivery rates, and food mix indices
        </p>
      </div>

      {/* Filter Toolbar */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {/* Contract Partner Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Contract Partner
              </label>
              <select
                value={selectedPartner}
                onChange={(e) => setSelectedPartner(e.target.value)}
                className="w-full h-10 px-3 text-sm font-bold rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red"
              >
                <option value="all">Contract Partner: All Active</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Supply Range Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Supply Range
              </label>
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value)}
                className="w-full h-10 px-3 text-sm font-bold rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red"
              >
                <option value="Last 30 Days">Supply Range: Last 30 Days</option>
                <option value="Last 7 Days">Supply Range: Last 7 Days</option>
                <option value="This Month">Supply Range: This Month</option>
              </select>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={handleExport} className="shrink-0 self-end sm:self-center">
            <Download className="h-4 w-4" />
            <span>Export Excel / CSV</span>
          </Button>
        </div>
      </Card>

      {/* Analytics KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Consolidated Supply"
          value={metrics.consolidatedSupply.toLocaleString('en-IN')}
          trend="+8.4% MoM Growth"
          icon={<BarChart2 className="h-5 w-5 text-brand-red" />}
          className="border-l-4 border-l-brand-red"
        />

        <KPICard
          title="Accrued Revenue"
          value={`₹ ${(metrics.accruedRevenue / 100000).toFixed(2)} L`}
          subtitle="SGST / CGST Included"
          icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
          className="border-l-4 border-l-emerald-600"
        />

        <KPICard
          title="Average Rate Index"
          value={`₹ ${metrics.averageRateIndex}`}
          subtitle="Veg/Non-Veg combined"
          icon={<TrendingUp className="h-5 w-5 text-brand-gold" />}
          className="border-l-4 border-l-brand-gold"
        />

        <KPICard
          title="Corporate Accounts"
          value={`${metrics.activeCorporateAccounts} Active`}
          subtitle={`${metrics.pendingInvoicesCount} Pending Invoices`}
          icon={<Building className="h-5 w-5 text-brand-dark" />}
          className="border-l-4 border-l-brand-dark"
        />
      </div>

      {/* Charts & No Filter Conflict Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Meal Supply Trends Bar Chart Visualizer */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-brand-dark">Weekly Meal Supply Trends</h2>
            <p className="text-xs text-gray-500">Aggregate volume distribution across weeks</p>
          </div>

          <div className="h-56 flex items-end justify-around gap-4 pt-8 px-4 border-b border-gray-100 pb-4">
            {weeklyTrends.map((t, i) => {
              const heightPct = Math.round((t.supply / maxSupply) * 100);
              return (
                <div key={i} className="flex flex-col items-center flex-1 h-full justify-end gap-2 group">
                  <span className="text-[11px] font-extrabold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.supply.toLocaleString()}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[48px] bg-brand-red rounded-t-lg transition-all group-hover:bg-brand-red-hover shadow-sm"
                  />
                  <span className="text-xs font-bold text-gray-600 uppercase">{t.week}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* No Custom Filter Conflict Callout */}
        <Card className="flex flex-col items-center justify-center text-center p-6 space-y-4 bg-amber-50/30 border border-amber-200">
          <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <AlertCircle className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-gray-900">No Custom Filter Conflict</h3>
            <p className="text-xs text-gray-500 max-w-xs">
              Zero metrics overlap detected for custom range filters. Try selecting a wider timeframe or adding data logs in Bulk Entry first.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedPartner('all');
              setSelectedRange('Last 30 Days');
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Time Filter</span>
          </Button>
        </Card>
      </div>
    </div>
  );
};
