import { SignUp } from "@clerk/nextjs"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#060609] text-slate-100 flex flex-col items-center justify-center p-6 relative font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-900/20 blur-[120px] pointer-events-none -z-10" />

      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="font-bold text-xl tracking-tight text-white font-heading">
          MakeThemBroke<span className="text-purple-400">.com</span>
        </span>
      </Link>

      <div className="w-full max-w-md bg-[#0c0b14]/90 border border-white/[0.08] p-4 rounded-2xl shadow-2xl shadow-purple-950/40 backdrop-blur-xl">
        <SignUp
          appearance={{
            elements: {
              card: "bg-transparent shadow-none border-none",
              headerTitle: "text-white font-heading",
              headerSubtitle: "text-slate-400",
              socialButtonsBlockButton: "bg-white/[0.05] border-white/[0.08] text-white hover:bg-white/[0.1]",
              formButtonPrimary: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500",
              formFieldLabel: "text-slate-300",
              formFieldInput: "bg-white/[0.04] border-white/[0.08] text-white",
              footerActionLink: "text-purple-400 hover:text-purple-300",
            },
          }}
        />
      </div>
    </div>
  )
}
