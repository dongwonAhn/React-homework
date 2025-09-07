import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import supabase, { type ProfilePartial } from '@/libs/supabase'
import { navigate } from '@/utils'

interface Props {
  user: ProfilePartial | null
}

type ProfileForm = {
  username: string
  bio?: string | null
}

export default function ProfilePage({ user }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ProfileForm>({
    defaultValues: {
      username: user?.username ?? '',
      bio: user?.bio ?? '',
    },
  })

  // id로 profiles 조회 -> 폼 초기값 세팅
  useEffect(() => {
    const load = async () => {
      if (!user?.id) return
      const { data, error } = await supabase
        .from('profiles')
        .select('username, bio')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        toast.error('프로필 정보를 불러오지 못했습니다.')
        return
      }

      reset({
        username: data?.username ?? user.username ?? '',
        bio: data?.bio ?? '',
      })
    }
    load()
  }, [user?.id, user?.username, reset])

  const onSubmit = async (form: ProfileForm) => {
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !authUser)
        throw authError ?? new Error('로그인이 필요합니다.')

      const { error } = await supabase
        .from('profiles')
        .update({
          username: form.username,
          bio: form.bio ?? null,
        })
        .eq('id', authUser.id)

      if (error) throw error
      toast.success('프로필이 저장되었어요.')
      reset(form)
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : '프로필 저장 중 오류가 발생했어요.'
      toast.error(msg)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-xl font-bold mb-6 text-center">프로필</h2>
      {user ? (
        <div>
          <div className="mb-2">
            <span className="font-medium">이름:</span> {user.username || '-'}
          </div>
          <div className="mb-2">
            <span className="font-medium">이메일:</span> {user.email}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div>
              <label className="block mb-1 font-medium">
                이름
                <input
                  className="w-full px-3 py-2 border rounded mt-1"
                  {...register('username', { required: '이름을 입력하세요.' })}
                />
              </label>
            </div>

            <div>
              <label className="block mb-1 font-medium">
                소개
                <textarea
                  className="w-full px-3 py-2 border rounded mt-1"
                  rows={3}
                  {...register('bio')}
                  placeholder="자기소개를 입력하세요."
                />
              </label>
            </div>

            <button
              type="submit"
              aria-disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded transition hover:bg-blue-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
            >
              {isSubmitting ? '저장 중...' : '프로필 저장'}
            </button>
          </form>

          <button
            onClick={async () => {
              const { error } = await supabase.auth.signOut()
              if (!error) {
                toast.success('성공적으로 로그아웃 되었습니다.')
                navigate('signin')
              } else {
                toast.error(`로그아웃 오류 발생! ${error.message}`)
              }
            }}
            className="w-full mt-4 bg-gray-200 py-2 rounded hover:bg-gray-300 transition"
          >
            로그아웃
          </button>
        </div>
      ) : (
        <div className="text-center text-gray-500">
          프로필을 보려면 로그인이 필요합니다.
        </div>
      )}
    </div>
  )
}
