import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { User, Lock, Mail } from 'lucide-react'
import api from '../../utils/api'

export default function AdminProfile() {
  const { user } = useSelector(s => s.auth)
  const [emailForm, setEmailForm] = useState({ email: user?.email || '' })
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingPass, setSavingPass] = useState(false)

  const handleEmailUpdate = async (e) => {
    e.preventDefault()
    setSavingEmail(true)
    try {
      await api.put('/auth/me', { email: emailForm.email, name: user?.name })
      toast.success('Email updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update email')
    } finally { setSavingEmail(false) }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (passForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setSavingPass(true)
    try {
      await api.put('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      })
      toast.success('Password changed successfully!')
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally { setSavingPass(false) }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Profile</h1>

      {/* Current info */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-14 h-14 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <User size={24} className="text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="font-bold text-lg text-gray-800 dark:text-white">{user?.name}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
          <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">Admin</span>
        </div>
      </div>

      {/* Change Email */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Mail size={18} className="text-green-600" /> Change Email
        </h2>
        <form onSubmit={handleEmailUpdate} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">New Email Address</label>
            <input
              type="email"
              value={emailForm.email}
              onChange={e => setEmailForm({ email: e.target.value })}
              className="input"
              placeholder="admin@freshmart.com"
              required
            />
          </div>
          <button type="submit" disabled={savingEmail} className="btn-primary px-6">
            {savingEmail ? 'Saving...' : 'Update Email'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Lock size={18} className="text-green-600" /> Change Password
        </h2>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">Current Password</label>
            <input
              type="password"
              value={passForm.currentPassword}
              onChange={e => setPassForm(p => ({ ...p, currentPassword: e.target.value }))}
              className="input"
              placeholder="Enter current password"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">New Password</label>
            <input
              type="password"
              value={passForm.newPassword}
              onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))}
              className="input"
              placeholder="Min 6 characters"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">Confirm New Password</label>
            <input
              type="password"
              value={passForm.confirmPassword}
              onChange={e => setPassForm(p => ({ ...p, confirmPassword: e.target.value }))}
              className="input"
              placeholder="Repeat new password"
              required
            />
          </div>
          <button type="submit" disabled={savingPass} className="btn-primary px-6">
            {savingPass ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
