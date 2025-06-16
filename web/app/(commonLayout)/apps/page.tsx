'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  useRouter,
} from 'next/navigation'
import useSWRInfinite from 'swr/infinite'
import { useTranslation } from 'react-i18next'
import { useDebounceFn } from 'ahooks'
import {
  RiExchange2Line,
  RiRobot3Line,
} from '@remixicon/react'
import AppCard from './AppCard'
import NewAppCard from './NewAppCard'
import useAppsQueryState from './hooks/useAppsQueryState'
import type { AppListResponse } from '@/models/app'
import { fetchAppList } from '@/service/apps'
import { useAppContext } from '@/context/app-context'
import { NEED_REFRESH_APP_LIST_KEY } from '@/config'
import { CheckModal } from '@/hooks/use-pay'
import { useTabSearchParams } from '@/hooks/use-tab-searchparams'
import Input from '@/app/components/base/input'
import { useStore as useTagStore } from '@/app/components/base/tag-management/store'
import TagManagementModal from '@/app/components/base/tag-management'
import { useEducationInit } from '@/app/education-apply/hooks'

const getKey = (
  pageIndex: number,
  previousPageData: AppListResponse,
  activeTab: string,
  isCreatedByMe: boolean,
  tags: string[],
  keywords: string,
) => {
  if (!pageIndex || previousPageData.has_more) {
    const params: any = { url: 'apps', params: { page: pageIndex + 1, limit: 30, name: keywords, is_created_by_me: isCreatedByMe } }

    if (activeTab !== 'all')
      params.params.mode = activeTab
    else
      delete params.params.mode

    if (tags.length)
      params.params.tag_ids = tags

    return params
  }
  return null
}

