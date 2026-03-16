'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''
const CATALOG_BAGUES_URL = process.env.NEXT_PUBLIC_CATALOG_BAGUES_URL ?? '#'
const CATALOG_BAGUES_UNLOCK_URL = process.env.NEXT_PUBLIC_CATALOG_BAGUES_UNLOCK_URL ?? '#'

const WHATSAPP_MESSAGE = encodeURIComponent('Hola! Quiero consultar sobre un producto 🌸')
const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isAdminPage = pathname === '/admin'

  const [catalogOpen, setCatalogOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCatalogOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50">
      {/* Thin top accent bar */}
      <div className="h-0.5 bg-linear-to-r from-brand-300 via-brand-500 to-brand-300" />

      <div className="bg-white/90 backdrop-blur-md border-b border-brand-100/60">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">

          {/* Main header row */}
          <div className="flex items-center justify-between px-2 sm:px-0 h-16 sm:h-20">

            {/* Left decorative element */}
            <div className="hidden sm:flex items-center gap-2 text-brand-300 select-none">
              <span className="text-lg tracking-[0.3em] font-light">✦</span>
            </div>

            {/* Logo — centered on desktop */}
            <Link
              href="/"
              className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 flex flex-col items-center group"
            >
              <span className="font-display font-bold text-2xl sm:text-3xl tracking-wide text-brand-700 group-hover:text-brand-500 transition-colors duration-300 leading-none">
                Good Vibes
              </span>
              <span className="text-[10px] tracking-[0.35em] uppercase text-brand-400 font-medium mt-0.5 group-hover:text-brand-500 transition-colors duration-300">
                aromas & cuidado
              </span>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-1 sm:gap-2 ml-auto">
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
                /* Public page — WhatsApp + Revista dropdown */
                <>
                  {/* WhatsApp contact button */}
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-full text-sm font-semibold text-white bg-[#25D366] hover:bg-[#1ebe5d] active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
                    aria-label="Contactar por WhatsApp"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="hidden sm:inline">Contacto</span>
                  </a>

                  {/* Revista dropdown */}
                  <div ref={dropdownRef} className="relative">
                    <button
                      onClick={() => setCatalogOpen((prev) => !prev)}
                      className="flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-full text-sm font-semibold text-brand-600 border border-brand-200 hover:bg-brand-50 hover:border-brand-400 active:scale-95 transition-all duration-200"
                      aria-label="Ver revistas de campaña"
                      aria-expanded={catalogOpen}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="hidden sm:inline">Revista</span>
                      <svg
                        className={`w-3 h-3 shrink-0 transition-transform duration-200 ${catalogOpen ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown panel */}
                    {catalogOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-brand-100 overflow-hidden z-50">
                        <div className="px-3 py-2 border-b border-brand-50">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-400">
                            Campaña actual
                          </span>
                        </div>
                        <a
                          href={CATALOG_BAGUES_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setCatalogOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors duration-150"
                        >
                          <span className="text-base">📖</span>
                          <span className="font-medium">Bagues</span>
                        </a>
                        <a
                          href={CATALOG_BAGUES_UNLOCK_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setCatalogOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors duration-150"
                        >
                          <span className="text-base">🔓</span>
                          <span className="font-medium">Bagues Unlock</span>
                        </a>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  )
}