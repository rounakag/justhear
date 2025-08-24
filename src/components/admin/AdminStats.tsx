import React from 'react';
import type { AdminStats as AdminStatsType } from '@/types/admin.types';

interface AdminStatsProps {
  stats: AdminStatsType;
  className?: string;
}

export const AdminStats: React.FC<AdminStatsProps> = ({ stats, className = '' }) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const statCards = [
    {
      title: 'Total Slots',
      value: formatNumber(stats.totalSlots),
      change: null,
      icon: '📅',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Available Slots',
      value: formatNumber(stats.availableSlots),
      change: null,
      icon: '✅',
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      title: 'Booked Slots',
      value: formatNumber(stats.bookedSlots),
      change: null,
      icon: '🔒',
      color: 'bg-red-500',
      textColor: 'text-red-600',
    },
    {
      title: 'Total Listeners',
      value: formatNumber(stats.totalListeners),
      change: null,
      icon: '👥',
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
    {
      title: 'Active Listeners',
      value: formatNumber(stats.activeListeners),
      change: null,
      icon: '🟢',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Total Bookings',
      value: formatNumber(stats.totalBookings),
      change: null,
      icon: '📊',
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
    },
    {
      title: 'Revenue',
      value: formatCurrency(stats.revenue, stats.currency),
      change: null,
      icon: '💰',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
    },
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center text-white text-xl`}>
              {stat.icon}
            </div>
          </div>
          
          {stat.change !== null && (
            <div className="mt-4">
              <span className={`text-sm font-medium ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change >= 0 ? '↗' : '↘'} {Math.abs(stat.change)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
