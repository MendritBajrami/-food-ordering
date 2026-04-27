'use client';

import React from 'react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  preparing: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready',
  delivered: 'Delivered',
};

interface BadgeProps {
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
}

export default function Badge({ status }: BadgeProps) {
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
      {statusLabels[status]}
    </span>
  );
}