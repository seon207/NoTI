import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-7xl font-bold text-gray-900 mb-4">NoTI</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">이것은 아주 멋진 설명입니다.</p>
      <div className="flex flex-col items-center gap-6 w-full max-w-xs">
        <Link
          href="/signin"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg w-full text-center font-medium hover:bg-blue-700 transition-colors"
        >
          로그인
        </Link>
        <div className="text-gray-600">
          아직 계정이 없으신가요?{' '}
          <Link href="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}