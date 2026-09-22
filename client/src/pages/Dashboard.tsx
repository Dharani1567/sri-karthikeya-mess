import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Calendar, FileText, Building2, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { KPICard, Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { api } from '../services/api';
import { TodayStanding } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [standings, setStandings] = useState<TodayStanding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getTodayStandings('2026-02-26')
      .then((res) => {
        setStandings(res.standings);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const totalMealsToday = standings.reduce((acc, s) => acc + s.totalMeals, 0) || 1465;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner / Quick Operations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-dark tracking-tight">Dashboard Overview</h1>
          <p className="text-xs sm:text-sm font-medium text-gray-500">
            Sri Karthikeya Deluxe Mess meal distribution and billing health tracker
          </p>
        </div>

        {/* Quick Operations Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/daily-entry')}
            className="shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Enter Today's Meals</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/bulk-entry')}
          >
            <Calendar className="h-4 w-4" />
            <span>Bulk Entry Mode</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/invoices')}
          >
            <FileText className="h-4 w-4" />
            <span>Create New Invoice</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <KPICard
          title="Today's Meal Supply"
          value={totalMealsToday.toLocaleString('en-IN')}
          trend="+12% vs last Thursday"
          icon={<PlusCircle className="h-5 w-5 text-brand-red" />}
          className="border-l-4 border-l-brand-red"
        />

        <KPICard
          title="Companies Served"
          value="8"
          subtitle="Active corporate contracts"
          icon={<Building2 className="h-5 w-5 text-brand-gold" />}
          className="border-l-4 border-l-brand-gold"
        />

        <KPICard
          title="Unsubmitted Days"
          value="3 Days"
          subtitle="Requires bulk entry attention"
          icon={<Clock className="h-5 w-5 text-brand-orange" />}
          className="border-l-4 border-l-brand-orange bg-amber-50/20"
        />

        <KPICard
          title="Monthly Billing Draft"
          value="₹ 4.85 L"
          subtitle="Collected: ₹ 3.20 L"
          icon={<TrendingUp className="h-5 w-5 text-emerald-700" />}
          className="border-l-4 border-l-emerald-600"
        />
      </div>

      {/* Main Grid: Today's Standings + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Supply Standings Table */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-brand-dark">Today's Supply Standings</h2>
              <p className="text-xs text-gray-500">Live breakdown by meal category per company</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              All 8 Dispatched
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-gray-600 font-extrabold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3 text-center">Veg</th>
                  <th className="py-2.5 px-3 text-center">Chicken</th>
                  <th className="py-2.5 px-3 text-center">Special</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {standings.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-gray-900">{item.companyName}</td>
                    <td className="py-3 px-3 text-center text-gray-800">{item.veg}</td>
                    <td className="py-3 px-3 text-center text-gray-800">{item.chicken}</td>
                    <td className="py-3 px-3 text-center text-gray-800">{item.special}</td>
                    <td className="py-3 px-3 text-right">
                      <Badge status={item.status === 'Delivered' ? 'DELIVERED' : 'PENDING'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Entry Activity */}
        <Card className="space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-brand-dark">Recent Entry Activity</h2>
            <p className="text-xs text-gray-500">Real-time meal log submissions</p>
          </div>

          <div className="space-y-3.5">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-gray-900">TCS Siruseri Campus</span>
                <span className="text-[10px] text-gray-400">10 mins ago</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">Veg: 120, Chicken: 80, Fish: 30</p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-gray-900">Infosys Mahindra City</span>
                <span className="text-[10px] text-gray-400">1 hour ago</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">Veg: 250, Chicken: 150, Special: 40</p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-gray-900">Wipro Sholinganallur</span>
                <span className="text-[10px] text-gray-400">3 hours ago</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">Veg: 90, Fish: 45</p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-gray-900">Cognizant OMR</span>
                <span className="text-[10px] text-gray-400">Today, 11:30 AM</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">Veg: 300, Chicken: 200, Prawns: 50</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
