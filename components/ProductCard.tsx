import Image from 'next/image'
import { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="badge-out-of-stock">Sin stock</span>
  if (stock <= 3) return <span className="badge-low-stock">Últimas {stock} unidades</span>
  return <span className="badge-in-stock">En stock</span>
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock === 0

  return (
    <div className={`card group ${isOutOfStock ? 'opacity-70' : ''}`}>
      {/* Image */}
      <div className="relative aspect-square bg-brand-50 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-brand-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        {/* Category pill */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-brand-600 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm capitalize">
          {product.brand ? `🔓 ${product.brand}` : product.category}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-display font-semibold text-gray-800 text-lg leading-tight line-clamp-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="mt-1 flex items-center justify-between">
          <StockBadge stock={product.stock} />
          {product.price > 0 && (
            <span className="text-brand-600 font-bold font-display text-lg">
              ${product.price.toLocaleString('es-AR')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}