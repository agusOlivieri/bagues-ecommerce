'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Product, Combo } from '@/types'
import OrderButton from '@/components/OrderButton'

// Type guard: si tiene 'stock', es un Product
function isProduct(item: Product | Combo): item is Product {
  return 'stock' in item
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="badge-out-of-stock">Sin stock</span>
  if (stock <= 3) return <span className="badge-low-stock">Últimas {stock} unidades</span>
  return <span className="badge-in-stock">En stock</span>
}

export default function ProductModal({ item, onClose }: { item: Product | Combo; onClose: () => void }) {
  const product = isProduct(item) ? item : null
  // Cerrar con Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90dvh] sm:max-h-[85dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative aspect-square w-full bg-brand-50 shrink-0">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, 448px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-20 h-20 text-brand-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Category pill — solo en productos */}
          {product && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-brand-600 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm capitalize">
              {product.brand ? `🔓 ${product.brand}` : product.category}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display font-semibold text-gray-800 text-xl leading-tight">
              {item.name}
            </h2>
            {product && <StockBadge stock={product.stock} />}
          </div>

          {item.description && (
            <p className="text-sm text-gray-500 leading-relaxed">
              {item.description}
            </p>
          )}

          <span className="text-brand-600 font-bold font-display text-2xl">
            ${item.price.toLocaleString('es-AR')}
          </span>

          <OrderButton item={item} />
        </div>
      </div>
    </div>,
    document.body
  )
}