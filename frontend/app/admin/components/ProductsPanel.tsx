'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Save, ImageOff, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';

const CATEGORIES = ['Burgers', 'Fries', 'Drinks', 'Combos', 'Desserts', 'Other'];

const EMPTY_FORM = { name: '', description: '', price: '', image_url: '', category: 'Burgers' };

export default function ProductsPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await api.products.getAll();
      setProducts(data.products);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const openAdd = () => { setEditProduct(null); setForm(EMPTY_FORM); setFormError(''); setShowModal(true); };
  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({ name: p.name, description: p.description || '', price: String(p.price), image_url: p.image_url, category: p.category });
    setFormError('');
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditProduct(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.image_url || !form.category) {
      setFormError('Name, price, image URL and category are required.'); return;
    }
    setIsSaving(true);
    setFormError('');
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      if (editProduct) {
        await api.products.update(editProduct.id, payload);
      } else {
        await api.products.create(payload);
      }
      await loadProducts();
      closeModal();
    } catch (err: any) { setFormError(err.message || 'Save failed'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.products.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setDeleteId(null);
    } catch (e) { console.error(e); }
  };

  const filtered = products.filter(p => {
    const matchCat = filterCat === 'All' || p.category.toLowerCase() === filterCat.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {['All', ...CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filterCat === cat ? 'bg-red-500 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:border-red-300'}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-red-400" />
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all hover:shadow-lg whitespace-nowrap">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
              <div className="h-44 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map(product => (
              <motion.div key={product.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className="relative h-44 bg-gray-100 overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300"><ImageOff className="h-10 w-10" /></div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                    <button onClick={() => openEdit(product)}
                      className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow text-gray-700 hover:text-blue-600 transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteId(product.id)}
                      className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow text-gray-700 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {product.category}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">{product.name}</h3>
                    <span className="text-red-500 font-black text-sm whitespace-nowrap">${Number(product.price).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{product.description}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-400">
              <p className="font-medium">No products found</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-lg font-black">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={closeModal} className="p-2 rounded-xl hover:bg-gray-100 transition-colors"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                {/* Image Preview */}
                <div className="h-40 bg-gray-100 rounded-2xl overflow-hidden">
                  {form.image_url ? (
                    <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
                      <ImageOff className="h-8 w-8" />
                      <span className="text-xs">Image preview</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Image URL</label>
                  <input value={form.image_url} onChange={e => setForm(p => ({...p, image_url: e.target.value}))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-red-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Product Name</label>
                    <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required
                      placeholder="Classic Burger"
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-red-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Price ($)</label>
                    <input value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} type="number" step="0.01" min="0" required
                      placeholder="9.99"
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-red-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Category</label>
                    <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-red-400 bg-white">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Description</label>
                    <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} rows={3}
                      placeholder="Short description..."
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-red-400 resize-none" />
                  </div>
                </div>

                {formError && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{formError}</p>}

                <button type="submit" disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-2xl transition-all disabled:opacity-60">
                  <Save className="h-5 w-5" />
                  {isSaving ? 'Saving…' : (editProduct ? 'Save Changes' : 'Add Product')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="text-lg font-black mb-1">Delete Product?</h3>
              <p className="text-gray-400 text-sm mb-6">This will hide the product from the menu.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 rounded-2xl border-2 border-gray-100 font-bold text-gray-500 hover:border-gray-200 transition-all">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
