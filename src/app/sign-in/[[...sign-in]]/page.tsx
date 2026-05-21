import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-6">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center justify-center gap-2 mb-8 font-bold text-2xl">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-md">
            P
          </div>
          <span>PRONOVA</span>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-indigo-600 hover:bg-indigo-700 text-sm normal-case rounded-xl",
              card: "shadow-sm border-none rounded-2xl",
              headerTitle: "text-xl font-bold",
              headerSubtitle: "text-gray-500",
              socialButtonsBlockButton: "rounded-xl border-gray-100",
              formFieldInput: "rounded-xl border-gray-100",
            }
          }}
        />
      </div>
    </div>
  );
}
