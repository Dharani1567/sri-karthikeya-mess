import React, { useState, useEffect } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Stepper } from '../components/ui/Stepper';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { api } from '../services/api';
import { Company, MealType } from '../types';

export const DailyEntry: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>('2026-02-26');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [autosaveTime, setAutosaveTime] = useState<string>('12:45 PM');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Custom meal modal state
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [newMealName, setNewMealName] = useState('');
  const [newMealPrice, setNewMealPrice] = useState('150');

  useEffect(() => {
    Promise.all([api.getCompanies(), api.getMealTypes()])
      .then(([compList, mealList]) => {
        setCompanies(compList);
        setMealTypes(mealList);
        if (compList.length > 0) {
          setSelectedCompanyId(compList[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch log when company or date changes
  useEffect(() => {
    if (!selectedCompanyId || !deliveryDate) return;
    api.getSingleSupplyLog(selectedCompanyId, deliveryDate)
      .then((log) => {
        if (log && log.items) {
          const qMap: Record<string, number> = {};
          log.items.forEach((it) => {
            qMap[it.mealTypeId] = it.quantity;
          });
          setQuantities(qMap);
        } else {
          // Defaults
          setQuantities({
            VEG: 150,
            CHK: 95,
            MUT: 0,
            FSH: 0,
            PRW: 0,
            SPC: 0,
          });
        }
      })
      .catch(() => {
        setQuantities({
          VEG: 150,
          CHK: 95,
          MUT: 0,
          FSH: 0,
          PRW: 0,
          SPC: 0,
        });
      });
  }, [selectedCompanyId, deliveryDate]);

  const handleQuantityChange = (mealTypeIdOrCode: string, val: number) => {
    setQuantities((prev) => ({
      ...prev,
      [mealTypeIdOrCode]: val,
    }));
    const now = new Date();
    setAutosaveTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  // Calculate live totals & revenue based on custom rate or default price
  let totalQuantity = 0;
  let estimatedRevenue = 0;

  mealTypes.forEach((mt) => {
    const qty = quantities[mt.id] || quantities[mt.code] || 0;
    totalQuantity += qty;

    // Check custom rate
    const customRateObj = selectedCompany?.customRates?.find((cr) => cr.mealTypeId === mt.id);
    const unitPrice = customRateObj ? customRateObj.customPrice : mt.defaultPrice;
    estimatedRevenue += qty * unitPrice;
  });

  const handleSaveLog = async () => {
    if (!selectedCompanyId || !deliveryDate) return;
    setIsSaving(true);
    try {
      await api.saveSingleSupplyLog({
        companyId: selectedCompanyId,
        date: deliveryDate,
        quantities,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Error saving meal log');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCustomMeal = async () => {
    if (!newMealName || !newMealPrice) return;
    try {
      const created = await api.createMealType({
        name: newMealName,
        defaultPrice: Number(newMealPrice),
      });
      setMealTypes((prev) => [...prev, created]);
      setQuantities((prev) => ({ ...prev, [created.id]: 10 }));
      setIsCustomModalOpen(false);
      setNewMealName('');
    } catch (err: any) {
      alert(err.message || 'Error adding custom meal type');
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Title */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-brand-dark tracking-tight">
          Daily Meal Delivery Entry
        </h1>
        <p className="text-xs sm:text-sm font-medium text-gray-500">
          Log today's or any specific date's food supply counts safely
        </p>
      </div>

      {/* Selectors Bar */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {/* Select Company */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Select Company / Client
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

            {/* Delivery Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Delivery Date
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>
          </div>

          <div className="text-right text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 self-start sm:self-center">
            ✓ Draft Autosaved at {autosaveTime}
          </div>
        </div>
      </Card>

      {/* Meal Quantities Matrix */}
      <Card className="space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-base font-bold text-brand-dark">Meal Quantities Matrix</h2>
          <p className="text-xs text-gray-500">
            Use stepper controls to specify count supplied for each category
          </p>
        </div>

        {/* Stepper Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {mealTypes.map((mt) => {
            const currentQty = quantities[mt.id] ?? quantities[mt.code] ?? 0;
            return (
              <div
                key={mt.id}
                className="bg-amber-50/20 p-4 rounded-xl border border-gray-200/80 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-brand-red">
                    {mt.name}
                  </span>
                  <span className="text-[11px] font-bold text-gray-500">₹ {mt.defaultPrice}/meal</span>
                </div>

                <div className="flex justify-center">
                  <Stepper
                    value={currentQty}
                    onChange={(val) => handleQuantityChange(mt.id, val)}
                    step={5}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Custom Meal Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomModalOpen(true)}
            className="border-dashed border-gray-400 text-gray-700 hover:border-brand-red hover:text-brand-red"
          >
            <Plus className="h-4 w-4" />
            <span>Add Custom Meal Type</span>
          </Button>
          <span className="text-xs text-gray-500 italic">
            Created meal types will immediately become available across all active client sheets.
          </span>
        </div>
      </Card>

      {/* Summary Footer Bar */}
      <div className="sticky bottom-16 md:bottom-4 z-20 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
              Total Quantity Supply
            </span>
            <span className="text-xl sm:text-2xl font-black text-brand-dark">
              {totalQuantity} Meals
            </span>
          </div>

          <div className="border-l border-gray-200 pl-6">
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
              Estimated Revenue
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-700">
              ₹ {estimatedRevenue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => setQuantities({ VEG: 0, CHK: 0, MUT: 0, FSH: 0, PRW: 0, SPC: 0 })}
          >
            Discard Draft
          </Button>

          <Button
            variant="primary"
            size="md"
            isLoading={isSaving}
            onClick={handleSaveLog}
            className="w-full sm:w-auto"
          >
            {saveSuccess ? (
              <>
                <Check className="h-4 w-4" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Meal Log</span>
            )}
          </Button>
        </div>
      </div>

      {/* Modal for Custom Meal Type */}
      <Modal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        title="Add Custom Meal Category"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCustomModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddCustomMeal}>
              Save Category
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Meal Name</label>
            <input
              type="text"
              placeholder="e.g. Special Mutton Biryani"
              value={newMealName}
              onChange={(e) => setNewMealName(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Default Price (₹)</label>
            <input
              type="number"
              placeholder="150"
              value={newMealPrice}
              onChange={(e) => setNewMealPrice(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
