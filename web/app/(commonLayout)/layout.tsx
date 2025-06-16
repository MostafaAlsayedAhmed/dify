import React from 'react'
import type { ReactNode } from 'react'
import SwrInitor from '@/app/components/swr-initor'
import GA, { GaType } from '@/app/components/base/ga'

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <GA gaType={GaType.admin} />
      <SwrInitor>

          {/* <HeaderWrapper> <Header /> </HeaderWrapper> */}

        <div className="flex h-full w-full">
          {children}
        </div>

      </SwrInitor>
    </>
  )
}
export default Layout
