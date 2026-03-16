import { Combo, Product } from '@/types'

export function buildWhatsAppOrderUrl(item: Product | Combo): string {
  const isProduct = 'stock' in item
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  if (!number) {
    console.warn('NEXT_PUBLIC_WHATSAPP_NUMBER is not defined')
    return '#'
  }
  const text = isProduct 
    ? `Hola Elsa! Mi pedido es: ${item.name} con precio: $${item.price.toLocaleString('es-AR')}`
    : `Hola Elsa! Mi pedido es el combo: ${item.name} con precio: $${item.price.toLocaleString('es-AR')} y los productos incluidos son: ${item.products?.map(p => p.name).join(', ')}`
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}