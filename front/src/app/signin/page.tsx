import Link from "next/link";

export default function SigninPage() {
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <Link href="/" className="text-7xl font-bold text-gray-900 mb-8 hover:text-blue-600 transition-colors">NoTI</Link>
            <div className="w-full max-w-sm">
                <form className="flex flex-col bg-white p-8 rounded-lg shadow-md">
                    <label className="text-gray-700 font-medium mb-1">ID</label>
                    <input 
                        type="text" 
                        className="border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <label className="text-gray-700 font-medium mb-1">Password</label>
                    <input 
                        type="password" 
                        className="border border-gray-300 rounded-lg p-3 mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <Link
                        href="/home"
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors"
                    >
                        로그인
                    </Link>
                </form>
                <div className="text-center mt-4">
                    <Link href="/forgot-password" className="text-blue-600 hover:text-blue-800">
                        비밀번호를 잊으셨나요?
                    </Link>
                </div>
            </div>
        </div>
    );
}