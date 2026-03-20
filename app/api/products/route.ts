import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createServiceClient, supabase } from '@/lib/supabase'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '').split(',')

// GET - public, returns all products
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page     = Number(searchParams.get('page'))
  const limit    = Number(searchParams.get('limit'))
  const search   = searchParams.get('search')   ?? ''
  const category = searchParams.get('category') ?? 'all'
  const subcategory = searchParams.get('subcategory') ?? 'all'
  const offset   = (page - 1) * limit
  const featured = searchParams.get('featured')

  let query = supabase
  .from('products')
  .select('*', { count: 'exact' })
  .order('created_at', { ascending: false })

  if (page && limit) {
    query = query.range(offset, offset + limit - 1)
  }
  
  if (featured === 'true') query = query.eq('featured', true)
  if (search)               query = query.ilike('name', `%${search}%`)
  if (category !== 'all')   query = query.eq('category', category)
  if (subcategory !== 'all') query = query.eq('subcategory', subcategory)

  const { data, count } = await query
  return NextResponse.json({ products: data, total: count })
}

// Middleware: check admin
async function requireAdmin() {
  const session = await getServerSession()
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return null
  }
  return session
}

// POST - create product
export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const { name, description, category, subcategory, stock, price, image_url, featured } = body

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('products')
    .insert([{ name, description, category, subcategory, stock, price, image_url, featured }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PUT - update product
export async function PUT(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const { id, name, description, category, subcategory, stock, price, image_url, featured } = body

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('products')
    .update({ name, description, category, subcategory, stock, price, image_url, featured })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE - delete product
export async function DELETE(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await req.json()

  const supabase = createServiceClient()
  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
