import { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import type { JSX } from 'react/jsx-runtime'
import { toast } from 'sonner'
import { usePageQuery } from '@/hooks'
import Navigation, { type Page } from '@/pages/common/navigation'
import supabase, { type ProfilePartial } from './libs/supabase'
import ProfilePage from './pages/profile'
import SignInPage from './pages/sign-in'
import SignUpPage from './pages/sign-up'

const getUser = async (user: User) => {
  return supabase
    .from('profiles')
    .select('username, email, bio')
    .eq('id', user.id)
    .single()
}

export default function AppPage() {
  const page = usePageQuery<Page>('signup')
  const [user, setUser] = useState<ProfilePartial | null>(null)

  // 부수효과 처리: 외부 시스템과 리액트 앱 동기화
  useEffect(() => {
    // [실습] 최초 마운트 시, Supabase에서 현재 사용자 정보 가져오기
    supabase.auth.getUser().then(async ({ error, data }) => {
      if (!error) {
        // 인증된 사용자 정보 가져오기에 성공! (auth: 회원가입/로그인할 때 사용자 정보 사용)
        // 프로필 테이블에서 데이터 필터링해 가져오기 시도 (profiles: 사용자 정보 관리(추가/수정/삭제) 테이블)
        const { error: userProfileError, data: userProfile } = await getUser(
          data.user
        )

        if (userProfileError) {
          toast.error(
            `프로필 데이터 가져오기 오류 발생! ${userProfileError.message}`
          )
        } else {
          setUser(userProfile)
        }
      }
    })

    // [실습] Supabase 인증 상태 변경 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      switch (event) {
        case 'SIGNED_IN': {
          const user = session?.user
          if (user) {
            const { data } = await getUser(user)
            setUser(data)
          }
          break
        }
        case 'SIGNED_OUT':
          setUser(null)
          break
      }
    })

    return () => {
      // [실습] Supabase 인증 구독 해제
      subscription.unsubscribe()
    }
  }, [])

  let renderPage: JSX.Element | null = null

  switch (page) {
    case 'signin':
      renderPage = <SignInPage />
      break
    case 'signup':
      renderPage = <SignUpPage />
      break
    case 'profile':
      renderPage = <ProfilePage user={user} />
      break
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="py-6 bg-white shadow">
        <h1 className="text-2xl font-bold text-center">Supabase 인증</h1>
      </header>
      <Navigation user={user} />
      <main>{renderPage}</main>
    </div>
  )
}
