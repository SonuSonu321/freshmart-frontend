import React, { useEffect, useState } from 'react'
import { ShoppingCart, Users, Package, DollarSign, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import api from '../../utils/api'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/analytics').then(r => setAnalytics(r.data.analytics)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="animate-pulse space-y-4"><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="card h-24" />)}</div></div>

  const { totalOrders, totalCustomers, totalProducts, totalRevenue, monthlySales, topProducts } = analytics || {}

  const chartData = monthlySales?.map(m => ({
    name: MONTHS[m._id.month - 1],
    revenue: m.revenue,
    orders: m.orders
  })) || []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: totalOrders, icon: ShoppingCart, color: 'bg-blue-500' },
          { label: 'Total Revenue', value: `₹${totalRevenue?.toLocaleString('en-IN') || 0}`, icon: DollarSign, color: 'bg-green-500' },
          { label: 'Customers', value: totalCustomers, icon: Users, color: 'bg-purple-500' },
          { label: 'Products', value: totalProducts, icon: Package, color: 'bg-orange-500' }
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon size={22} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{value || 0}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-green-600" /> Monthly Revenue
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={v => [`₹${v}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-bold text-gray-800 dark:text-white mb-4">Monthly Orders</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-800 dark:text-white mb-4">Top Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Product</th>
                <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Sold</th>
                <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts?.map((p, i) => (
                <tr key={p._id} className="border-b dark:border-gray-700">
                  <td className="py-2 px-3 text-gray-800 dark:text-white">{p.name}</td>
                  <td className="py-2 px-3 text-right text-gray-600 dark:text-gray-400">{p.totalSold}</td>
                  <td className="py-2 px-3 text-right font-medium text-green-600">₹{p.revenue?.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!topProducts || topProducts.length === 0) && (
            <p className="text-center py-8 text-gray-400 text-sm">No sales data yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
