'use client'
import { usePathname } from 'next/navigation'
import s from './index.module.css'
import classNames from '@/utils/classnames'

type HeaderWrapperProps = {
  children: React.ReactNode
}

const HeaderWrapper = ({
  children,
}: HeaderWrapperProps) => {
  const pathname = usePathname()

  return (
    <div className='absolute right-[60px] top-3 w-[240px] rounded-2xl border border-[darkgray]'>
      <div className={classNames(
        'sticky top-0 left-0 right-0 z-30 flex flex-col grow-0 shrink-0 basis-auto min-h-[56px]',
        s.header,
      )} >  {children}    </div>
    </div>
  )
}
export default HeaderWrapper
