import React, { ReactNode } from 'react'
import Head from 'next/head'
import { Navbar } from './Navbar'

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
    <div className='bg-[#D7E6FA]'>
        <Navbar />
    </div>

    {children}
    {/* <footer className='fixed bottom-0 left-0 w-full align-bottom'>
      <hr />
      <span>I'm here to stay (Footer)</span>
    </footer> */}
  </div>
)

export default Layout;
