export interface Product {
  id: string
  name: string
  description: string | null
  category: string
  brand: string
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
  price: number
  created_at: string
  products?: Product[]
}

export const CATEGORIES = [
  { value: 'perfume', label: 'Perfumes', emoji: '🌸' },
  { value: 'aromaterapia', label: 'Aromaterapia', emoji: '🌹' },
  { value: 'spray', label: 'Sprays', emoji: '💨' }, 
  { value: 'crema', label: 'Cremas', emoji: '🧴' },
  // { value: 'shampoo', label: 'Shampoos', emoji: '🚿' },
  // { value: 'acondicionador', label: 'Acondicionadores', emoji: '✨' },
  // { value: 'otro', label: 'Otros', emoji: '📦' },
]

export const PERFUME_BRANDS = [
  { value: 'Unlock', label: '🔓 Unlock' },
  { value: 'none', label: 'Otros' },
]
