'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Product, Category } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => {
        const pCat = p.category?.toLowerCase() || '';
        const sCat = selectedCategory.toLowerCase();
        // Match exact, singular/plural, or "beverages" for drinks
        return pCat === sCat || 
               pCat === sCat.replace(/s$/, '') || 
               sCat === pCat.replace(/s$/, '') ||
               (sCat === 'drinks' && pCat === 'beverages');
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await api.products.getAll();
      setProducts(data.products);
      setFilteredProducts(data.products);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Cinematic Hero Section */}
      <div className="relative h-[50vh] flex items-center overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1514356021116-dee3f2ef1d4f?q=80&w=2670&auto=format&fit=crop"
          alt="Hero Background"
          fill
          className="object-cover scale-110 blur-[2px]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block bg-red-500 text-white text-xs font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full mb-6">
              Our Premium Menu
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-none">
              TASTE THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">EXCELLENCE</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl font-medium leading-relaxed mb-10">
              Crafted with passion, served with perfection. Discover our selection of gourmet burgers and signature dishes.
            </p>
            
            <div className="relative max-w-xl group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-red-500 transition-colors" />
              <input
                type="text"
                placeholder="Search for something delicious..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-5 rounded-[2.5rem] bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-400 outline-none text-xl transition-all shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                <div className="h-56 bg-gray-100" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-100 rounded-full w-3/4" />
                  <div className="h-4 bg-gray-100 rounded-full w-full" />
                  <div className="h-10 bg-gray-100 rounded-2xl w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={selectedCategory + searchQuery}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map(product => (
                <motion.div
                  key={product.id}
                  variants={cardVariants}
                  layout
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
        
        {!isLoading && filteredProducts.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 mt-8"
          >
            <p className="text-gray-400 text-xl font-medium">No results found for your search.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}