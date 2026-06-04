import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🥦</span>
            <span className="font-bold text-white text-lg">FreshMart</span>
          </div>
          <p className="text-sm text-gray-400">Fresh fruits & vegetables delivered to your doorstep daily.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Quick Links</h4>
          <ul className="space-y-1.5 text-sm">
            <li><Link to="/" className="hover:text-green-400 transition-colors">Home</Link></li>
            <li><Link to="/products" className="hover:text-green-400 transition-colors">Products</Link></li>
            <li><Link to="/orders" className="hover:text-green-400 transition-colors">Orders</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Support</h4>
          <ul className="space-y-1.5 text-sm">
            <li><span className="hover:text-green-400 cursor-pointer">FAQ</span></li>
            <li><Link to="/return-policy" className="hover:text-green-400 transition-colors">Return Policy</Link></li>
            <li><span className="hover:text-green-400 cursor-pointer">Privacy Policy</span></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Contact</h4>
          <ul className="space-y-1.5 text-sm">
            <li>📧 support@freshmart.com</li>
            <li>
              <a href="tel:+918827858476" className="hover:text-green-400">📞 +91 88278 58476</a>
            </li>
            <li>
              <a href="https://wa.me/918827858476" target="_blank" rel="noopener noreferrer" className="hover:text-green-400">💬 WhatsApp Us</a>
            </li>
            <li>⏰ 6 AM – 10 PM</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-700 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} FreshMart. All rights reserved.
      </div>
    </footer>
  )
}
