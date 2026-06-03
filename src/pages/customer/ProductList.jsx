import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { fetchProducts, fetchCategories } from '../../store/slices/productSlice'
import ProductCard from '../../components/ProductCard'
import { SlidersHorizontal, X } from 'lucide-react'

export default function ProductList() {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { items, loading, total, pages } = useSelector(s => s.products)
  const { categories } = useSelector(s => s.products)
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''

  useEffect(() => { dispatch(fetchCategories()) }, [dispatch])

  useEffect(() => {
    dispatch(fetchProducts({ search, category, sort, minPrice, maxPrice, page, limit: 20 }))
  }, [search, category, sort, minPrice, maxPrice, page, dispatch])

  const updateParam = (key, value) => {
    const params = Object.fromEntries(searchParams.entries())
    if (value) params[key] = value
    else delete params[key]
    setSearchParams(params)
    setPage(1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {search ? `Results for "${search}"` : category ? categories.find(c => c._id === category)?.name : 'All Products'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{total} products found</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <select value={sort} onChange={e => updateParam('sort', e.target.value)} className="input text-sm w-40">
            <option value="">Sort by</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Best Rating</option>
          </select>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 btn-outline text-sm py-2">
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card p-4 mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Category</label>
            <select value={category} onChange={e => updateParam('category', e.target.value)} className="input text-sm w-40">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Min Price (₹)</label>
            <input type="number" value={minPrice} onChange={e => updateParam('minPrice', e.target.value)} className="input text-sm w-28" placeholder="0" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Max Price (₹)</label>
            <input type="number" value={maxPrice} onChange={e => updateParam('maxPrice', e.target.value)} className="input text-sm w-28" placeholder="500" />
          </div>
          <button onClick={() => { setSearchParams({}); setPage(1) }} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
            <X size={14} /> Clear
          </button>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        <button onClick={() => updateParam('category', '')}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!category ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-50'}`}>
          All
        </button>
        {categories.map(c => (
          <button key={c._id} onClick={() => updateParam('category', c._id)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${category === c._id ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-50'}`}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-t-xl" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-lg font-medium">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(pages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-green-50 text-gray-700 dark:text-gray-300'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
