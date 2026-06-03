import React, { useEffect, useState } from 'react'
import api from '../../utils/api'
import { Users } from 'lucide-react'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/admin/customers').then(r => setCustomers(r.data.customers)).finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Users size={24} /> Customers ({customers.length})
        </h1>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search..." className="input w-48 text-sm" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {['Name', 'Mobile', 'Email', 'Joined', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {loading ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
                : filtered.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-700 dark:text-green-300 font-bold text-xs">
                          {c.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800 dark:text-white">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{c.mobile}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{c.email || '-'}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">
                      {new Date(c.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
