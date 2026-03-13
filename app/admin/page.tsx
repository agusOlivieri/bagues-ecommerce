'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import { Product, Combo, CATEGORIES, PERFUME_BRANDS } from '@/types'

type ProductFormData = {
  name: string
  description: string
  category: string
  brand: string | null
  stock: number
  price: number
  image_url: string
  featured: boolean
}

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? ''

const emptyProductForm: ProductFormData = {
  name: '',
  description: '',
  category: 'perfume',
  brand: null,
  stock: 0,
  price: 0,
  image_url: '',
  featured: false,
}

const emptyComboForm = {
  name: '',
  description: '',
  image_url: '',
  featured: false,
  product_ids: [] as string[],
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<'products' | 'combos'>('products')

  // Products state
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productForm, setProductForm] = useState<ProductFormData>(emptyProductForm)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [deleteProductConfirm, setDeleteProductConfirm] = useState<string | null>(null)

  // Combos state
  const [combos, setCombos] = useState<Combo[]>([])
  const [loadingCombos, setLoadingCombos] = useState(true)
  const [comboForm, setComboForm] = useState(emptyComboForm)
  const [editingCombo, setEditingCombo] = useState<string | null>(null)
  const [showComboForm, setShowComboForm] = useState(false)
  const [deleteComboConfirm, setDeleteComboConfirm] = useState<string | null>(null)

  // Shared
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const comboFileRef = useRef<HTMLInputElement>(null)

  const isAdmin = session?.user?.email === ADMIN_EMAIL

  useEffect(() => {
    if (isAdmin) {
      fetchProducts()
      fetchCombos()
    }
  }, [isAdmin])

  // ─── Products ────────────────────────────────────────────
  async function fetchProducts() {
    setLoadingProducts(true)
    const res = await fetch('/api/products')
    setProducts(await res.json())
    setLoadingProducts(false)
  }

  async function handleProductImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const { url } = await res.json()
    setProductForm((f) => ({ ...f, image_url: url }))
    setUploading(false)
  }

  async function handleProductSubmit() {
    setSaving(true)
    const method = editingProduct ? 'PUT' : 'POST'
    const body = editingProduct ? { ...productForm, id: editingProduct } : productForm
    await fetch('/api/products', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    await fetchProducts()
    resetProductForm()
    setSaving(false)
  }

  async function handleDeleteProduct(id: string) {
    await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setDeleteProductConfirm(null)
    fetchProducts()
  }

  function startEditProduct(p: Product) {
    setProductForm({
      name: p.name,
      description: p.description ?? '',
      category: p.category,
      brand: p.brand ?? null,
      stock: p.stock,
      price: p.price ?? 0,
      image_url: p.image_url ?? '',
      featured: p.featured ?? false,
    })
    setEditingProduct(p.id)
    setShowProductForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetProductForm() {
    setProductForm(emptyProductForm)
    setEditingProduct(null)
    setShowProductForm(false)
  }

  // ─── Combos ──────────────────────────────────────────────
  async function fetchCombos() {
    setLoadingCombos(true)
    const res = await fetch('/api/combos')
    setCombos(await res.json())
    setLoadingCombos(false)
  }

  async function handleComboImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const { url } = await res.json()
    setComboForm((f) => ({ ...f, image_url: url }))
    setUploading(false)
  }

  async function handleComboSubmit() {
    setSaving(true)
    const method = editingCombo ? 'PUT' : 'POST'
    const body = editingCombo ? { ...comboForm, id: editingCombo } : comboForm
    await fetch('/api/combos', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    await fetchCombos()
    resetComboForm()
    setSaving(false)
  }

  async function handleDeleteCombo(id: string) {
    await fetch('/api/combos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setDeleteComboConfirm(null)
    fetchCombos()
  }

  function startEditCombo(c: Combo) {
    setComboForm({
      name: c.name,
      description: c.description ?? '',
      image_url: c.image_url ?? '',
      featured: c.featured ?? false,
      product_ids: c.products?.map((p) => p.id) ?? [],
    })
    setEditingCombo(c.id)
    setShowComboForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetComboForm() {
    setComboForm(emptyComboForm)
    setEditingCombo(null)
    setShowComboForm(false)
  }

  function toggleProductInCombo(productId: string) {
    setComboForm((f) => ({
      ...f,
      product_ids: f.product_ids.includes(productId)
        ? f.product_ids.filter((id) => id !== productId)
        : [...f.product_ids, productId],
    }))
  }

  // ─── Auth guards ─────────────────────────────────────────
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
        <div className="w-16 h-16 rounded-full bg-linear-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">GV</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-brand-700">Panel Administrador</h1>
        <p className="text-gray-500 text-sm text-center max-w-xs">
          Accedé con tu cuenta de Google para gestionar los productos.
        </p>
        <button onClick={() => signIn('google')} className="btn-primary flex items-center gap-2">
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
        <p className="text-gray-400 text-sm text-center">Tu cuenta no tiene permisos de administrador.</p>
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
            <p className="text-sm text-gray-400">
              {products.length} productos · {combos.length} combos
            </p>
          </div>
          {activeTab === 'products' && !showProductForm && (
            <button onClick={() => setShowProductForm(true)} className="btn-primary text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo producto
            </button>
          )}
          {activeTab === 'combos' && !showComboForm && (
            <button onClick={() => setShowComboForm(true)} className="btn-primary text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo combo
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-brand-50 p-1 rounded-xl mb-6 w-fit">
          <button
            onClick={() => { setActiveTab('products'); resetProductForm(); resetComboForm() }}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'products' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-400 hover:text-brand-600'}`}>
            📦 Productos
          </button>
          <button
            onClick={() => { setActiveTab('combos'); resetProductForm(); resetComboForm() }}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'combos' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-400 hover:text-brand-600'}`}>
            🎁 Combos
          </button>
        </div>

        {/* ══════════════ PRODUCTS TAB ══════════════ */}
        {activeTab === 'products' && (
          <>
            {showProductForm && (
              <div className="card p-6 mb-8 border border-brand-200">
                <h2 className="font-display font-semibold text-lg text-brand-700 mb-5">
                  {editingProduct ? 'Editar producto' : 'Nuevo producto'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Nombre *</label>
                    <input className="input-field" placeholder="Ej: Perfume Floral 50ml"
                      value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Descripción</label>
                    <textarea className="input-field resize-none" rows={3} placeholder="Describe el producto..."
                      value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Categoría *</label>
                    <select className="input-field" value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value, brand: null })}>
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.emoji} {cat.label}</option>
                      ))}
                    </select>
                  </div>
                  {productForm.category === 'perfume' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Marca</label>
                      <select className="input-field" value={productForm.brand || ''}
                        onChange={(e) => setProductForm({ ...productForm, brand: e.target.value === '' ? null : e.target.value })}>
                        {PERFUME_BRANDS.map((b) => (
                          <option key={b.value} value={b.value || ''}>{b.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Stock *</label>
                    <input type="number" min={0} className="input-field" placeholder="0"
                      value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Precio *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">$</span>
                      <input type="number" min={0} step={0.01} className="input-field pl-7" placeholder="0.00"
                        value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Imagen</label>
                    <div className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-brand-200 bg-brand-50 rounded-xl p-6 cursor-pointer hover:border-brand-400 hover:bg-brand-100 transition-colors"
                      onClick={() => fileRef.current?.click()}>
                      {productForm.image_url ? (
                        <div className="relative w-32 h-32">
                          <img src={productForm.image_url} alt="" className="w-full h-full object-cover rounded-xl" />
                          <button type="button"
                            onClick={(e) => { e.stopPropagation(); setProductForm({ ...productForm, image_url: '' }) }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">✕</button>
                        </div>
                      ) : (
                        <>
                          <svg className="w-10 h-10 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-brand-400 font-medium">{uploading ? 'Subiendo...' : 'Tocá para subir una imagen'}</p>
                          <p className="text-xs text-gray-400">PNG, JPG, WEBP</p>
                        </>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleProductImageUpload} />
                  </div>
                  <div className="sm:col-span-2">
                    <button type="button" onClick={() => setProductForm({ ...productForm, featured: !productForm.featured })}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        productForm.featured ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-500'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{productForm.featured ? '⭐' : '☆'}</span>
                        <div className="text-left">
                          <p className="text-sm font-semibold leading-none">Producto destacado</p>
                          <p className="text-xs mt-0.5 opacity-70">Aparece en el slider de la página principal</p>
                        </div>
                      </div>
                      <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${productForm.featured ? 'bg-brand-500' : 'bg-gray-200'}`}>
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${productForm.featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </div>
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 mt-6 justify-end">
                  <button onClick={resetProductForm} className="btn-secondary text-sm py-2 px-5">Cancelar</button>
                  <button onClick={handleProductSubmit} disabled={saving || !productForm.name} className="btn-primary text-sm py-2 px-6 disabled:opacity-50">
                    {saving ? 'Guardando...' : editingProduct ? 'Guardar cambios' : 'Crear producto'}
                  </button>
                </div>
              </div>
            )}

            {loadingProducts ? (
              <div className="space-y-3">
                {[1,2,3].map((i) => (
                  <div key={i} className="card p-4 animate-pulse flex gap-4">
                    <div className="w-16 h-16 bg-brand-100 rounded-xl shrink-0" />
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
                    <div className="w-16 h-16 rounded-xl bg-brand-50 shrink-0 overflow-hidden">
                      {product.image_url
                        ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><span className="text-2xl">📦</span></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{product.name}</p>
                      <p className="text-xs text-gray-400 capitalize mt-0.5">
                        {product.brand ? `${product.category} · ${product.brand}` : product.category}
                      </p>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        {product.stock === 0 ? <span className="badge-out-of-stock">Sin stock</span>
                          : product.stock <= 3 ? <span className="badge-low-stock">{product.stock} u.</span>
                          : <span className="badge-in-stock">{product.stock} u.</span>}
                        {product.price > 0 && <span className="text-brand-600 font-bold text-sm">${product.price.toLocaleString('es-AR')}</span>}
                        {product.featured && <span className="text-xs">⭐</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => startEditProduct(product)} className="p-2 rounded-xl text-brand-500 hover:bg-brand-50 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {deleteProductConfirm === product.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleDeleteProduct(product.id)} className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg font-semibold">Sí, borrar</button>
                          <button onClick={() => setDeleteProductConfirm(null)} className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteProductConfirm(product.id)} className="p-2 rounded-xl text-red-400 hover:bg-red-50 transition-colors">
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
          </>
        )}

        {/* ══════════════ COMBOS TAB ══════════════ */}
        {activeTab === 'combos' && (
          <>
            {showComboForm && (
              <div className="card p-6 mb-8 border border-brand-200">
                <h2 className="font-display font-semibold text-lg text-brand-700 mb-5">
                  {editingCombo ? 'Editar combo' : 'Nuevo combo'}
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Nombre *</label>
                    <input className="input-field" placeholder="Ej: Kit Verano Floral"
                      value={comboForm.name} onChange={(e) => setComboForm({ ...comboForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Descripción</label>
                    <textarea className="input-field resize-none" rows={3} placeholder="Describe el combo..."
                      value={comboForm.description} onChange={(e) => setComboForm({ ...comboForm, description: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Imagen del combo</label>
                    <div className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-brand-200 bg-brand-50 rounded-xl p-6 cursor-pointer hover:border-brand-400 hover:bg-brand-100 transition-colors"
                      onClick={() => comboFileRef.current?.click()}>
                      {comboForm.image_url ? (
                        <div className="relative w-32 h-32">
                          <img src={comboForm.image_url} alt="" className="w-full h-full object-cover rounded-xl" />
                          <button type="button"
                            onClick={(e) => { e.stopPropagation(); setComboForm({ ...comboForm, image_url: '' }) }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">✕</button>
                        </div>
                      ) : (
                        <>
                          <svg className="w-10 h-10 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-brand-400 font-medium">{uploading ? 'Subiendo...' : 'Tocá para subir una imagen'}</p>
                          <p className="text-xs text-gray-400">PNG, JPG, WEBP</p>
                        </>
                      )}
                    </div>
                    <input ref={comboFileRef} type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleComboImageUpload} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Productos del combo
                      <span className="ml-2 text-brand-400 font-normal">({comboForm.product_ids.length} seleccionados)</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                      {products.map((p) => {
                        const selected = comboForm.product_ids.includes(p.id)
                        return (
                          <button key={p.id} type="button" onClick={() => toggleProductInCombo(p.id)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all text-left ${
                              selected ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-brand-200'}`}>
                            <div className="w-10 h-10 rounded-lg bg-brand-100 shrink-0 overflow-hidden">
                              {p.image_url
                                ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-700 truncate">{p.name}</p>
                              <p className="text-xs text-gray-400 capitalize">{p.category}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full shrink-0 border-2 flex items-center justify-center ${
                              selected ? 'bg-brand-500 border-brand-500' : 'border-gray-300'}`}>
                              {selected && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <button type="button" onClick={() => setComboForm({ ...comboForm, featured: !comboForm.featured })}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                      comboForm.featured ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-500'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{comboForm.featured ? '⭐' : '☆'}</span>
                      <div className="text-left">
                        <p className="text-sm font-semibold leading-none">Combo destacado</p>
                        <p className="text-xs mt-0.5 opacity-70">Aparece en el slider de la página principal</p>
                      </div>
                    </div>
                    <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${comboForm.featured ? 'bg-brand-500' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${comboForm.featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  </button>
                </div>
                <div className="flex gap-3 mt-6 justify-end">
                  <button onClick={resetComboForm} className="btn-secondary text-sm py-2 px-5">Cancelar</button>
                  <button onClick={handleComboSubmit} disabled={saving || !comboForm.name} className="btn-primary text-sm py-2 px-6 disabled:opacity-50">
                    {saving ? 'Guardando...' : editingCombo ? 'Guardar cambios' : 'Crear combo'}
                  </button>
                </div>
              </div>
            )}

            {loadingCombos ? (
              <div className="space-y-3">
                {[1,2].map((i) => (
                  <div key={i} className="card p-4 animate-pulse flex gap-4">
                    <div className="w-16 h-16 bg-brand-100 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-brand-100 rounded-full w-1/2" />
                      <div className="h-3 bg-brand-50 rounded-full w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : combos.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">🎁</div>
                <p className="text-gray-400">Todavía no hay combos. ¡Creá el primero!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {combos.map((combo) => (
                  <div key={combo.id} className="card p-4 flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl bg-brand-50 shrink-0 overflow-hidden">
                      {combo.image_url
                        ? <img src={combo.image_url} alt={combo.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><span className="text-2xl">🎁</span></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800 truncate">{combo.name}</p>
                        {combo.featured && <span className="text-xs">⭐</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {combo.products && combo.products.length > 0
                          ? `${combo.products.length} productos: ${combo.products.map(p => p.name).join(', ')}`
                          : 'Sin productos asignados'}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => startEditCombo(combo)} className="p-2 rounded-xl text-brand-500 hover:bg-brand-50 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {deleteComboConfirm === combo.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleDeleteCombo(combo.id)} className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg font-semibold">Sí, borrar</button>
                          <button onClick={() => setDeleteComboConfirm(null)} className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteComboConfirm(combo.id)} className="p-2 rounded-xl text-red-400 hover:bg-red-50 transition-colors">
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
          </>
        )}
      </div>
    </div>
  )
}