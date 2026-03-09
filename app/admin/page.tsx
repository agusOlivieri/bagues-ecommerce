'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import { Product, CATEGORIES } from '@/types'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? ''

const emptyForm = {
  name: '',
  description: '',
  category: 'perfume',
  stock: 0,
  price: 0,
  image_url: '',
  featured: false,
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const isAdmin = session?.user?.email === ADMIN_EMAIL

  useEffect(() => {
    if (isAdmin) fetchProducts()
  }, [isAdmin])

  async function fetchProducts() {
    setLoading(true)
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data)
    setLoading(false)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const { url } = await res.json()
    setForm((f) => ({ ...f, image_url: url }))
    setUploading(false)
  }

  async function handleSubmit() {
    setSaving(true)
    const method = editing ? 'PUT' : 'POST'
    const body = editing ? { ...form, id: editing } : form
    await fetch('/api/products', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    await fetchProducts()
    resetForm()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setDeleteConfirm(null)
    fetchProducts()
  }

  function startEdit(product: Product) {
    setForm({
      name: product.name,
      description: product.description ?? '',
      category: product.category,
      stock: product.stock,
      price: product.price ?? 0,
      image_url: product.image_url ?? '',
      featured: product.featured ?? false,
    })
    setEditing(product.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setForm(emptyForm)
    setEditing(null)
    setShowForm(false)
  }

  // Not logged in
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">GV</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-brand-700">Panel Administrador</h1>
        <p className="text-gray-500 text-sm text-center max-w-xs">
          Accedé con tu cuenta de Google para gestionar los productos.
        </p>
        <button onClick={() => signIn('google')} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
          </svg>
          Iniciar sesión con Google
        </button>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-5xl">🚫</div>
        <h2 className="font-display text-xl font-bold text-gray-700">Acceso denegado</h2>
        <p className="text-gray-400 text-sm text-center">
          Tu cuenta no tiene permisos de administrador.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-brand-800">Panel Admin</h1>
            <p className="text-sm text-gray-400">{products.length} productos en total</p>
          </div>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo producto
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="card p-6 mb-8 border border-brand-200">
            <h2 className="font-display font-semibold text-lg text-brand-700 mb-5">
              {editing ? 'Editar producto' : 'Nuevo producto'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Nombre *</label>
                <input
                  className="input-field"
                  placeholder="Ej: Perfume Floral 50ml"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Descripción</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Describe el producto..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Categoría *</label>
                <select
                  className="input-field"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Stock *</label>
                <input
                  type="number"
                  min={0}
                  className="input-field"
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Precio *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">$</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    className="input-field pl-7"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Image */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Imagen</label>
                <div
                  className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-brand-200 bg-brand-50 rounded-xl p-6 cursor-pointer hover:border-brand-400 hover:bg-brand-100 transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  {form.image_url ? (
                    <div className="relative w-32 h-32">
                      <img src={form.image_url} alt="" className="w-full h-full object-cover rounded-xl" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setForm({ ...form, image_url: '' }) }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg className="w-10 h-10 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-brand-400 font-medium">
                        {uploading ? 'Subiendo...' : 'Tocá para subir una imagen'}
                      </p>
                      <p className="text-xs text-gray-400">PNG, JPG, WEBP</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              {/* Featured toggle */}
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, featured: !form.featured })}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    form.featured
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-gray-200 bg-white text-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{form.featured ? '⭐' : '☆'}</span>
                    <div className="text-left">
                      <p className="text-sm font-semibold leading-none">Producto destacado</p>
                      <p className="text-xs mt-0.5 opacity-70">Aparece en el slider de la página principal</p>
                    </div>
                  </div>
                  <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${form.featured ? 'bg-brand-500' : 'bg-gray-200'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={resetForm} className="btn-secondary text-sm py-2 px-5">
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !form.name}
                className="btn-primary text-sm py-2 px-6 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </div>
        )}

        {/* Products list */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="card p-4 animate-pulse flex gap-4">
                <div className="w-16 h-16 bg-brand-100 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-brand-100 rounded-full w-1/2" />
                  <div className="h-3 bg-brand-50 rounded-full w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📦</div>
            <p className="text-gray-400">Todavía no hay productos. ¡Creá el primero!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="card p-4 flex gap-4 items-center">
                {/* Thumb */}
                <div className="w-16 h-16 rounded-xl bg-brand-50 flex-shrink-0 overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{product.name}</p>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">{product.category}</p>
                  <div className="mt-1">
                    {product.stock === 0 ? (
                      <span className="badge-out-of-stock">Sin stock</span>
                    ) : product.stock <= 3 ? (
                      <span className="badge-low-stock">{product.stock} unidades</span>
                    ) : (
                      <span className="badge-in-stock">{product.stock} unidades</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => startEdit(product)}
                    className="p-2 rounded-xl text-brand-500 hover:bg-brand-50 transition-colors"
                    title="Editar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {deleteConfirm === product.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg font-semibold"
                      >
                        Sí, borrar
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(product.id)}
                      className="p-2 rounded-xl text-red-400 hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}