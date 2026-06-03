import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import api from '../../utils/api'
import { toast } from 'react-toastify'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', order: '' })
  const [file, setFile] = useState(null)

  const load = () => api.get('/categories').then(r => setCategories(r.data.categories))
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (file) fd.append('image', file)
    try {
      if (editing) await api.put(`/categories/${editing._id}`, fd)
      else await api.post('/categories', fd)
      toast.success('Saved!')
      setShowModal(false)
      load()
    } catch (err) { toast.error('Failed') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return
    await api.delete(`/categories/${id}`)
    toast.success('Deleted')
    load()
  }

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', order: '' }); setFile(null); setShowModal(true) }
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description || '', order: c.order }); setFile(null); setShowModal(true) }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Categories</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add</button>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map(c => (
          <div key={c._id} className="card p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-green-50 dark:bg-green-900/30 flex-shrink-0">
              {c.image ? <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-xl">🥬</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 dark:text-white truncate">{c.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Order: {c.order}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg"><Pencil size={13} /></button>
              <button onClick={() => handleDelete(c._id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
              <h2 className="font-bold text-lg text-gray-800 dark:text-white">{editing ? 'Edit' : 'Add'} Category</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input" required />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Description</label>
                <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Sort Order</label>
                <input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Image</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="input py-1" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Save</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
