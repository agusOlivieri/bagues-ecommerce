import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createServiceClient } from '@/lib/supabase'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL!

// GET - public, returns all products
export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// Middleware: check admin
async function requireAdmin() {
  const session = await getServerSession()
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return null
  }
  return session
}

// POST - create product
export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const { name, description, category, brand, stock, price, image_url, featured } = body

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('products')
    .insert([{ name, description, category, brand: brand || null, stock, price, image_url, featured }])
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
  const { id, name, description, category, brand, stock, price, image_url, featured } = body

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('products')
    .update({ name, description, category, brand: brand || null, stock, price, image_url, featured })
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
