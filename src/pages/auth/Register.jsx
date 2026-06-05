import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { register, clearError } from '../../store/slices/authSlice'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { Phone, Shield, CheckCircle, RefreshCw } from 'lucide-react'

const STEPS = { DETAILS: 1, OTP: 2 }

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { loading, error, token } = useSelector(s => s.auth)

  const [step, setStep] = useState(STEPS.DETAILS)
  const [form, setForm] = useState({
    name: '', mobile: '', email: '', password: '', confirmPassword: '',
    referralCode: searchParams.get('ref') || ''
  })
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => { if (token) navigate('/') }, [token, navigate])
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()) } }, [error, dispatch])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  const handleSendOTP = async () => {
    if (!form.mobile || form.mobile.length < 10) {
      toast.error('Enter a valid 10-digit mobile number')
      return
    }
    setSendingOtp(true)
    try {
      const res = await api.post('/auth/send-otp', { mobile: form.mobile })
      toast.success(res.data.message)
      setOtpSent(true)
      setStep(STEPS.OTP)
      setCountdown(60)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    } finally { setSendingOtp(false) }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { toast.error('Enter 6-digit OTP'); return }
    setVerifyingOtp(true)
    try {
      await api.post('/auth/verify-otp', { mobile: form.mobile, otp })
      setOtpVerified(true)
      toast.success('Mobile verified successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally { setVerifyingOtp(false) }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!otpVerified) { toast.error('Please verify your mobile number first'); return }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    const { confirmPassword, ...data } = form
    dispatch(register(data))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-4xl">🥦</span>
              <span className="font-bold text-green-600 text-2xl">FreshMart</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Create Account</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Join FreshMart today</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex-1 h-1.5 rounded-full ${step >= STEPS.DETAILS ? 'bg-green-500' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-1.5 rounded-full ${step >= STEPS.OTP ? 'bg-green-500' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-1.5 rounded-full ${otpVerified ? 'bg-green-500' : 'bg-gray-200'}`} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Details */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Full Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Your full name" className="input" required />
            </div>

            {/* Mobile + OTP */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Mobile Number *</label>
              <div className="flex gap-2">
                <input type="tel" value={form.mobile}
                  onChange={e => { setForm(p => ({ ...p, mobile: e.target.value })); setOtpSent(false); setOtpVerified(false) }}
                  placeholder="10-digit mobile" className="input flex-1"
                  disabled={otpVerified} required />
                {!otpVerified && (
                  <button type="button" onClick={handleSendOTP} disabled={sendingOtp || countdown > 0}
                    className="flex-shrink-0 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
                    {sendingOtp ? '...' : countdown > 0 ? `${countdown}s` : otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                )}
                {otpVerified && (
                  <div className="flex items-center gap-1 text-green-600 text-sm font-medium flex-shrink-0">
                    <CheckCircle size={18} /> Verified
                  </div>
                )}
              </div>
            </div>

            {/* OTP Input */}
            {otpSent && !otpVerified && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
                <p className="text-sm text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                  <Shield size={14} />
                  OTP sent to {form.mobile.slice(0, 3)}XXXXXXX{form.mobile.slice(-2)}
                </p>
                <div className="flex gap-2">
                  <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP" maxLength={6}
                    className="input flex-1 text-center text-xl tracking-[0.5em] font-bold"
                    inputMode="numeric" />
                  <button type="button" onClick={handleVerifyOTP} disabled={verifyingOtp || otp.length !== 6}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-bold px-4 rounded-lg transition-colors">
                    {verifyingOtp ? '...' : 'Verify'}
                  </button>
                </div>
                {countdown > 0 && (
                  <p className="text-xs text-gray-500 mt-2">Resend OTP in {countdown}s</p>
                )}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Email (optional)</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="your@email.com" className="input" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Password *</label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Min 6 characters" className="input" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Confirm Password *</label>
              <input type="password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Repeat password" className="input" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Referral Code (optional)</label>
              <input value={form.referralCode} onChange={e => setForm(p => ({ ...p, referralCode: e.target.value }))}
                placeholder="Friend's referral code" className="input" />
            </div>

            <button type="submit" disabled={loading || !otpVerified}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${otpVerified ? 'btn-primary' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              {loading ? 'Creating...' : !otpVerified ? '🔒 Verify Mobile First' : '✅ Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
