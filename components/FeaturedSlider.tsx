'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Product, Combo } from '@/types'

type SliderItem =
  | { type: 'product'; data: Product }
  | { type: 'combo'; data: Combo }

interface FeaturedSliderProps {
  products: Product[]
  combos: Combo[]
}

export default function FeaturedSlider({ products, combos }: FeaturedSliderProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Merge featured products and combos into a single list
  const items: SliderItem[] = [
    ...products.map((p) => ({ type: 'product' as const, data: p })),
    ...combos.map((c) => ({ type: 'combo' as const, data: c })),
  ]

  const total = items.length

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total])

  useEffect(() => {
    if (paused || total <= 1) return
    intervalRef.current = setInterval(next, 3500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [paused, next, total])

  function handleDragStart(x: number) {
    setIsDragging(true)
    dragStartX.current = x
    setPaused(true)
  }

  function handleDragEnd(x: number) {
    if (!isDragging) return
    const diff = dragStartX.current - x
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
    setIsDragging(false)
    setPaused(false)
  }

  if (total === 0) return null

  return (
    <section className="w-full bg-white border-b border-brand-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">

        {/* Section header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-brand-200" />
          <p className="text-xs tracking-[0.3em] uppercase font-semibold text-brand-400">
            ✦ Destacados ✦
          </p>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-brand-200" />
        </div>

        {/* Slider */}
        <div
          className="relative overflow-hidden rounded-2xl cursor-grab active:cursor-grabbing select-none"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => { setPaused(false); setIsDragging(false) }}
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseUp={(e) => handleDragEnd(e.clientX)}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {items.map((item, i) =>
              item.type === 'product'
                ? <ProductSlide key={`p-${item.data.id}`} product={item.data} />
                : <ComboSlide key={`c-${item.data.id}`} combo={item.data} />
            )}
          </div>

          {/* Arrows */}
          {total > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-brand-600 hover:bg-white transition-all hover:scale-110"
                aria-label="Anterior"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-brand-600 hover:bg-white transition-all hover:scale-110"
                aria-label="Siguiente"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Dots + pause */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); setPaused(true); setTimeout(() => setPaused(false), 4000) }}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 h-2 bg-brand-500' : 'w-2 h-2 bg-brand-200 hover:bg-brand-300'
                }`}
                aria-label={`Ir al slide ${i + 1}`}
              />
            ))}
            <button
              onClick={() => setPaused((p) => !p)}
              className="ml-2 text-brand-300 hover:text-brand-500 transition-colors"
              aria-label={paused ? 'Reanudar' : 'Pausar'}
            >
              {paused ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Product slide ────────────────────────────────────────
function ProductSlide({ product }: { product: Product }) {
  return (
    <div className="w-full flex-shrink-0">
      <div className="flex flex-col sm:flex-row rounded-2xl overflow-hidden bg-gradient-to-br from-brand-50 to-white">
        <div className="relative w-full sm:w-96 h-52 sm:h-80 flex-shrink-0">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill
              sizes="(max-width: 640px) 100vw, 256px" className="object-cover" draggable={false} />
          ) : (
            <div className="w-full h-full bg-brand-100 flex items-center justify-center">
              <span className="text-5xl">🌸</span>
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-center px-6 py-5 sm:py-8">
          <span className="text-xs tracking-widest uppercase text-brand-400 font-semibold mb-2 capitalize">
            {product.brand ?? product.category}
          </span>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-brand-800 leading-tight mb-3">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4">
              {product.description}
            </p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            {product.price > 0 && (
              <span className="font-display font-bold text-2xl text-brand-600">
                ${product.price.toLocaleString('es-AR')}
              </span>
            )}
            {product.stock === 0 ? <span className="badge-out-of-stock">Sin stock</span>
              : product.stock <= 3 ? <span className="badge-low-stock">Últimas {product.stock} unidades</span>
              : <span className="badge-in-stock">En stock</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Combo slide ─────────────────────────────────────────
function ComboSlide({ combo }: { combo: Combo }) {
  const hasProducts = combo.products && combo.products.length > 0

  return (
    <div className="w-full flex-shrink-0">
      <div className="flex flex-col sm:flex-row rounded-2xl overflow-hidden bg-gradient-to-br from-brand-100 to-brand-50">

        {/* Combo image or product collage */}
        <div className="relative w-full sm:w-3xl h-52 sm:h-80 flex-shrink-0">
          {combo.image_url ? (
            <Image src={combo.image_url} alt={combo.name} fill
              sizes="(max-width: 640px) 100vw, 256px" className=" object-cover" draggable={false} />
          ) : hasProducts ? (
            // Collage con las fotos de los productos del combo
            <div className={`w-full h-full grid gap-0.5 bg-brand-200 ${
              combo.products!.length === 1 ? 'grid-cols-1' :
              combo.products!.length === 2 ? 'grid-cols-2' :
              combo.products!.length === 3 ? 'grid-cols-2' :
              'grid-cols-2'
            }`}>
              {combo.products!.slice(0, 4).map((p, i) => (
                <div key={p.id} className={`relative overflow-hidden ${
                  combo.products!.length === 3 && i === 0 ? 'row-span-2' : ''
                }`}>
                  {p.image_url ? (
                    <Image src={p.image_url} alt={p.name} fill
                      sizes="128px" className="object-cover" draggable={false} />
                  ) : (
                    <div className="w-full h-full bg-brand-100 flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-full bg-brand-100 flex items-center justify-center">
              <span className="text-5xl">🎁</span>
            </div>
          )}

          {/* Combo badge */}
          <div className="absolute top-3 left-3 bg-brand-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
            🎁 Combo
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-center px-6 py-5 sm:py-8">
          <span className="text-xs tracking-widest uppercase text-brand-500 font-semibold mb-2">
            Combo especial
          </span>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-brand-800 leading-tight mb-3">
            {combo.name}
          </h3>
          {combo.description && (
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
              {combo.description}
            </p>
          )}
          {hasProducts && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Incluye:</p>
              <div className="flex flex-wrap gap-1.5">
                {combo.products!.map((p) => (
                  <span key={p.id} className="bg-white text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm border border-brand-100">
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}