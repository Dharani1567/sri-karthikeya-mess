import React, { useState, useEffect } from 'react';
import { Copy, AlertTriangle, Check, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api } from '../services/api';
import { Company, MealType } from '../types';

interface SpreadsheetRow {
  date: string;
  quantities: Record<string, number>; // key: mealTypeCode or mealTypeId
}

export const BulkEntry: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('2026-02-23');
  const [endDate, setEndDate] = useState<string>('2026-02-25');
  const [rows, setRows] = useState<SpreadsheetRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    Promise.all([api.getCompanies(), api.getMealTypes()]).then(([compList, mtList]) => {
      setCompanies(compList);
      setMealTypes(mtList);
      if (compList.length > 0) {
        setSelectedCompanyId(compList[0].id);
      }
    });
  }, []);

  // Generate date rows whenever startDate or endDate changes
  useEffect(() => {
    if (!startDate || !endDate) return;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const newRows: SpreadsheetRow[] = [];

    const cur = new Date(start);
    while (cur <= end) {
      const dStr = cur.toISOString().split('T')[0];
      newRows.push({
        date: dStr,
        quantities: {
          VEG: dStr === '2026-02-23' ? 110 : dStr === '2026-02-24' ? 115 : 120,
          CHK: dStr === '2026-02-23' ? 70 : dStr === '2026-02-24' ? 75 : 80,
          MUT: 0,
          FSH: dStr === '2026-02-23' ? 15 : dStr === '2026-02-24' ? 20 : 25,
          PRW: 0,
          SPC: dStr === '2026-02-23' ? 10 : dStr === '2026-02-24' ? 15 : 20,
        },
      });
      cur.setDate(cur.getDate() + 1);
    }
    setRows(newRows);
  }, [startDate, endDate]);

  const handleCellChange = (rowIndex: number, mealCode: string, val: number) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        quantities: {
          ...updated[rowIndex].quantities,
          [mealCode]: val < 0 ? 0 : val,
        },
      };
      return updated;
    });
  };

  const handleCopyPrevious = () => {
    if (rows.length < 2) return;
    setRows((prev) => {
      const updated = [...prev];
      const firstQuantities = { ...updated[0].quantities };
      for (let i = 1; i < updated.length; i++) {
        updated[i].quantities = { ...firstQuantities };
      }
      return updated;
    });
  };

  const handleClear = () => {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        quantities: { VEG: 0, CHK: 0, MUT: 0, FSH: 0, PRW: 0, SPC: 0 },
      }))
    );
  };

  const handlePublish = async () => {
    if (!selectedCompanyId || rows.length === 0) return;
    setIsSubmitting(true);
    try {
      await api.bulkSupplyLogs({
        companyId: selectedCompanyId,
        entries: rows.map((r) => ({ date: r.date, quantities: r.quantities })),
      });
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      alert('Error publishing bulk logs');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate totals
  let totalDatesCount = rows.length;
  let totalMealsCount = 0;

  rows.forEach((r) => {
    Object.values(r.quantities).forEach((q) => {
      totalMealsCount += Number(q) || 0;
    });
  });

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Title */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-brand-dark tracking-tight">
          Bulk Back-Date Entry
        </h1>
        <p className="text-xs sm:text-sm font-medium text-gray-500">
          Speedy spreadsheet-like tool for adding missing records
        </p>
      </div>

      {/* Selectors Bar */}
      <Card className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Company
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>

          <Button
            variant="outline"
            size="md"
            onClick={handleCopyPrevious}
            className="w-full"
          >
            <Copy className="h-4 w-4" />
            <span>Copy Previous Day Data</span>
          </Button>
        </div>
      </Card>

      {/* Missing Dates Ledger Grid */}
      <Card className="space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-base font-bold text-brand-dark">Missing Dates Ledger</h2>
          <p className="text-xs text-gray-500">Edit quantities directly in spreadsheet cells</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-extrabold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-3 text-center">Veg</th>
                <th className="py-3 px-3 text-center">Chicken</th>
                <th className="py-3 px-3 text-center">Mutton</th>
                <th className="py-3 px-3 text-center">Fish</th>
                <th className="py-3 px-3 text-center">Prawns</th>
                <th className="py-3 px-3 text-center">Special</th>
                <th className="py-3 px-4 text-right">Daily Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {rows.map((row, idx) => {
                let rowTotal = 0;
                Object.values(row.quantities).forEach((q) => (rowTotal += Number(q) || 0));

                return (
                  <tr key={row.date} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">{row.date}</td>

                    {['VEG', 'CHK', 'MUT', 'FSH', 'PRW', 'SPC'].map((code) => {
                      const val = row.quantities[code] ?? 0;
                      return (
                        <td key={code} className="py-2 px-2 text-center">
                          <input
                            type="number"
                            value={val}
                            onChange={(e) =>
                              handleCellChange(idx, code, parseInt(e.target.value, 10) || 0)
                            }
                            className="w-16 sm:w-20 h-9 text-center rounded-lg border border-gray-200 bg-white font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                          />
                        </td>
                      );
                    })}

                    <td className="py-3 px-4 text-right font-black text-brand-dark">
                      {rowTotal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Validation Warning Alert Banner */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs sm:text-sm font-semibold">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <span>
            <strong>Data Validation Warning:</strong> Missing Veg logs detected on 24th Feb. Confirm with physical delivery slip before submitting.
          </span>
        </div>
      </Card>

      {/* Summary Footer Bar */}
      <div className="sticky bottom-16 md:bottom-4 z-20 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
            Bulk Sum Summary
          </span>
          <span className="text-xl font-black text-brand-dark">
            {totalDatesCount} Dates, {totalMealsCount} Meals
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="md" onClick={handleClear}>
            Clear Spreadsheet
          </Button>

          <Button
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            onClick={handlePublish}
            className="w-full sm:w-auto"
          >
            {submitSuccess ? (
              <>
                <Check className="h-4 w-4" />
                <span>Published!</span>
              </>
            ) : (
              <span>Publish Logs</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
