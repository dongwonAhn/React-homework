import type { ProfilePartial } from '@/libs/supabase'
import { tw } from '@/utils'
import NavLink, { type NavigationItem } from './nav-link'

export type Page = 'signin' | 'signup' | 'profile'

const PAGES: NavigationItem[] = [
  { path: 'signup', text: '회원가입' },
  { path: 'signin', text: '로그인' },
  { path: 'profile', text: '프로필', authRequired: true },
]

interface Props {
  user: ProfilePartial | null
}

export default function Navigation({ user }: Props) {
  return (
    <nav aria-label="메인 내비게이션">
      <ul className={tw('flex gap-4 justify-center mt-6 mb-4')}>
        {PAGES.map((page) => (
          <li key={page.path}>
            <NavLink user={user} item={page} />
          </li>
        ))}
      </ul>
    </nav>
  )
}
