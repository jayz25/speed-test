import React, { ReactNode } from 'react'
import Head from 'next/head'

type Props = {
  children?: ReactNode
  title?: string
}

const Layout = ({ children, title = 'This is the default title' }: Props) => (
  <div className='flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white'>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <header className='h-16 flex items-center px-10 border-b border-white/5 bg-black/20'>
      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FFD523] to-[#FFB000]">
        SpeedType
      </h1>
    </header>

    <main className="flex-1 flex flex-col justify-center items-center py-10 w-full">
      {children}
    </main>
  </div>
)

export default Layout
