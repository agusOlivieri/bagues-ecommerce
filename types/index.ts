export interface Product {
  id: string
  name: string
  description: string | null
  category: string
  brand: string | null
  stock: number
  price: number
  image_url: string | null
  featured: boolean
  created_at: string
}

export interface Combo {
  id: string
  name: string
  description: string | null
  image_url: string | null
  featured: boolean
  created_at: string
  products?: Product[]
}

export const CATEGORIES = [
  { value: 'perfume', label: 'Perfumes', emoji: '🌸' },
  { value: 'aroma', label: 'Aromas', emoji: '🌹' },
  { value: 'crema', label: 'Cremas', emoji: '🧴' },
  { value: 'shampoo', label: 'Shampoos', emoji: '🚿' },
  { value: 'acondicionador', label: 'Acondicionadores', emoji: '✨' },
  { value: 'otro', label: 'Otros', emoji: '📦' },
]

export const PERFUME_BRANDS = [
  { value: 'Unlock', label: '🔓 Unlock' },
  { value: null, label: 'Otros' },
]
