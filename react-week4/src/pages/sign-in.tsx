import { useForm } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useToggleState } from '@/hooks'
import supabase from '@/libs/supabase'
import { navigate } from '@/utils'

type LoginForm = {
  email: string
  password: string
}

export default function SignInPage() {
  // 폼 상태, 에러, 제출 상태 등 관리
  const {
    register, // <input>에 상태 등록
    handleSubmit, // 제출 이벤트 핸들러
    formState: { errors, isSubmitting }, // 에러 및 제출 중 상태
    reset, // 폼 초기화 함수
  } = useForm<LoginForm>({
    mode: 'onChange', // 값 변경 시마다 유효성 검사
  })

  // 패스워드 표시/감춤 상태
  const [showPassword, { toggle }] = useToggleState(false)

  // 폼 제출 시, 실행되는 비동기 함수
  const onSubmit = async (formData: LoginForm) => {
    // 폼 제출 중에는 실행되지 않도록 설정
    if (isSubmitting) return

    // [실습] Supabase 로그인 API 호출
    const { error, data } = await supabase.auth.signInWithPassword(formData)

    // [실습] 로그인 API 호출 에러 처리
    if (error) {
      // - toast로 오류 상태 알림
      toast.error(
        `로그인 오류 발생! ${error.status}:${error.name}:${error.message}`
      )
    } else {
      // [실습] 로그인 API 호출 성공 처리
      if (data.user) {
        const { username } = data.user.user_metadata
        // - toast로 로그인 성공 메시지 알림 및 프로필 페이지 이동 액션 추가
        toast.success(`${username}님! 로그인이 성공되었습니다.`, {
          action: {
            label: '프로필 페이지로 이동',
            onClick: () => {
              navigate('profile')
              // - 폼 초기화
              reset()
            },
          },
        })
      }
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-xl font-bold mb-6 text-center">로그인</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        aria-label="로그인 폼"
        autoComplete="off"
        noValidate
      >
        <div className="mb-4">
          <label htmlFor="login-email" className="block font-medium mb-1">
            이메일
          </label>
          <input
            type="text"
            id="login-email"
            autoComplete="off"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            // 필수 입력 유효성 검사
            {...register('email', {
              required: '이름 또는 이메일을 입력하세요',
            })}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
              errors.email
                ? 'border-red-500 ring-red-300'
                : 'border-gray-300 focus:ring-blue-300'
            }`}
          />
          {errors.email && (
            <div
              id="login-email-error"
              className="text-red-500 text-sm mt-1"
              role="alert"
            >
              {errors.email.message}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="login-password" className="block font-medium mb-1">
            패스워드
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'} // 타입 토글
              autoComplete="off"
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password ? 'login-password-error' : undefined
              }
              {...register('password', {
                required: '패스워드를 입력하세요',
              })}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                errors.password
                  ? 'border-red-500 ring-red-300'
                  : 'border-gray-300 focus:ring-blue-300'
              }`}
            />
            <button
              type="button"
              onClick={toggle}
              className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition focus:outline-none focus:ring focus:ring-blue-300"
              aria-label={showPassword ? '패스워드 숨기기' : '패스워드 표시'}
              title={showPassword ? '패스워드 숨기기' : '패스워드 표시'}
            >
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          {errors.password && (
            <div
              id="login-password-error"
              className="text-red-500 text-sm mt-1"
              role="alert"
            >
              {errors.password.message}
            </div>
          )}
        </div>
        <button
          type="submit"
          aria-disabled={isSubmitting} // 제출 중일 때 비활성화
          className="cursor-pointer w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
        >
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  )
}
