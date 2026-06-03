import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import api from '../../utils/api'
import { toast } from 'react-toastify'

const UNITS = ['kg', 'gram', 'piece', 'dozen', 'liter']

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', category: '', price: '', discountPrice: '', description: '', stockQuantity: '', unit: 'piece', isFeatured: false, isAvailable: true })
  const [files, setFiles] = useState([])
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [p, c] = await Promise.all([api.get('/products?limit=100'), api.get('/categories')])
    setProducts(p.data.products)
    setCategories(c.data.categories)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm({ name: '', category: '', price: '', discountPrice: '', description: '', stockQuantity: '', unit: 'piece', isFeatured: false, isAvailable: true }); setFiles([]); setShowModal(true) }
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, category: p.category?._id || '', price: p.price, discountPrice: p.discountPrice || '', description: p.description || '', stockQuantity: p.stockQuantity, unit: p.unit, isFeatured: p.isFeatured, isAvailable: p.isAvailable }); setFiles([]); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      files.forEach(f => fd.append('images', f))
      if (editing) await api.put(`/products/${editing._id}`, fd)
      else await api.post('/products', fd)
      toast.success(editing ? 'Product updated!' : 'Product created!')
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    await api.delete(`/products/${id}`)
    toast.success('Deleted')
    load()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Products</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {['Image', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : products.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-4">
                    <img src={p.images?.[0] || 'https://placehold.co/40x40/e2e8f0/64748b?text=F'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-white max-w-[150px] truncate">{p.name}</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{p.category?.name}</td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-green-600">₹{p.discountPrice || p.price}</span>
                    {p.discountPrice && <span className="text-xs text-gray-400 line-through ml-1">₹{p.price}</span>}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{p.stockQuantity} {p.unit}</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${p.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 rounded-lg"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
              <h2 className="font-bold text-lg text-gray-800 dark:text-white">{editing ? 'Edit' : 'Add'} Product</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Product Name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Category *</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input" required>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="input" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Discount Price (₹)</label>
                  <input type="number" value={form.discountPrice} onChange={e => setForm(p => ({ ...p, discountPrice: e.target.value }))} className="input" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Stock Qty *</label>
                  <input type="number" value={form.stockQuantity} onChange={e => setForm(p => ({ ...p, stockQuantity: e.target.value }))} className="input" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Unit</label>
                  <select value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} className="input">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input" rows={3} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Product Images</label>
                <input type="file" accept="image/*" multiple onChange={e => setFiles([...e.target.files])} className="input py-1" />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isAvailable} onChange={e => setForm(p => ({ ...p, isAvailable: e.target.checked }))} className="rounded" />
                  <span className="text-gray-700 dark:text-gray-300">Available</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} className="rounded" />
                  <span className="text-gray-700 dark:text-gray-300">Featured</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
