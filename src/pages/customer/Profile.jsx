import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { User, Copy, Check } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { getProfile } from '../../store/slices/authSlice'

export default function Profile() {
  const { user } = useSelector(s => s.auth)
  const dispatch = useDispatch()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/auth/me', form)
      await dispatch(getProfile())
      toast.success('Profile updated!')
    } catch (err) {
      toast.error('Failed to update')
    } finally { setSaving(false) }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(user?.referralCode || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Referral code copied!')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">My Profile</h1>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <User size={28} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-gray-800 dark:text-white">{user?.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">{user?.mobile}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Full Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Email</label>
            <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} type="email" className="input" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Mobile (cannot change)</label>
            <input value={user?.mobile || ''} disabled className="input opacity-60 cursor-not-allowed" />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary mt-6 px-8">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Referral */}
      <div className="card p-6">
        <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2">🎁 Referral Code</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Share and earn rewards when friends order!</p>
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
          <span className="flex-1 font-bold text-green-700 dark:text-green-400 text-lg tracking-widest">{user?.referralCode}</span>
          <button onClick={handleCopy} className="p-2 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors">
            {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-green-600" />}
          </button>
        </div>
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Wallet Balance</p>
          <p className="text-2xl font-bold text-green-600">₹{user?.walletBalance || 0}</p>
        </div>
      </div>
    </div>
  )
}
