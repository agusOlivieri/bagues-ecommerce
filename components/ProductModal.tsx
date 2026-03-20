'use client'

import { useEffect, useState } from 'react'
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

const COMBO_2X1_LIMIT = 2

function TwoForOneSelector({ combo }: { combo: Combo }) {
  const products = combo.products ?? []
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < COMBO_2X1_LIMIT) {
        next.add(id)
      }
      return next
    })
  }

  const remaining = COMBO_2X1_LIMIT - selectedIds.size
  const isReady = selectedIds.size === COMBO_2X1_LIMIT

  // Construir el combo filtrado con solo los productos seleccionados
  const filteredCombo: Combo = {
    ...combo,
    products: products.filter((p) => selectedIds.has(p.id)),
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Elegí tus 2 productos:</h3>
        {!isReady && (
          <span className="text-xs text-brand-500 font-medium">
            {remaining === COMBO_2X1_LIMIT
              ? 'Elegí 2'
              : `Falta ${remaining} más`}
          </span>
        )}
        {isReady && (
          <span className="text-xs text-green-600 font-semibold">✓ Listo</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {products.map((prod) => {
          const isSelected = selectedIds.has(prod.id)
          const isDisabled = !isSelected && selectedIds.size === COMBO_2X1_LIMIT

          return (
            <button
              key={prod.id}
              onClick={() => toggle(prod.id)}
              disabled={isDisabled}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-left
                transition-all duration-150 border
                ${isSelected
                  ? 'bg-brand-50 border-brand-400 text-brand-700 font-semibold'
                  : isDisabled
                  ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-brand-300 hover:bg-brand-50/50'
                }
              `}
            >
              {/* Checkbox visual */}
              <span className={`
                w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center
                transition-colors duration-150
                ${isSelected ? 'border-brand-500 bg-brand-500' : 'border-gray-300'}
              `}>
                {isSelected && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              {prod.name}
            </button>
          )
        })}
      </div>

      {/* OrderButton recibe el combo filtrado — no sabe nada del selector */}
      <div className={`transition-opacity duration-200 ${isReady ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <OrderButton item={filteredCombo} />
      </div>

      {!isReady && (
        <p className="text-xs text-center text-gray-400">
          Seleccioná 2 productos para poder pedir
        </p>
      )}
    </div>
  )
}

export default function ProductModal({ item, onClose }: { item: Product | Combo; onClose: () => void }) {
  const product = isProduct(item) ? item : null
  const combo = !isProduct(item) ? item : null
  const is2x1 = combo?.name === '2x1'

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-50 px-2 flex items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
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
              {product.subcategory !== 'none' ? `🔓 ${product.subcategory}` : product.category}
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

          {product && product.price > 0 && (
            <span className="text-brand-600 font-bold font-display text-2xl">
              ${product.price.toLocaleString('es-AR')}
            </span>
          )}

          {/* Selector 2x1 o botón directo */}
          {is2x1 && combo
            ? <TwoForOneSelector combo={combo} />
            : product
            ? <OrderButton item={product} />
            : combo
            ? <OrderButton item={combo} />
            : null
          }
        </div>
      </div>
    </div>,
    document.body
  )
}