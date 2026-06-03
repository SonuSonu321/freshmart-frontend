import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../../utils/api'

export default function DeliveryLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ mobile: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/delivery/login', form)
      localStorage.setItem('deliveryToken', res.data.token)
      localStorage.setItem('deliveryPartner', JSON.stringify(res.data.partner))
      toast.success('Welcome, ' + res.data.partner.name)
      navigate('/delivery/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-orange-100 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Truck size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Delivery Partner</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">FreshMart Delivery App</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Mobile Number</label>
              <input value={form.mobile} onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))}
                type="tel" placeholder="Registered mobile number" required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Password</label>
              <input value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                type="password" placeholder="••••••••" required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 dark:bg-gray-700 dark:text-white" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Contact admin to get your login credentials
          </p>
        </div>
      </div>
    </div>
  )
}
