

export default function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="badge-out-of-stock">Sin stock</span>
  if (stock <= 3) return <span className="badge-low-stock">Últimas {stock} unidades</span>
  return <span className="badge-in-stock">En stock</span>
}