'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-md">
            <span className="text-white text-xs font-bold">GV</span>
          </div>
          <span className="font-display font-bold text-xl text-brand-700 group-hover:text-brand-500 transition-colors">
            Good Vibes
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-4">
          {session?.user ? (
            <>
              {/* Show admin link only for admins */}
              <Link
                href="/admin"
                className="text-sm font-semibold text-brand-600 hover:text-brand-800 transition-colors"
              >
                Panel Admin
              </Link>
              <div className="flex items-center gap-3">
                <img
                  src={session.user.image ?? '/default-avatar.png'}
                  alt={session.user.name ?? 'Admin'}
                  className="w-8 h-8 rounded-full border-2 border-brand-300"
                />
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-500 hover:text-brand-600 transition-colors"
                >
                  Salir
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="btn-primary text-sm py-2 px-5"
            >
              Admin
            </button>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="sm:hidden p-2 rounded-lg text-brand-600 hover:bg-brand-50 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-brand-100 bg-white px-4 py-4 flex flex-col gap-3">
          {session?.user ? (
            <>
              <div className="flex items-center gap-3 pb-2 border-b border-brand-100">
                <img
                  src={session.user.image ?? '/default-avatar.png'}
                  alt={session.user.name ?? 'Admin'}
                  className="w-9 h-9 rounded-full border-2 border-brand-300"
                />
                <span className="text-sm font-medium text-gray-700">{session.user.name}</span>
              </div>
              <Link
                href="/admin"
                className="text-sm font-semibold text-brand-600"
                onClick={() => setMenuOpen(false)}
              >
                Panel Admin
              </Link>
              <button
                onClick={() => { signOut(); setMenuOpen(false) }}
                className="text-sm text-gray-500 text-left"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <button
              onClick={() => { signIn('google'); setMenuOpen(false) }}
              className="btn-primary text-sm w-full text-center"
            >
              Ingresar como Admin
            </button>
          )}
        </div>
      )}
    </header>
  )
}
