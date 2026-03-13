'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import FeaturedSlider from '@/components/FeaturedSlider'
import { Product, Combo, CATEGORIES, PERFUME_BRANDS } from '@/types'

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [combos, setCombos] = useState<Combo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedBrand, setSelectedBrand] = useState<string | null>('all')

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      const [productsRes, combosRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/combos'),
      ])
      setProducts(await productsRes.json())
      setCombos(await combosRes.json())
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    const matchesBrand = selectedCategory !== 'perfume' || selectedBrand === 'all' || p.brand === selectedBrand
    return matchesSearch && matchesCategory && matchesBrand
  })

  const featuredProducts = products.filter((p) => p.featured)
  const featuredCombos = combos.filter((c) => c.featured)

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-pink-mesh py-14 px-4 text-center">
        <div className="absolute inset-0 bg-linear-to-br from-brand-100 via-brand-50 to-white opacity-80" />
        <div className="relative max-w-2xl mx-auto">
          <p className="text-brand-500 font-semibold text-sm tracking-widest uppercase mb-2">
            Tienda Online
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-brand-800 leading-tight mb-4">
            Descubrí el aroma<br />
            <span className="text-brand-500">que te define</span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg">
            Perfumes, cremas, aromas y mucho más — todo con buena vibra ✨
          </p>
        </div>
      </section>

      {/* Featured Slider */}
      {(featuredProducts.length > 0 || featuredCombos.length > 0) && (
        <FeaturedSlider products={featuredProducts} combos={featuredCombos} />
      )}

      {/* Filters */}
      <section className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-brand-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Category tabs - scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              onClick={() => { setSelectedCategory('all'); setSelectedBrand('all') }}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
              }`}
            >
              Todos
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => { setSelectedCategory(cat.value); setSelectedBrand('all') }}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          {/* Brand subfiler — solo visible cuando se filtra por perfumes */}
          {selectedCategory === 'perfume' && (
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar border-t border-brand-100 pt-2 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-3">
              <button
                onClick={() => setSelectedBrand('all')}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedBrand === 'all'
                    ? 'bg-brand-800 text-white shadow-md'
                    : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                }`}
              >
                Todas las marcas
              </button>
              {PERFUME_BRANDS.map((b) => (
                <button
                  key={b.value}
                  onClick={() => setSelectedBrand(b.value)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedBrand === b.value
                      ? 'bg-brand-800 text-white shadow-md'
                      : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-square bg-brand-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-brand-100 rounded-full w-3/4" />
                  <div className="h-3 bg-brand-50 rounded-full w-full" />
                  <div className="h-3 bg-brand-50 rounded-full w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌸</div>
            <h3 className="font-display text-xl font-semibold text-gray-600 mb-2">
              No encontramos productos
            </h3>
            <p className="text-gray-400 text-sm">
              Probá con otra búsqueda o categoría
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4 font-medium">
              {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-gray-400 border-t border-brand-100 mt-8">
        <span className="font-display font-semibold text-brand-400">Good Vibes</span> — todos los derechos reservados ✨
      </footer>
    </div>
  )
}