import React, { useState, useEffect } from 'react';
import { Search, Plus, Building2, AlertTriangle, Check, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { api } from '../services/api';
import { Company } from '../types';

export const CorporatePartners: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete modal state
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');
  const [billingCycle, setBillingCycle] = useState('Monthly (Consolidated)');
  const [vegRate, setVegRate] = useState('80');
  const [chickenRate, setChickenRate] = useState('120');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCompanies = () => {
    api.getCompanies()
      .then((res) => setCompanies(res))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSavePartner = async () => {
    if (!companyName || !gstin) return;
    setIsSubmitting(true);
    try {
      await api.createCompany({
        name: companyName,
        gstin,
        address,
        billingCycle,
      });
      fetchCompanies();
      setIsModalOpen(false);
      setCompanyName('');
      setGstin('');
    } catch (err: any) {
      alert(err.message || 'Error saving corporate partner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!deletingCompany) return;
    setIsDeleting(true);
    try {
      await api.deleteCompany(deletingCompany.id);
      fetchCompanies();
      setDeletingCompany(null);
    } catch (err: any) {
      alert(err.message || 'Error deleting company');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.gstin.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Title */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-brand-dark tracking-tight">
          Corporate Partners Directory
        </h1>
        <p className="text-xs sm:text-sm font-medium text-gray-500">
          Manage active companies, contract rate details, and billing defaults
        </p>
      </div>

      {/* Main Grid: Directory + Add Form Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Directory List */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search company partners, contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-3 text-sm rounded-lg border border-gray-300 bg-white font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>New Client</span>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-extrabold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Company & GSTIN</th>
                  <th className="py-3 px-3">Default Cycle</th>
                  <th className="py-3 px-3">Default Rates</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="font-extrabold text-gray-900 text-sm">{c.name}</div>
                      <div className="text-[11px] font-mono text-gray-400">GSTIN: {c.gstin}</div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-gray-700">{c.billingCycle}</td>
                    <td className="py-3.5 px-3 font-bold text-gray-800">
                      Veg: ₹80 | Non-Veg: ₹120
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <Badge status={c.status} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setDeletingCompany(c)}
                        title="Remove Company"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-red hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Add Corporate Partner Side Form Panel */}
        <Card className="space-y-4 border-2 border-brand-red/10">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-brand-dark">Add New Corporate Partner</h2>
            <p className="text-xs text-gray-500">Define commercial details and custom catering matrix</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Cognizant OMR"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                GSTIN Number *
              </label>
              <input
                type="text"
                placeholder="e.g. 33AACC3849J1Z1"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Billing Cycle
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-red"
              >
                <option value="Monthly (Consolidated)">Monthly (Consolidated)</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Contractual Meal Rates (₹)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400">VEG RATE</span>
                  <input
                    type="number"
                    value={vegRate}
                    onChange={(e) => setVegRate(e.target.value)}
                    className="w-full h-9 px-3 border border-gray-300 rounded-lg text-sm font-bold text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400">CHICKEN RATE</span>
                  <input
                    type="number"
                    value={chickenRate}
                    onChange={(e) => setChickenRate(e.target.value)}
                    className="w-full h-9 px-3 border border-gray-300 rounded-lg text-sm font-bold text-center"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Company name conflicts with existing archived draft contract. Confirm override.</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button variant="outline" size="md" className="w-1/2">
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                onClick={handleSavePartner}
                className="w-1/2"
              >
                Save Partner
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingCompany)}
        onClose={() => setDeletingCompany(null)}
        title="Delete Corporate Partner"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeletingCompany(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              isLoading={isDeleting}
              onClick={handleDeleteCompany}
            >
              Delete Partner
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-800">
            Are you sure you want to remove <strong className="text-brand-dark">{deletingCompany?.name}</strong>?
          </p>
          <p className="text-xs text-gray-500">
            Deleting this corporate partner will permanently remove its contractual rates, daily logs, and associated invoice records.
          </p>
        </div>
      </Modal>

      {/* Modal fallback for mobile add */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Corporate Partner"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSavePartner}>
              Save Partner
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              placeholder="e.g. Cognizant OMR"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">GSTIN Number</label>
            <input
              type="text"
              placeholder="e.g. 33AACC3849J1Z1"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm font-mono"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
