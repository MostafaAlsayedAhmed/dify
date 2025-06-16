'use client'

import { useMemo, useState } from 'react'
import {
  useRouter,
  useSearchParams,
} from 'next/navigation'
import { useTranslation } from 'react-i18next'
import CreateAppTemplateDialog from '@/app/components/app/create-app-dialog'
import CreateAppModal from '@/app/components/app/create-app-modal'
import { CreateFromDSLModalTab } from '@/app/components/app/create-from-dsl-modal'
import { useProviderContext } from '@/context/provider-context'
import { FilePlus01, FilePlus02 } from '@/app/components/base/icons/src/vender/line/files'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
export type CreateAppCardProps = {
  className?: string
  onSuccess?: () => void
}

const CreateAppCard = (
  {
    ref,
    className,
    onSuccess,
  }: CreateAppCardProps & {
    ref: React.RefObject<HTMLDivElement>;
  },
) => {
  const { t } = useTranslation()
  const { onPlanInfoChanged } = useProviderContext()
  const searchParams = useSearchParams()
  const { replace } = useRouter()
  const dslUrl = searchParams.get('remoteInstallUrl') || undefined

  const [showNewAppTemplateDialog, setShowNewAppTemplateDialog] = useState(false)
  const [showNewAppModal, setShowNewAppModal] = useState(false)
  const [showCreateFromDSLModal, setShowCreateFromDSLModal] = useState(!!dslUrl)
  const [showCreateNewModal, setShowCreateNewModal] = useState(false)

  const activeTab = useMemo(() => {
    if (dslUrl)
      return CreateFromDSLModalTab.FROM_URL

    return undefined
  }, [dslUrl])

  return (
    <>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" className="h-10 rounded-lg bg-neutral-950 px-3 py-2">
            <div className='flex items-center'>
              <PlusIcon className="mr-2 h-6 w-6" />
              {t('app.createApp')}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>

          <DropdownMenuItem asChild className='mb-1 flex w-full cursor-pointer items-center rounded-lg px-6 py-[7px] text-[13px] font-medium leading-[18px] text-text-tertiary hover:bg-state-base-hover hover:text-text-secondary' onClick={() => setShowNewAppModal(true)}>
            <div className='flex items-center'>
              <FilePlus01 className='mr-2 h-4 w-4 shrink-0' />
              {t('app.newApp.startFromBlank')}
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className='flex w-full cursor-pointer items-center rounded-lg px-6 py-[7px] text-[13px] font-medium leading-[18px] text-text-tertiary hover:bg-state-base-hover hover:text-text-secondary' onClick={() => setShowNewAppTemplateDialog(true)}>
            <div className='flex items-center'>
              <FilePlus02 className='mr-2 h-4 w-4 shrink-0' />
              {t('app.newApp.startFromTemplate')}
            </div>
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>

      <CreateAppModal
        show={showNewAppModal}
        onClose={() => setShowNewAppModal(false)}
        onSuccess={() => {
          onPlanInfoChanged()
          if (onSuccess)
            onSuccess()
        }}
        onCreateFromTemplate={() => {
          setShowNewAppTemplateDialog(true)
          setShowNewAppModal(false)
        }}
      />
      <CreateAppTemplateDialog
        show={showNewAppTemplateDialog}
        onClose={() => setShowNewAppTemplateDialog(false)}
        onSuccess={() => {
          onPlanInfoChanged()
          if (onSuccess)
            onSuccess()
        }}
        onCreateFromBlank={() => {
          setShowNewAppModal(true)
          setShowNewAppTemplateDialog(false)
        }}
      />

    </>
  )
}

CreateAppCard.displayName = 'CreateAppCard'
export default CreateAppCard
export { CreateAppCard }
