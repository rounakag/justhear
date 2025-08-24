import React from 'react';
import type { UserDashboardStats } from '@/types/user.types';

interface UserStatsProps {
  stats: UserDashboardStats;
  className?: string;
}

export const UserStats: React.FC<UserStatsProps> = ({ stats, className = '' }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const statsItems = [
    {
      label: 'Total Bookings',
      value: stats.totalBookings.toString(),
      icon: '📅',
      color: 'bg-blue-500',
    },
    {
      label: 'Completed Sessions',
      value: stats.completedSessions.toString(),
      icon: '✅',
      color: 'bg-green-500',
    },
    {
      label: 'Upcoming Sessions',
      value: stats.upcomingSessions.toString(),
      icon: '⏰',
      color: 'bg-yellow-500',
    },
    {
      label: 'Total Spent',
      value: formatCurrency(stats.totalSpent),
      icon: '💰',
      color: 'bg-purple-500',
    },
    {
      label: 'Average Rating',
      value: formatRating(stats.averageRating),
      icon: '⭐',
      color: 'bg-orange-500',
    },
    {
      label: 'Reviews Given',
      value: stats.totalReviews.toString(),
      icon: '📝',
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {statsItems.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl ${item.color}`}>
              {item.icon}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
