'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">FastFood</h3>
            <p className="text-gray-400">
              Serving delicious fast food since 2024. Quality ingredients, amazing taste.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Hours</h4>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Mon - Sun: 10:00 AM - 10:00 PM</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>123 Food Street, City</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
          <p>&copy; 2024 FastFood. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}