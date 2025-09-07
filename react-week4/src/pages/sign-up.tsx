import { useForm } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useToggleState } from '@/hooks'
import supabase from '@/libs/supabase'
import { navigate, tw } from '@/utils'

// 폼 입력값 타입 정의
type SignupForm = {
  name: string
  email: string
  password: string
  password2: string
  bio?: string
}

export default function SignUpPage() {
  // 폼 상태, 에러, 제출 상태 등 관리
  const {
    register, // <input>에 상태 등록
    handleSubmit, // 제출 이벤트 핸들러
    watch, // 특정 필드 값 실시간 참조
    formState: { errors, isSubmitting }, // 에러 및 제출 중 상태
    reset, // 폼 초기화 함수
  } = useForm<SignupForm>({
    mode: 'onChange', // 값 변경 시마다 유효성 검사
  })

  // 패스워드 표시/감춤 상태
  const [showPassword1, { toggle: togglePassword1 }] = useToggleState(false)
  const [showPassword2, { toggle: togglePassword2 }] = useToggleState(false)

  // 폼 제출 시, 실행되는 비동기 함수
  const onSubmit = async (formData: SignupForm) => {
    // 폼 제출중에는 실행되지 않도록 설정
    if (isSubmitting) return

    // [실습] Supabase 회원가입 API 호출
    const { error, data } = await supabase.auth.signUp({
      // 필수 신용 정보 (이메일, 패스워드)
      email: formData.email,
      password: formData.password,
      // 선택적으로 메타데이터 추가
      // - 메타데이터 추가 (사용자 이름 및 소개)
      options: {
        data: {
          username: formData.name,
          bio: formData.bio,
        },
      },
    })

    // [실습] 회원가입 API 호출 에러 처리
    if (error) {
      // - toast로 오류 상태 알림
      toast.error(
        `회원가입 인증 오류 발생! [${error.status}:${error.name}:${error.message}]`
      )
    } else {
      // [실습] 회원가입 API 호출 성공 처리
      if (data.user) {
        // - profiles 테이블에 사용자 정보 저장 (오류 발생 시, toast 알림)
        const { error } = await supabase.from('profiles').insert({
          id: data.user.id,
          username: data.user.user_metadata.username,
          email: data.user.user_metadata.email,
          bio: data.user.user_metadata.bio,
          created_at: new Date().toISOString(),
        })

        if (error) {
          toast.error(
            '프로필 테이블 추가 오류 발생! [${error.status}:${error.name}:${error.message}]'
          )
        } else {
          // - toast로 회원가입 성공 메시지 알림
          toast.success('회원가입에 성공했습니다!')
          // 로그인 페이지로 이동 (페이지 변경)
          navigate('signin')
          // - 폼 초기화
          reset()
        }
      }
    }
  }

  // password2 유효성 검증을 위해 password 값을 참조
  const password = watch('password')

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-xl font-bold mb-6 text-center">회원가입</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        aria-label="회원가입 폼"
        autoComplete="off"
        noValidate
      >
        {/* 이름 */}
        <div className="mb-4">
          <label htmlFor="signup-name" className="block font-medium mb-1">
            이름
          </label>
          <input
            id="signup-name"
            type="text"
            autoComplete="off"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'signup-name-error' : undefined}
            {...register('name', { required: '이름을 입력하세요' })}
            className={tw(
              'w-full px-3 py-2 border rounded focus:outline-none focus:ring',
              errors.name
                ? 'border-red-500 ring-red-300'
                : 'border-gray-300 focus:ring-blue-300'
            )}
          />
          {errors.name && (
            <div
              role="alert"
              id="signup-name-error"
              className="text-red-500 text-sm mt-1"
            >
              {errors.name.message}
            </div>
          )}
        </div>
        {/* 이메일 */}
        <div className="mb-4">
          <label htmlFor="signup-email" className="block font-medium mb-1">
            이메일
          </label>
          <input
            type="email"
            id="signup-email"
            autoComplete="off"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'signup-email-error' : undefined}
            {...register('email', {
              required: '이메일을 입력하세요',
              pattern: {
                value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                message: '올바른 이메일 형식이 아닙니다.',
              },
            })}
            className={tw(
              'w-full px-3 py-2 border rounded focus:outline-none focus:ring',
              errors.email
                ? 'border-red-500 ring-red-300'
                : 'border-gray-300 focus:ring-blue-300'
            )}
          />
          {errors.email && (
            <div
              id="signup-email-error"
              className="text-red-500 text-sm mt-1"
              role="alert"
            >
              {errors.email.message}
            </div>
          )}
        </div>
        {/* 사용자 소개 (bio) */}
        <div className="mb-4">
          <label htmlFor="signup-bio" className="block font-medium mb-1">
            소개 (선택)
          </label>
          <textarea
            id="signup-bio"
            autoComplete="off"
            aria-describedby={errors.bio ? 'signup-bio-error' : undefined}
            {...register('bio')}
            rows={3}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring border-gray-300 focus:ring-blue-300 resize-none"
            placeholder="자신을 간단히 소개해 주세요"
          />
          {errors.bio && (
            <div
              id="signup-bio-error"
              className="text-red-500 text-sm mt-1"
              role="alert"
            >
              {errors.bio.message}
            </div>
          )}
        </div>
        {/* 패스워드 */}
        <div className="mb-4">
          <label htmlFor="signup-password" className="block font-medium mb-1">
            패스워드
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword1 ? 'text' : 'password'}
              autoComplete="off"
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password ? 'signup-password-error' : undefined
              }
              {...register('password', {
                required: '패스워드를 입력하세요.',
                minLength: {
                  value: 6,
                  message: '6자 이상 입력하세요.',
                },
                validate: (value: string) => {
                  if (!/[a-z]/.test(value))
                    return '영문 소문자가 하나 이상 포함되어야 합니다.'
                  if (!/[A-Z]/.test(value))
                    return '영문 대문자가 하나 이상 포함되어야 합니다.'
                  if (!/[0-9]/.test(value))
                    return '숫자가 하나 이상 포함되어야 합니다.'
                },
              })}
              className={tw(
                'w-full px-3 py-2 border rounded focus:outline-none focus:ring pr-12',
                errors.password
                  ? 'border-red-500 ring-red-300'
                  : 'border-gray-300 focus:ring-blue-300'
              )}
            />
            {/* 표시/감춤 버튼 */}
            <button
              type="button"
              aria-label={showPassword1 ? '패스워드 감춤' : '패스워드 표시'}
              title={showPassword1 ? '패스워드 감춤' : '패스워드 표시'}
              aria-pressed={showPassword1}
              className="cursor-pointer absolute right-2 top-2 px-2 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none focus:ring focus:ring-blue-300"
              onClick={togglePassword1}
            >
              {showPassword1 ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          {errors.password && (
            <div
              id="signup-password-error"
              className="text-red-500 text-sm mt-1"
              role="alert"
            >
              {errors.password.message}
            </div>
          )}
        </div>
        {/* 패스워드 확인 */}
        <div className="mb-4">
          <label htmlFor="signup-password2" className="block font-medium mb-1">
            패스워드 확인
          </label>
          <div className="relative">
            <input
              id="signup-password2"
              type={showPassword2 ? 'text' : 'password'}
              autoComplete="off"
              aria-invalid={!!errors.password2}
              aria-describedby={
                errors.password2 ? 'signup-password2-error' : undefined
              }
              {...register('password2', {
                required: '패스워드 확인을 입력하세요',
                validate: (v) =>
                  v === password || '패스워드가 일치하지 않습니다',
              })}
              className={tw(
                'w-full px-3 py-2 border rounded focus:outline-none focus:ring pr-12',
                errors.password2
                  ? 'border-red-500 ring-red-300'
                  : 'border-gray-300 focus:ring-blue-300'
              )}
            />
            {/* 표시/감춤 버튼 */}
            <button
              type="button"
              aria-label={showPassword2 ? '패스워드 감춤' : '패스워드 표시'}
              title={showPassword2 ? '패스워드 감춤' : '패스워드 표시'}
              aria-pressed={showPassword2}
              className="cursor-pointer absolute right-2 top-2 px-2 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none focus:ring focus:ring-blue-300"
              onClick={togglePassword2}
            >
              {showPassword2 ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          {errors.password2 && (
            <div
              id="signup-password2-error"
              className="text-red-500 text-sm mt-1"
              role="alert"
            >
              {errors.password2.message}
            </div>
          )}
        </div>
        <button
          type="submit"
          aria-disabled={isSubmitting}
          className={tw(
            'cursor-pointer',
            'w-full bg-blue-600 text-white py-2 rounded transition',
            'hover:bg-blue-700',
            'aria-disabled:cursor-not-allowed aria-disabled:opacity-50'
          )}
        >
          {isSubmitting ? '가입 중...' : '회원가입'}
        </button>
      </form>
    </div>
  )
}
