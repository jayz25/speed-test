import React, { ReactNode } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

type Props = {
  children?: ReactNode
  title?: string
}

const DEFAULT_TITLE = 'SpeedType'
const DESCRIPTION = 'SpeedType: a minimal typing speed test with live WPM, accuracy and a global leaderboard.'

const NAV_LINKS = [
  { href: '/', label: 'Test' },
  { href: '/stats', label: 'Stats' },
] as const

const Layout = ({ children, title = DEFAULT_TITLE }: Props) => {
  const { pathname } = useRouter()
  return (
    <div className='flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white'>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content={DESCRIPTION} />
        <meta name="theme-color" content="#0f172a" />
      </Head>
      <header
        data-focus-fade
        className='h-16 flex items-center justify-between px-4 sm:px-10 border-b border-white/5 bg-black/20'
      >
        <Link
          href="/"
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FFD523] to-[#FFB000] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD523]"
        >
          SpeedType
        </Link>
        <nav aria-label="Main" className="flex gap-6 text-sm font-medium">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD523] ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center py-10 px-4 w-full">
        {children}
      </main>

      <footer className="py-4 text-center text-xs text-slate-600">SpeedType</footer>
    </div>
  )
}

export default Layout
