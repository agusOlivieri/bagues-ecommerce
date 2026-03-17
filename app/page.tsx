'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import FeaturedSlider from '@/components/FeaturedSlider'
import { Product, Combo, CATEGORIES, PERFUME_BRANDS } from '@/types'

const LIMIT = 12

export default function CatalogPage() {
  // ── Datos ────────────────────────────────────────────────────────────────
  const [products, setProducts]               = useState<Product[]>([])
  const [combos, setCombos]                   = useState<Combo[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [featuredCombos, setFeaturedCombos]   = useState<Combo[]>([])

  // ── Filtros ───────────────────────────────────────────────────────────────
  const [search, setSearch]                   = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedBrand, setSelectedBrand]     = useState<string | null>('all')

  // ── Paginación ────────────────────────────────────────────────────────────
  const [page, setPage]                       = useState(1)
  const [total, setTotal]                     = useState(0)
  const totalPages                            = Math.ceil(total / LIMIT)

  // ── Estado UI ─────────────────────────────────────────────────────────────
  const [loading, setLoading]                 = useState(true)
  const [loadingPage, setLoadingPage]         = useState(false)

  // ── Debounce para el buscador ─────────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  // ── Carga inicial de destacados y combos (una sola vez) ───────────────────
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [allProductsRes, combosRes] = await Promise.all([
          fetch('/api/products?featured=true'),
          fetch('/api/combos'),
        ])
        const { products: featuredData } = await allProductsRes.json()
        const allCombos: Combo[]     = await combosRes.json()
        
        setFeaturedProducts(featuredData)
        console.log(featuredData)
        setCombos(allCombos)
        setFeaturedCombos(allCombos.filter((c) => c.featured))
      } catch (err) {
        console.error('Error fetching initial data:', err)
      }
    }
    fetchInitialData()
  }, [])

  // ── Fetch de productos paginados ──────────────────────────────────────────
  const fetchProducts = useCallback(async (targetPage: number) => {
    targetPage === 1 ? setLoading(true) : setLoadingPage(true)

    try {
      const params = new URLSearchParams({
        page:     String(targetPage),
        limit:    String(LIMIT),
        search:   debouncedSearch,
        category: selectedCategory,
        ...(selectedBrand && selectedBrand !== 'all' ? { brand: selectedBrand } : {}),
      })

      const res                            = await fetch(`/api/products?${params}`)
      const { products: data, total: tot } = await res.json()

      setProducts(data ?? [])
      setTotal(tot ?? 0)
      setPage(targetPage)
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
      setLoadingPage(false)
    }
  }, [debouncedSearch, selectedCategory, selectedBrand])

  // ── Re-fetch cuando cambian filtros (resetea a página 1) ──────────────────
  useEffect(() => {
    fetchProducts(1)
  }, [fetchProducts])

  // ── Cambio de página: scroll suave al top de la grilla ───────────────────
  function handlePageChange(newPage: number) {
    document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    fetchProducts(newPage)
  }

  // ── Handlers de filtros (resetean página automáticamente vía useEffect) ───
  function handleCategoryChange(cat: string) {
    setSelectedCategory(cat)
    setSelectedBrand('all')
  }

  // ─────────────────────────────────────────────────────────────────────────

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
          <div className="relative flex-1 max-w-96">
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

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              onClick={() => handleCategoryChange('all')}
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
                onClick={() => handleCategoryChange(cat.value)}
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

          {/* Brand subfilter */}
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
      <main id="catalog-grid" className="max-w-6xl mx-auto px-4 py-8 scroll-mt-36">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: LIMIT }).map((_, i) => (
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
        ) : products.length === 0 ? (
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
              {total} {total === 1 ? 'producto' : 'productos'}
            </p>

            {/* Grid con overlay de carga al cambiar página */}
            <div className={`relative transition-opacity duration-200 ${loadingPage ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              {loadingPage && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-8 h-8 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {/* Anterior */}
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1 || loadingPage}
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-brand-50 text-brand-600 hover:bg-brand-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Anterior
                </button>

                {/* Números de página */}
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis')
                      acc.push(p)
                      return acc
                    }, [])
                    .map((item, idx) =>
                      item === 'ellipsis' ? (
                        <span key={`e-${idx}`} className="px-2 py-2 text-sm text-gray-400 select-none">
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => handlePageChange(item)}
                          disabled={loadingPage}
                          className={`w-9 h-9 rounded-full text-sm font-semibold transition-all ${
                            item === page
                              ? 'bg-brand-600 text-white shadow-md'
                              : 'bg-brand-50 text-brand-600 hover:bg-brand-100 disabled:opacity-40'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                </div>

                {/* Siguiente */}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages || loadingPage}
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-brand-50 text-brand-600 hover:bg-brand-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Siguiente →
                </button>
              </div>
            )}
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