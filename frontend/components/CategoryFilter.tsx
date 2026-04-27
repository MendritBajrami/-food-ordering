'use client';

import React from 'react';
import { Category } from '@/lib/types';

const categories: { value: Category; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'burgers', label: 'Burgers' },
  { value: 'fries', label: 'Fries' },
  { value: 'drinks', label: 'Drinks' },
  { value: 'combos', label: 'Combos' },
];

interface CategoryFilterProps {
  selected: Category;
  onSelect: (category: Category) => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map(category => (
        <button
          key={category.value}
          onClick={() => onSelect(category.value)}
          className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
            selected === category.value
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}