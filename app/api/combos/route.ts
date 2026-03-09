import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createServiceClient } from '@/lib/supabase'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL!

// Middleware: check admin
async function requireAdmin() {
  const session = await getServerSession()
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return null
  }
  return session
}

// GET — devuelve todos los combos con sus productos
export async function GET() {
  const supabase = createServiceClient()

  const { data: combos, error } = await supabase
    .from('combos')
    .select(`
      *,
      combo_products (
        product:products (*)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Aplanar la relación para que products sea un array directo
  const result = combos.map((combo: any) => ({
    ...combo,
    products: combo.combo_products.map((cp: any) => cp.product),
  }))

  return NextResponse.json(result)
}

// POST — crear combo con sus productos
export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { name, description, image_url, featured, product_ids } = await req.json()
  const supabase = createServiceClient()

  const { data: combo, error } = await supabase
    .from('combos')
    .insert([{ name, description, image_url, featured }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Relacionar productos
  if (product_ids?.length > 0) {
    const relations = product_ids.map((pid: string) => ({
      combo_id: combo.id,
      product_id: pid,
    }))
    const { error: relError } = await supabase.from('combo_products').insert(relations)
    if (relError) return NextResponse.json({ error: relError.message }, { status: 500 })
  }

  return NextResponse.json(combo)
}

// PUT — actualizar combo y sus productos
export async function PUT(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id, name, description, image_url, featured, product_ids } = await req.json()
  const supabase = createServiceClient()

  const { data: combo, error } = await supabase
    .from('combos')
    .update({ name, description, image_url, featured })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Reemplazar relaciones: borrar las viejas y crear las nuevas
  await supabase.from('combo_products').delete().eq('combo_id', id)

  if (product_ids?.length > 0) {
    const relations = product_ids.map((pid: string) => ({
      combo_id: id,
      product_id: pid,
    }))
    const { error: relError } = await supabase.from('combo_products').insert(relations)
    if (relError) return NextResponse.json({ error: relError.message }, { status: 500 })
  }

  return NextResponse.json(combo)
}

// DELETE — borrar combo (los combo_products se borran en cascada)
export async function DELETE(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await req.json()
  const supabase = createServiceClient()

  const { error } = await supabase.from('combos').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}