'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isAdminPage = pathname === '/admin'

  return (
    <header className="sticky top-0 z-50">
      {/* Thin top accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-brand-300 via-brand-500 to-brand-300" />

      <div className="bg-white/90 backdrop-blur-md border-b border-brand-100/60">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">

          {/* Main header row */}
          <div className="flex items-center justify-between h-16 sm:h-20">

            {/* Left decorative element */}
            <div className="hidden sm:flex items-center gap-2 text-brand-300 select-none">
              <span className="text-lg tracking-[0.3em] font-light">✦</span>
            </div>

            {/* Logo — centered absolutely on desktop */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center group"
            >
              <span className="font-display font-bold text-2xl sm:text-3xl tracking-wide text-brand-700 group-hover:text-brand-500 transition-colors duration-300 leading-none">
                Good Vibes
              </span>
              <span className="text-[10px] tracking-[0.35em] uppercase text-brand-400 font-medium mt-0.5 group-hover:text-brand-500 transition-colors duration-300">
                aromas & cuidado
              </span>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-3 ml-auto">
              {isAdminPage ? (
                /* Admin page controls */
                session?.user ? (
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-xs font-semibold text-gray-700 leading-none">{session.user.name}</span>
                      <span className="text-[10px] text-brand-400 leading-none mt-0.5">Administrador</span>
                    </div>
                    <img
                      src={session.user.image ?? ''}
                      alt={session.user.name ?? ''}
                      className="w-8 h-8 rounded-full border-2 border-brand-200"
                    />
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="text-xs text-gray-400 hover:text-brand-600 transition-colors font-medium"
                    >
                      Salir
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => signIn('google')}
                    className="flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-800 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Iniciar sesión
                  </button>
                )
              ) : (
                /* Public page — just a decorative right element */
                <div className="hidden sm:flex items-center gap-2 text-brand-300 select-none">
                  <span className="text-lg tracking-[0.3em] font-light">✦</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  )
}