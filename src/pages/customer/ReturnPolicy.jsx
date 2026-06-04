import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Package, AlertCircle, Phone, Clock, Camera, CheckCircle } from 'lucide-react'

export default function ReturnPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 dark:bg-gray-900 min-h-screen">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 mb-6">
        <ChevronLeft size={16} /> Back to Home
      </Link>

      <div className="card p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="text-center border-b dark:border-gray-700 pb-6">
          <div className="text-5xl mb-3">📦</div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Return Policy</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Perishable Items Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🥦</span>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Perishable Items (Fresh Fruits & Vegetables)</h2>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 mb-4">
            <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">
              Due to the perishable nature of fresh produce, returns are not accepted after delivery. However, genuine quality issues will be addressed under the following conditions:
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300">Items must be checked at the time of delivery.</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <Clock size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300">Any issue (damaged, spoiled, wrong item, or missing item) must be reported <span className="font-semibold text-blue-600 dark:text-blue-400">within 2 hours of delivery.</span></p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <Camera size={18} className="text-purple-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300">Clear <span className="font-semibold">photo or video proof</span> is mandatory.</p>
            </div>
          </div>
        </div>

        {/* Not Accepted */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-red-700 dark:text-red-400 mb-1">Not Accepted</p>
              <p className="text-sm text-red-600 dark:text-red-300">
                Complaints raised <span className="font-semibold">after 2 hours</span>, or <span className="font-semibold">without valid proof</span>, will not be accepted.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Phone size={18} className="text-green-600" />
            <h3 className="font-bold text-gray-800 dark:text-white">Return & Support Contact</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            For any return, replacement, or quality-related concerns, please contact us at:
          </p>
          <a href="tel:+918827858476"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
            <Phone size={16} />
            +91 88278 58476
          </a>
          <a href="https://wa.me/918827858476" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors ml-3">
            <span className="text-lg">💬</span>
            WhatsApp
          </a>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Our support team will review your complaint and provide an appropriate resolution as quickly as possible.
          </p>
        </div>

        {/* Quick Summary */}
        <div className="border-t dark:border-gray-700 pt-6">
          <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3 text-sm uppercase tracking-wide">Quick Summary</h3>
          <div className="grid sm:grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-2xl mb-1">⏱️</p>
              <p className="font-semibold text-sm text-gray-800 dark:text-white">2 Hours</p>
              <p className="text-xs text-gray-500">Report window</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-2xl mb-1">📸</p>
              <p className="font-semibold text-sm text-gray-800 dark:text-white">Proof Required</p>
              <p className="text-xs text-gray-500">Photo/Video</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-2xl mb-1">📞</p>
              <p className="font-semibold text-sm text-gray-800 dark:text-white">Contact Us</p>
              <p className="text-xs text-gray-500">Phone/WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
