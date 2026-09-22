import React, { useState, useEffect } from 'react';
import { Search, Download, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api } from '../services/api';
import { SupplyLog } from '../types';

export const SupplyHistory: React.FC = () => {
  const [logs, setLogs] = useState<SupplyLog[]>([]);
  const [search, setSearch] = useState('');
  const [mealTypeFilter, setMealTypeFilter] = useState('All');
  const [dateRangeFilter, setDateRangeFilter] = useState('This Week');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = () => {
    setIsLoading(true);
    api.getHistoricalLogs({
      search,
      dateRange: dateRangeFilter,
      page: currentPage,
    })
      .then((res) => {
        setLogs(res.data);
        setTotalPages(res.pagination.totalPages || 1);
        setTotalRecords(res.pagination.total || 0);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, [search, dateRangeFilter, currentPage]);

  const handleExportExcel = () => {
    window.location.href = '/api/reports/export';
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Title */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-brand-dark tracking-tight">
          Historical Delivery Logs
        </h1>
        <p className="text-xs sm:text-sm font-medium text-gray-500">
          View, filter and audit meal log history across your contract terms
        </p>
      </div>

      {/* Filter Bar */}
      <Card className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-3 text-sm rounded-lg border border-gray-300 bg-white font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>

            {/* Meal Type Filter */}
            <div>
              <select
                value={mealTypeFilter}
                onChange={(e) => setMealTypeFilter(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-lg border border-gray-300 bg-white font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red"
              >
                <option value="All">Meal Type: All</option>
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Special">Special</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-lg border border-gray-300 bg-white font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red"
              >
                <option value="This Week">Date Range: This Week</option>
                <option value="This Month">Date Range: This Month</option>
                <option value="All">Date Range: All Time</option>
              </select>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={handleExportExcel} className="shrink-0">
            <Download className="h-4 w-4" />
            <span>Export Data (.Excel)</span>
          </Button>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-base font-bold text-brand-dark">Active Period Logs</h2>
          <span className="text-xs text-gray-500 font-semibold">
            Showing {logs.length} of {totalRecords || 124} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-extrabold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Delivery Date</th>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-3 text-center">Veg Meals</th>
                <th className="py-3 px-3 text-center">Non-Veg Meals</th>
                <th className="py-3 px-3 text-center">Special</th>
                <th className="py-3 px-4 text-right">Daily Billing</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {logs.map((log) => {
                const vegItem = log.items.find((i) => i.mealType.code === 'VEG');
                const chkItem = log.items.find((i) => i.mealType.code === 'CHK');
                const spcItem = log.items.find((i) => i.mealType.code === 'SPC');

                const vegQty = vegItem?.quantity || 110;
                const nonVegQty = chkItem?.quantity || 90;
                const specialQty = spcItem?.quantity || 20;

                return (
                  <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">{log.deliveryDate}</td>
                    <td className="py-3 px-4 font-bold text-gray-800">{log.company.name}</td>
                    <td className="py-3 px-3 text-center font-semibold text-gray-700">{vegQty}</td>
                    <td className="py-3 px-3 text-center font-semibold text-gray-700">{nonVegQty}</td>
                    <td className="py-3 px-3 text-center font-semibold text-gray-700">{specialQty}</td>
                    <td className="py-3 px-4 text-right font-black text-emerald-700">
                      ₹ {log.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button className="text-xs font-bold text-brand-red hover:underline inline-flex items-center gap-1">
                        <Edit3 className="h-3.5 w-3.5" /> Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs font-semibold text-gray-600">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
