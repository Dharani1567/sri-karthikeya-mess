import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className }) => {
  const normalized = status.toUpperCase();

  let styles = 'bg-gray-100 text-gray-800 border-gray-200';

  if (['ACTIVE', 'PAID', 'DELIVERED', 'READY'].includes(normalized)) {
    styles = 'bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]';
  } else if (['DRAFT', 'PENDING'].includes(normalized)) {
    styles = 'bg-[#FFF8E1] text-[#F9A825] border-[#FFE082]';
  } else if (['UNPAID', 'OVERDUE'].includes(normalized)) {
    styles = 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]';
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border',
        styles,
        className
      )}
    >
      {status}
    </span>
  );
};
