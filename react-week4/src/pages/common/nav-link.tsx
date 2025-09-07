import type { MouseEvent } from 'react'
import type { ProfilePartial } from '@/libs/supabase'
import { navigate, tw } from '@/utils'
import { Page } from './navigation'

export interface NavigationItem {
  path: Page
  text: string
  authRequired?: boolean
}

interface Props {
  user: ProfilePartial | null
  item: NavigationItem
}

export default function NavLink({ user, item }: Props) {
  const { path, text, authRequired } = item

  const handleLink = (page: Page) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    const aElement = e.target as HTMLAnchorElement
    if (aElement.getAttribute('aria-disabled') === 'true') return

    navigate(page)
  }

  return (
    <a
      href={`/?page=${path}`}
      onClick={handleLink(path)}
      aria-disabled={authRequired ? !user : undefined}
      className={tw(
        'px-4 py-2 rounded border border-gray-300 bg-white',
        'hover:bg-gray-100 transition',
        'aria-disabled:cursor-not-allowed aria-disabled:opacity-50'
      )}
    >
      {text}
    </a>
  )
}
