import React from 'react';
import { clsx } from 'clsx';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white rounded-xl border border-gray-200/80 shadow-sm p-4 sm:p-6 transition-all',
        onClick && 'cursor-pointer hover:shadow-md hover:border-gray-300',
        className
      )}
    >
      {children}
    </div>
  );
};

export const KPICard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  badgeText?: string;
  icon?: React.ReactNode;
  trend?: string;
  className?: string;
}> = ({ title, value, subtitle, badgeText, icon, trend, className }) => {
  return (
    <Card className={clsx('relative overflow-hidden bg-white border border-gray-200/90', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{title}</span>
        {icon && <div className="p-2 rounded-lg bg-gray-50 text-gray-700">{icon}</div>}
      </div>

      <div className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">{value}</div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center gap-2 text-xs font-medium text-gray-500">
          {trend && <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">{trend}</span>}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </Card>
  );
};
