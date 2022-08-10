import React, { ReactNode } from 'react'
import Link from 'next/link'
import Head from 'next/head'

type Props = {
  children?: ReactNode
  title?: string
}

const Layout = ({ children, title = 'This is the default title' }: Props) => (
  <div className='flex flex-col'>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <div className='flex-1 bg-[#D7E6FA] '>
      <h1 className="m-5 text-3xl font-bold text-blue-400">
        Typing Speed
      </h1>
    </div>

    {children}
    {/* <footer className='fixed bottom-0 left-0 w-full align-bottom'>
      <hr />
      <span>I'm here to stay (Footer)</span>
    </footer> */}
  </div>
)

export default Layout
