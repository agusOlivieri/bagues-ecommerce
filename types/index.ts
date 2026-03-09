export interface Product {
  id: string
  name: string
  description: string | null
  category: string
  stock: number
  image_url: string | null
  featured: boolean
  created_at: string
}

export const CATEGORIES = [
  { value: 'perfume', label: 'Perfumes', emoji: '🌸' },
  { value: 'aroma', label: 'Aromas', emoji: '🌹' },
  { value: 'crema', label: 'Cremas', emoji: '🧴' },
  { value: 'shampoo', label: 'Shampoos', emoji: '🚿' },
  { value: 'acondicionador', label: 'Acondicionadores', emoji: '✨' },
  { value: 'otro', label: 'Otros', emoji: '📦' },
]
