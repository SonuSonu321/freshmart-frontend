import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchCategories, fetchFeatured, fetchProducts } from '../../store/slices/productSlice'
import ProductCard from '../../components/ProductCard'
import { ChevronRight, Truck, Shield, Clock, Leaf } from 'lucide-react'

export default function Home() {
  const dispatch = useDispatch()
  const { categories, featured, items: products, loading } = useSelector(s => s.products)

  useEffect(() => {
    dispatch(fetchCategories())
    dispatch(fetchFeatured())
    dispatch(fetchProducts({ limit: 8, sort: 'rating' }))
  }, [dispatch])

  return (
    <div className="dark:bg-gray-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-400 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
              Farm Fresh <br /><span className="text-yellow-300">Delivered Fast</span>
            </h1>
            <p className="text-lg md:text-xl text-green-100 mb-8 max-w-md">
              Order fresh fruits & vegetables online. Free delivery on orders above ₹500.
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              <Link to="/products" className="bg-white text-green-600 font-bold py-3 px-8 rounded-full hover:shadow-lg transition-all active:scale-95">
                Shop Now
              </Link>
              <Link to="/register" className="border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white hover:text-green-600 transition-all">
                Sign Up
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="text-[120px] md:text-[160px] select-none animate-bounce">🛒</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white dark:bg-gray-800 py-8 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Truck, text: 'Free Delivery', sub: 'On orders ₹500+' },
            { icon: Leaf, text: '100% Fresh', sub: 'Farm to doorstep' },
            { icon: Clock, text: 'Same Day', sub: 'Order by 12 PM' },
            { icon: Shield, text: 'Quality Assured', sub: 'Freshness guaranteed' }
          ].map(({ icon: Icon, text, sub }) => (
            <div key={text} className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800 dark:text-white">{text}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Shop by Category</h2>
          <Link to="/products" className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {categories.map(cat => (
            <Link key={cat._id} to={`/products?category=${cat._id}`}
              className="flex flex-col items-center gap-2 p-3 card hover:border-green-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-green-50 dark:bg-green-900/30">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🥬</div>
                )}
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">⭐ Featured</h2>
            <Link to="/products?featured=true" className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featured.slice(0, 5).map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* All Products */}
      <section className="max-w-7xl mx-auto px-4 py-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">🥦 Fresh Today</h2>
          <Link to="/products" className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-t-xl" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  )
}
