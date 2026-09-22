import React, { useState, useEffect } from 'react';
import { FileText, Send, Download, RefreshCw, CheckCircle2, DollarSign, AlertCircle, Info, CreditCard } from 'lucide-react';
import { Card, KPICard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { api } from '../services/api';
import { Invoice } from '../types';

export const MonthlyInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState({
    totalMonthlyDraft: 808000,
    paidAmount: 383000,
    pendingReceivables: 425000,
  });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentRef, setPaymentRef] = useState('');

  const fetchInvoices = () => {
    api.getInvoices('2026-02')
      .then((res) => {
        setInvoices(res.invoices);
        setSummary(res.summary);
        if (res.invoices.length > 0 && !selectedInvoice) {
          setSelectedInvoice(res.invoices[0]);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    try {
      await api.generateAllInvoices('2026-02', '2026-02-01', '2026-02-28');
      fetchInvoices();
    } catch (err) {
      alert('Error generating invoices');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenPaymentModal = (inv: Invoice) => {
    setPaymentInvoice(inv);
    setPaymentAmount(inv.totalAmount.toString());
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async () => {
    if (!paymentInvoice) return;
    try {
      await api.recordPayment(paymentInvoice.id, {
        amount: Number(paymentAmount),
        referenceNo: paymentRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      });
      setIsPaymentModalOpen(false);
      fetchInvoices();
    } catch (err) {
      alert('Error recording payment');
    }
  };

  const handleDownloadPDF = (invId: string) => {
    window.location.href = `/api/invoices/${invId}/pdf`;
  };

  const activeInv = selectedInvoice || (invoices.length > 0 ? invoices[0] : null);

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Title */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-brand-dark tracking-tight">
          Monthly Invoicing Ledger
        </h1>
        <p className="text-xs sm:text-sm font-medium text-gray-500">
          Consolidate logs and dispatch invoices to your contracted corporate offices
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Total Monthly Draft"
          value={`₹ ${(summary.totalMonthlyDraft / 100000).toFixed(2)} L`}
          icon={<FileText className="h-5 w-5 text-brand-red" />}
          className="border-l-4 border-l-brand-red"
        />
        <KPICard
          title="Paid Amount"
          value={`₹ ${(summary.paidAmount / 100000).toFixed(2)} L`}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          className="border-l-4 border-l-emerald-600"
        />
        <KPICard
          title="Pending Receivables"
          value={`₹ ${(summary.pendingReceivables / 100000).toFixed(2)} L`}
          icon={<AlertCircle className="h-5 w-5 text-brand-gold" />}
          className="border-l-4 border-l-brand-gold bg-amber-50/20"
        />
      </div>

      {/* Corporate Invoices List Table */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-brand-dark">Feb 2026 Corporate Invoices</h2>
            <p className="text-xs text-gray-500">Auto-calculated summary based on daily meal logs</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            isLoading={isGenerating}
            onClick={handleGenerateAll}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Generate All Invoices</span>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-extrabold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Invoice Number</th>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4 text-right">Consolidated Amount</th>
                <th className="py-3 px-4 text-center">Payment Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`hover:bg-amber-50/30 transition-colors cursor-pointer ${
                    activeInv?.id === inv.id ? 'bg-amber-50/60 font-semibold' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-brand-dark">{inv.invoiceNumber}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-800">{inv.company.name}</td>
                  <td className="py-3.5 px-4 text-right font-black text-gray-900">
                    ₹ {inv.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge status={inv.status} />
                  </td>
                  <td className="py-3.5 px-4 text-center space-x-2">
                    {inv.status !== 'PAID' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPaymentModal(inv);
                        }}
                        className="text-xs font-bold text-emerald-700 hover:underline"
                      >
                        Record Payment
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInvoice(inv);
                      }}
                      className="text-xs font-bold text-brand-red hover:underline"
                    >
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
          <Info className="h-5 w-5 text-amber-600 shrink-0" />
          <span>
            <strong>Notice on Automatic Invoicing:</strong> Generating invoices locks log entries for that billing cycle. Make sure all back-dates are completed and bulk validations are resolved prior to generation.
          </span>
        </div>
      </Card>

      {/* Tax Invoice Preview Section */}
      {activeInv && (
        <Card className="space-y-6 border-2 border-brand-red/20 shadow-md">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-lg font-black text-brand-dark">Monthly Invoice Preview</h2>
            <p className="text-xs text-gray-500 font-semibold">
              {activeInv.invoiceNumber} — Consolidated Tax Invoice for {activeInv.company.name}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Control Panel */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                  INVOICE STATUS
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-brand-dark">
                    ₹ {activeInv.totalAmount.toLocaleString('en-IN')}
                  </span>
                  <Badge status={activeInv.status} />
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  Draft locked on 25 Feb 2026. Regeneration will override custom manual adjustments.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2.5">
                <Button variant="primary" size="md" className="w-full">
                  <Send className="h-4 w-4" />
                  <span>Dispatch to Corporate</span>
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={() => handleDownloadPDF(activeInv.id)}
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF / Excel</span>
                </Button>

                <Button variant="outline" size="md" className="w-full">
                  <RefreshCw className="h-4 w-4" />
                  <span>Regenerate Draft</span>
                </Button>
              </div>

              {/* Audit Safeguard Alert */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium space-y-1">
                <span className="font-extrabold flex items-center gap-1.5 text-amber-800">
                  <AlertCircle className="h-4 w-4" /> Audit Safeguard Active
                </span>
                <p className="text-[11px]">
                  This invoice contains locked meal supply logs. Editing this invoice directly requires owner credentials.
                </p>
              </div>
            </div>

            {/* Right Tax Invoice Document Sheet */}
            <div className="lg:col-span-2 bg-white border border-gray-300 rounded-xl p-6 shadow-sm space-y-6">
              {/* Header Logo & Tax Title */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-200 pb-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-red to-brand-red-hover text-white font-black text-2xl shadow-md">
                    SK
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-brand-red leading-none">
                      Sri Karthikeya Deluxe Mess
                    </h3>
                    <p className="text-xs font-semibold text-gray-600">
                      Corporate Catering & Bulk Meal Supply
                    </p>
                    <p className="text-[11px] text-gray-500 font-mono">
                      GSTIN: 33AAAFS2491M1ZS
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <h2 className="text-xl font-black text-brand-dark tracking-wide">
                    TAX INVOICE
                  </h2>
                  <p className="text-xs font-bold text-gray-700">
                    Invoice No: #{activeInv.invoiceNumber}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    Date: 25 Feb 2026
                  </p>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 space-y-1">
                  <span className="font-extrabold text-gray-400 uppercase text-[10px]">BILL TO:</span>
                  <p className="font-extrabold text-gray-900 text-sm">{activeInv.company.name}</p>
                  <p className="text-gray-600">{activeInv.company.address || 'Siruseri IT Park, OMR, Chennai - 603103'}</p>
                  <p className="font-mono text-gray-700 font-bold">GSTIN: {activeInv.company.gstin}</p>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 space-y-1">
                  <span className="font-extrabold text-gray-400 uppercase text-[10px]">SUPPLIER DETAILS:</span>
                  <p className="font-extrabold text-gray-900 text-sm">Sri Karthikeya Deluxe Mess</p>
                  <p className="text-gray-600">No. 12, Kovilambakkam Main Road, Keelkattalai, Chennai - 600117</p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-gray-300 bg-gray-100 text-gray-700 font-extrabold uppercase">
                      <th className="py-2.5 px-3">Meal Type Category</th>
                      <th className="py-2.5 px-3 text-center">Total Qty Supplied</th>
                      <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                      <th className="py-2.5 px-3 text-right">Total Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-semibold">
                    {activeInv.items && activeInv.items.length > 0 ? (
                      activeInv.items.map((it) => (
                        <tr key={it.id}>
                          <td className="py-2.5 px-3 font-bold text-gray-900">{it.mealTypeName}</td>
                          <td className="py-2.5 px-3 text-center">{it.totalQuantity} Meals</td>
                          <td className="py-2.5 px-3 text-right">₹ {it.rate.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-extrabold text-gray-900">
                            ₹ {it.totalAmount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-gray-900">Veg Meal</td>
                          <td className="py-2.5 px-3 text-center">850 Meals</td>
                          <td className="py-2.5 px-3 text-right">₹ 80.00</td>
                          <td className="py-2.5 px-3 text-right font-extrabold text-gray-900">₹ 68,000.00</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-gray-900">Chicken Meal</td>
                          <td className="py-2.5 px-3 text-center">320 Meals</td>
                          <td className="py-2.5 px-3 text-right">₹ 120.00</td>
                          <td className="py-2.5 px-3 text-right font-extrabold text-gray-900">₹ 38,400.00</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-gray-900">Special Meals (Sweet/Snack)</td>
                          <td className="py-2.5 px-3 text-center">40 Meals</td>
                          <td className="py-2.5 px-3 text-right">₹ 150.00</td>
                          <td className="py-2.5 px-3 text-right font-extrabold text-gray-900">₹ 6,000.00</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals & Tax Calculation */}
              <div className="border-t-2 border-gray-300 pt-3 space-y-1.5 text-xs text-right font-semibold">
                <div className="flex justify-between sm:justify-end gap-8">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-bold text-gray-900">₹ {activeInv.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between sm:justify-end gap-8">
                  <span className="text-gray-600">CGST (2.5%):</span>
                  <span>₹ {activeInv.cgstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between sm:justify-end gap-8">
                  <span className="text-gray-600">SGST (2.5%):</span>
                  <span>₹ {activeInv.sgstAmount.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between sm:justify-end gap-8 border-t border-gray-200 pt-2 text-base font-black text-brand-red">
                  <span>Grand Total (Incl. Taxes):</span>
                  <span>₹ {activeInv.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Corporate Payment"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRecordPayment}>
              Confirm Payment
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Invoice Number</label>
            <input
              type="text"
              disabled
              value={paymentInvoice?.invoiceNumber || ''}
              className="w-full h-10 px-3 border border-gray-300 bg-gray-100 rounded-lg text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Amount Received (₹)</label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-brand-red"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Payment Reference / Transaction ID</label>
            <input
              type="text"
              placeholder="e.g. NEFT-9920194812"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-red"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