const AgentsList = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { isCurrentWorkspaceEditor, isCurrentWorkspaceDatasetOperator } = useAppContext()
  const showTagManagementModal = useTagStore(s => s.showTagManagementModal)
  const [activeTab, setActiveTab] = useTabSearchParams({
    defaultTab: 'agent-chat',
  })
  const { query: { tagIDs = [], keywords = '', isCreatedByMe: queryIsCreatedByMe = false }, setQuery } = useAppsQueryState()
  const [isCreatedByMe, setIsCreatedByMe] = useState(queryIsCreatedByMe)
  const [tagFilterValue, setTagFilterValue] = useState<string[]>(tagIDs)
  const [searchKeywords, setSearchKeywords] = useState(keywords)
  const newAppCardRef = useRef<HTMLDivElement>(null)
  const setKeywords = useCallback((keywords: string) => {
    setQuery(prev => ({ ...prev, keywords }))
  }, [setQuery])
  const setTagIDs = useCallback((tagIDs: string[]) => {
    setQuery(prev => ({ ...prev, tagIDs }))
  }, [setQuery])

  const { data, isLoading, error, setSize, mutate } = useSWRInfinite(
    (pageIndex: number, previousPageData: AppListResponse) => getKey(pageIndex, previousPageData, activeTab, isCreatedByMe, tagIDs, searchKeywords),
    fetchAppList,
    {
      revalidateFirstPage: true,
      shouldRetryOnError: false,
      dedupingInterval: 500,
      errorRetryCount: 3,
    },
  )

  const anchorRef = useRef<HTMLDivElement>(null)
  const options = [
    { value: 'agent-chat', text: t('app.types.agents'), icon: <RiRobot3Line className='mr-1 h-[14px] w-[14px]' /> },
    { value: 'workflow', text: t('app.types.workflows'), icon: <RiExchange2Line className='mr-1 h-[14px] w-[14px]' /> },
    // { value: 'all', text: t('app.types.all'), icon: <RiApps2Line className='mr-1 h-[14px] w-[14px]' /> },
    // { value: 'advanced-chat', text: t('app.types.advanced'), icon: <RiMessage3Line className='mr-1 h-[14px] w-[14px]' /> },
    // { value: 'chat', text: t('app.types.chatbot'), icon: <RiMessage3Line className='mr-1 h-[14px] w-[14px]' /> },
    // { value: 'completion', text: t('app.types.completion'), icon: <RiFile4Line className='mr-1 h-[14px] w-[14px]' /> },
  ]

  useEffect(() => {
    if (localStorage.getItem(NEED_REFRESH_APP_LIST_KEY) === '1') {
      localStorage.removeItem(NEED_REFRESH_APP_LIST_KEY)
      mutate()
    }
  }, [mutate, t])

  useEffect(() => {
    if (isCurrentWorkspaceDatasetOperator)
      return router.replace('/datasets')
  }, [router, isCurrentWorkspaceDatasetOperator])

  useEffect(() => {
    const hasMore = data?.at(-1)?.has_more ?? true
    let observer: IntersectionObserver | undefined

    if (error) {
      if (observer)
        observer.disconnect()
      return
    }

    if (anchorRef.current) {
      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoading && !error && hasMore)
          setSize((size: number) => size + 1)
      }, { rootMargin: '100px' })
      observer.observe(anchorRef.current)
    }
    return () => observer?.disconnect()
  }, [isLoading, setSize, anchorRef, mutate, data, error])

  const { run: handleSearch } = useDebounceFn(() => {
    setSearchKeywords(keywords)
  }, { wait: 500 })
  const handleKeywordsChange = (value: string) => {
    setKeywords(value)
    handleSearch()
  }

  const { run: handleTagsUpdate } = useDebounceFn(() => {
    setTagIDs(tagFilterValue)
  }, { wait: 500 })
  const handleTagsChange = (value: string[]) => {
    setTagFilterValue(value)
    handleTagsUpdate()
  }

  const handleCreatedByMeChange = useCallback(() => {
    const newValue = !isCreatedByMe
    setIsCreatedByMe(newValue)
    setQuery(prev => ({ ...prev, isCreatedByMe: newValue }))
  }, [isCreatedByMe, setQuery])
  useEducationInit()

  return (
    <div className='relative m-3 mt--20 flex grow flex-col overflow-y-auto rounded-xl bg-white p-3'>
      <div className='sticky top-0 z-10 flex flex-wrap items-center justify-between rounded-xl px-3 leading-[56px]'>
        <div className='text-lg font-medium'>
          My Agents
        </div>
        <div className='flex items-center gap-2'>
          <Input
            showLeftIcon
            showClearIcon
            wrapperClassName='w-[310px]'
            className='border border-neutral-200 bg-white py-[11px]'
            value={keywords}
            onChange={e => handleKeywordsChange(e.target.value)}
            onClear={() => handleKeywordsChange('')}
          />

          {isCurrentWorkspaceEditor && <NewAppCard ref={newAppCardRef} className='z-10' onSuccess={mutate} />}

        </div>
      </div>

      {(data && data[0].total > 0)
        ? <div className='relative mx-3 my-3 grid grow grid-cols-1 content-start gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3'>
          {data.map(({ data: apps }) =>
            apps.map(app => (
              <AppCard key={app.id} app={app} onRefresh={mutate} />
            )),
          )}
        </div>
        : <div className='relative mx-1 my-3 grid h-[calc(100vh-200px)] grow grid-cols-1 content-start gap-4 overflow-hidden rounded-md sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3'> <NoAppsFound />  </div>
      }

      <CheckModal />

      <div ref={anchorRef} className='h-0'> </div>
      {showTagManagementModal && (
        <TagManagementModal type='app' show={showTagManagementModal} />
      )}
    </div>
  )
}

export default AgentsList

function NoAppsFound() {
  const { t } = useTranslation()
  function renderDefaultCard() {
    const defaultCards = Array.from({ length: 36 }, (_, index) => (
      <div key={index} className='inline-flex h-[160px] rounded-xl bg-background-default-lighter'></div>
    ))
    return defaultCards
  }
  return (
    <>
      {renderDefaultCard()}
      <div className='absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-gradient-to-t from-background-body to-transparent'>
        <span className='system-md-medium text-text-tertiary'>{t('app.newApp.noAppsFound')}</span>
      </div>
    </>
  )
}
