import { Product } from '@/types'

export function buildWhatsAppOrderUrl(product: Product): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  if (!number) {
    console.warn('NEXT_PUBLIC_WHATSAPP_NUMBER is not defined')
    return '#'
  }
  const text = `Hola Elsa! Mi pedido es: ${product.name} con precio: $${product.price.toLocaleString('es-AR')}`
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}