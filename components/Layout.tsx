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
    <div className='flex flex-col min-h-screen bg-bg text-ink'>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content={DESCRIPTION} />
        <meta name="theme-color" content="#E8EAED" />
      </Head>
      <header
        data-focus-fade
        className='transition-opacity duration-300 max-w-[1360px] mx-auto w-full px-8 py-6 flex items-center justify-between gap-6'
      >
        <Link
          href="/"
          className="text-[22px] font-extrabold tracking-[-0.03em] text-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
        >
          Speed<span className="text-accent">Type</span>
        </Link>
        <nav aria-label="Main" className="flex gap-1 p-1 rounded-xl bg-nav-track">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`min-h-[44px] px-[18px] py-[10px] rounded-[9px] text-[15px] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive ? 'bg-surface font-semibold text-ink' : 'font-medium text-ink-2 hover:text-ink'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </header>

      <div className="flex-1 flex flex-col w-full">
        {children}
      </div>

      <footer className="py-4 text-center text-xs text-muted">SpeedType</footer>
    </div>
  )
}

export default Layout
