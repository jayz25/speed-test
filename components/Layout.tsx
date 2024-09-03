import React, { ReactNode } from 'react'
import Head from 'next/head'

type Props = {
  children?: ReactNode
  title?: string
}

const Layout = ({ children, title = 'This is the default title' }: Props) => (
  <div className='flex flex-col h-screen'>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <div className='flex-.2 bg-[#525252] '>
      <h1 className="m-5 pt-5 pl-10 text-3xl font-bold text-[#FFD523]">
        SpeedType
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
