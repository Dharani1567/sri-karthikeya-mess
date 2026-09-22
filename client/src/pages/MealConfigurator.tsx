import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Info, Check } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { api } from '../services/api';
import { MealType } from '../types';

export const MealConfigurator: React.FC = () => {
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [mealName, setMealName] = useState('');
  const [ledgerCode, setLedgerCode] = useState('');
  const [defaultPrice, setDefaultPrice] = useState('180');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMealTypes = () => {
    api.getMealTypes()
      .then((res) => setMealTypes(res))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchMealTypes();
  }, []);

  const handlePublishMeal = async () => {
    if (!mealName || !defaultPrice) return;
    setIsSubmitting(true);
    try {
      await api.createMealType({
        name: mealName,
        ledgerCode,
        defaultPrice: Number(defaultPrice),
      });
      fetchMealTypes();
      setIsModalOpen(false);
      setMealName('');
      setLedgerCode('');
    } catch (err: any) {
      alert(err.message || 'Error publishing meal type');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Title */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-brand-dark tracking-tight">
          Catering Meal Configurator
        </h1>
        <p className="text-xs sm:text-sm font-medium text-gray-500">
          Manage dynamically extensible meal types, default supply rates & availability thresholds
        </p>
      </div>

      {/* Dynamic Extensible Schema Alert */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs sm:text-sm font-medium">
        <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <span>
          Sri Karthikeya Deluxe Mess runs on a <strong>dynamically extensible schema</strong>. Any new meal category added below automatically creates new entries in daily logs, spreadsheet panels, and billing ledgers without code releases.
        </span>
      </div>

      {/* Main Grid: Extensible Master List + Form Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Master Meal Grid */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-brand-dark">Extensible Master Meal List</h2>
              <p className="text-xs text-gray-500">Active meal categories available across all client logs</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4" />
              <span>Add Custom Meal Type</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mealTypes.map((mt) => (
              <div
                key={mt.id}
                className="p-4 rounded-xl border border-gray-200 bg-white hover:border-brand-gold/50 shadow-xs transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-brand-red bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {mt.ledgerCode || mt.code}
                    </span>
                    <Badge status={mt.status} />
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-gray-900">{mt.name}</h3>
                  <p className="text-xs text-gray-500 font-semibold">
                    Default: ₹ {mt.defaultPrice} / meal
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 text-xs font-bold">
                  <button className="text-brand-red hover:underline">Configure Rate</button>
                  <button className="text-gray-500 hover:text-gray-800 flex items-center gap-1">
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Configure Meal Item Side Panel Form */}
        <Card className="space-y-4 border-2 border-brand-red/10">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-brand-dark">Configure Meal Item</h2>
            <p className="text-xs text-gray-500">Define master pricing and ledger code</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Meal Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Mutton Biryani Deluxe"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Ledger System Code (3 Letters)
              </label>
              <input
                type="text"
                maxLength={3}
                placeholder="e.g. MBD"
                value={ledgerCode}
                onChange={(e) => setLedgerCode(e.target.value.toUpperCase())}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Default Contract Price (₹) *
              </label>
              <input
                type="number"
                placeholder="180"
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>

            <p className="text-[11px] text-gray-500 italic">
              Will be populated across bulk sheets starting tomorrow.
            </p>

            <Button
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              onClick={handlePublishMeal}
              className="w-full"
            >
              Publish Meal Type
            </Button>
          </div>
        </Card>
      </div>

      {/* Modal dialog for mobile */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Custom Meal Type"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handlePublishMeal}>
              Publish Meal Type
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Meal Name</label>
            <input
              type="text"
              placeholder="e.g. Mutton Biryani Deluxe"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Default Contract Price (₹)</label>
            <input
              type="number"
              value={defaultPrice}
              onChange={(e) => setDefaultPrice(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
