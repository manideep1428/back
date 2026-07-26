"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"

// Inline Icon Components for 100% reliability and zero-dependency rendering
function CpuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M15 2v2M9 2v2M15 20v2M9 20v2M20 15h2M20 9h2M2 15h2M2 9h2" />
    </svg>
  )
}

function KeyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="m21 3-9.5 9.5M15.5 7.5l3 3M18 5l2 2" />
    </svg>
  )
}

function GaugeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  )
}

function ReceiptIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M8 8h8M8 12h8M8 16h4" />
    </svg>
  )
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function CopyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function ZapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function ActivityIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}

function SendIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function MessageSquareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export default function Page() {
  const { isSignedIn } = useUser()
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<"claude" | "stream" | "codex">("claude")
  const [agentCount, setAgentCount] = useState(7)
  const [simulating, setSimulating] = useState(false)

  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 59, seconds: 59 })

  useEffect(() => {
    const STORAGE_KEY = "starter_promo_expiry_v1"
    let expiryTime = localStorage.getItem(STORAGE_KEY)
    if (!expiryTime) {
      expiryTime = (Date.now() + 6 * 60 * 60 * 1000).toString()
      localStorage.setItem(STORAGE_KEY, expiryTime)
    }

    const updateTimer = () => {
      const now = Date.now()
      const diff = Math.max(0, parseInt(expiryTime!) - now)

      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft({ hours: h, minutes: m, seconds: s })
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [])

  const isExpired = timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0
  const timerText = `${String(timeLeft.hours).padStart(2, "0")}h ${String(timeLeft.minutes).padStart(2, "0")}m ${String(timeLeft.seconds).padStart(2, "0")}s`

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const simulateRequest = () => {
    setSimulating(true)
    setTimeout(() => {
      setSimulating(false)
      setAgentCount((prev) => prev + 1)
    }, 800)
  }

  const codeExamples = {
    claude: `{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.makethembroke.com/v1/anthropic",
    "ANTHROPIC_API_KEY": "mb-live-q2eqi0t8jf0w7ui6m0xj",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
  },
  "permissions": {
    "allow": [],
    "deny": []
  },
  "model": "claude-opus-5",
  "effortLevel": "max",
  "skipDangerousModePermissionPrompt": true
}`,
    stream: `curl https://api.makethembroke.com/v1/anthropic \\
  -H "Authorization: Bearer mb-live-q2eqi0t8jf0w7ui6m0xj" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-opus-5",
    "messages": [{"role": "user", "content": "Execute agent workflow..."}],
    "stream": true
  }'`,
    codex: `model_provider = "makethembroke"
model = "gpt-5.6-sol"
model_reasoning_effort = "high"
disable_response_storage = true
preferred_auth_method = "apikey"

[model_providers.makethembroke]
name = "makethembroke"
base_url = "https://api.makethembroke.com/v1"
wire_api = "responses"`
  }

  return (
    <div className="min-h-screen bg-[#060609] text-slate-100 selection:bg-purple-500/30 selection:text-purple-200 relative overflow-hidden font-sans">
      {/* Background ambient glow circles */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-purple-900/20 via-indigo-900/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 blur-[150px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#060609]/80 border-b border-white/[0.06] transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-[1px] shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all">
              <div className="w-full h-full bg-[#0d0c15] rounded-[11px] flex items-center justify-center">
                <CpuIcon className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <span className="font-semibold text-lg tracking-tight font-heading text-white">
              MakeThemBroke<span className="text-purple-400">.com</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link href="#product" className="hover:text-white transition-colors">
              Product
            </Link>
            <Link href="/pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#docs" className="hover:text-white transition-colors">
              Docs
            </Link>
            <Link href="#company" className="hover:text-white transition-colors">
              Company
            </Link>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md shadow-purple-900/30"
                >
                  Dashboard
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2">
                    Log in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium bg-white text-slate-950 hover:bg-slate-200 transition-all shadow-md shadow-white/5 active:scale-95">
                    Get started
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24">
        {/* HERO SECTION */}
        <section className="text-center max-w-4xl mx-auto pt-6 pb-16 flex flex-col items-center">
          {/* Announcement pill */}
          {!isExpired && (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-950/40 text-xs font-mono font-medium text-purple-200 mb-8 backdrop-blur-md hover:border-purple-400/50 transition-all cursor-pointer group"
            >
              <span className="bg-amber-400/90 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
                90% OFF
              </span>
              <span>🔥 STARTER TRIAL @ ₹19 FOR $10 CREDITS • EXPIRES IN <strong className="text-amber-300 font-semibold">{timerText}</strong></span>
              <ArrowRightIcon className="w-3.5 h-3.5 text-purple-300 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}

          {/* Hero Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-normal tracking-tight text-white font-heading leading-[1.08] mb-6">
            One API key for <br className="hidden sm:inline" />
            every AI agent<span className="text-purple-500">.</span>
          </h1>

          {/* Hero Subtitle */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl font-light leading-relaxed mb-10">
            <span className="text-slate-200 font-medium">makethembroke.com</span> routes your coding assistants, research agents, and automation through a single account, with managed keys, rolling usage limits, and a real-time cost logger.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-xl shadow-purple-950/50 hover:shadow-purple-900/60 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Go to dashboard</span>
              <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {/* Interactive Code Demo Block */}
          <div className="w-full mt-16 text-left">
            <div className="rounded-2xl border border-white/[0.1] bg-[#0c0b14]/90 backdrop-blur-2xl shadow-2xl shadow-purple-950/30 overflow-hidden relative group">
              {/* Window Bar */}
              <div className="px-5 py-3.5 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  {/* Code Tabs */}
                  <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                    <button
                      onClick={() => setActiveTab("claude")}
                      className={`px-3 py-1 text-xs rounded-md font-mono transition-colors ${
                        activeTab === "claude"
                          ? "bg-purple-600/30 text-purple-200 border border-purple-500/30"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      claude_settings.json
                    </button>
                    <button
                      onClick={() => setActiveTab("stream")}
                      className={`px-3 py-1 text-xs rounded-md font-mono transition-colors ${
                        activeTab === "stream"
                          ? "bg-purple-600/30 text-purple-200 border border-purple-500/30"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      anthropic_stream.sh
                    </button>
                    <button
                      onClick={() => setActiveTab("codex")}
                      className={`px-3 py-1 text-xs rounded-md font-mono transition-colors ${
                        activeTab === "codex"
                          ? "bg-purple-600/30 text-purple-200 border border-purple-500/30"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      codex_config.toml
                    </button>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCopy(codeExamples[activeTab])}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 transition-colors border border-white/[0.05]"
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <CopyIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy snippet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code Snippet Area */}
              <div className="p-6 overflow-x-auto bg-[#090810] font-mono text-sm leading-relaxed text-purple-100">
                <pre className="text-slate-300">
                  <code>{codeExamples[activeTab]}</code>
                </pre>
              </div>

              {/* Live status footer bar inside terminal */}
              <div className="px-5 py-2.5 bg-purple-950/30 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-emerald-400 font-semibold">200 OK</span>
                  <span className="text-slate-500">•</span>
                  <span>14ms latency</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-purple-300">Gateway: makethembroke.com</span>
                </div>
                <button
                  onClick={simulateRequest}
                  disabled={simulating}
                  className="hover:text-purple-300 transition-colors flex items-center gap-1 text-[11px]"
                >
                  <ZapIcon className={`w-3 h-3 text-amber-400 ${simulating ? "animate-spin" : ""}`} />
                  {simulating ? "Routing request..." : "Test route call"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: THE CONTROL PLANE */}
        <section id="product" className="py-24 border-t border-white/[0.06]">
          <div className="text-left mb-16">
            <span className="text-xs font-bold tracking-widest text-purple-400 uppercase font-mono">
              ANY PIPELINE
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white font-heading mt-3 tracking-tight">
              The control plane your agents{" "}
              <span className="italic font-serif font-light text-purple-300">were missing</span>
            </h2>
          </div>

          {/* 3 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Managed keys */}
            <div className="p-8 rounded-2xl border border-white/[0.08] bg-[#0c0b13] hover:border-purple-500/40 transition-all duration-300 group hover:shadow-xl hover:shadow-purple-950/20">
              <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 group-hover:border-purple-400 transition-all">
                <KeyIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3 font-heading">Managed keys</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Create, name, copy, and revoke API keys in seconds. And use them across CLI and web.
              </p>
              <div className="mt-6 pt-4 border-t border-white/[0.05] flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Domain binding</span>
                <span className="text-purple-400">makethembroke.com</span>
              </div>
            </div>

            {/* Card 2: Rolling limits */}
            <div className="p-8 rounded-2xl border border-white/[0.08] bg-[#0c0b13] hover:border-purple-500/40 transition-all duration-300 group hover:shadow-xl hover:shadow-purple-950/20">
              <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 group-hover:border-purple-400 transition-all">
                <GaugeIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3 font-heading">Rolling limits</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Daily, hour, and weekly limits keep usage predictable—hard limits stop runaway calls automatically.
              </p>
              <div className="mt-6 pt-4 border-t border-white/[0.05] flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Circuit breaker</span>
                <span className="text-emerald-400">Auto-shield Active</span>
              </div>
            </div>

            {/* Card 3: Honest ledger */}
            <div className="p-8 rounded-2xl border border-white/[0.08] bg-[#0c0b13] hover:border-purple-500/40 transition-all duration-300 group hover:shadow-xl hover:shadow-purple-950/20">
              <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 group-hover:border-purple-400 transition-all">
                <ReceiptIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3 font-heading">Honest ledger</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Every request logged with tokens, latency, and real cost, so the bill never surprises you.
              </p>
              <div className="mt-6 pt-4 border-t border-white/[0.05] flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Cost precision</span>
                <span className="text-purple-400">Real-time INR/USD</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: REPEATED WORK & LIVE METRICS */}
        <section className="py-20 border-t border-white/[0.06]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <h2 className="text-3xl sm:text-4xl font-normal text-white font-heading leading-tight">
                Built for repeated work, <br />
                not one-off calls.
              </h2>
              <p className="text-slate-400 text-base leading-relaxed">
                <span className="text-slate-200 font-medium">MakeThemBroke</span> is built for real scale: high usage, latency, and limits, designed for top developers using agents every day. Soft pricing, instant digital delivery, and a usage model you can trust.
              </p>
              <div>
                <Link
                  href="#pricing"
                  className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium text-sm transition-colors group"
                >
                  <span>Explore MakeThemBroke vs</span>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Dashboard Stats Card */}
            <div className="lg:col-span-6">
              <div className="p-8 rounded-2xl border border-white/[0.08] bg-[#0b0a12] relative overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between pb-6 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <ActivityIcon className="w-5 h-5 text-purple-400 animate-pulse" />
                    <span className="font-heading font-medium text-white text-sm">
                      Live Dashboard Telemetry
                    </span>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-purple-950/60 text-purple-300 border border-purple-500/20">
                    makethembroke.com
                  </span>
                </div>

                {/* 2x2 Grid Stats */}
                <div className="grid grid-cols-2 gap-6 pt-6">
                  {/* Stat 1 */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="text-4xl font-semibold text-white font-heading tracking-tight mb-1">
                      {agentCount}
                    </div>
                    <div className="text-xs text-slate-400 font-medium">Active agents</div>
                  </div>

                  {/* Stat 2 */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="text-4xl font-semibold text-white font-heading tracking-tight mb-1">
                      1
                    </div>
                    <div className="text-xs text-slate-400 font-medium">API key generated</div>
                  </div>

                  {/* Stat 3 */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="text-3xl font-semibold text-white font-heading tracking-tight mb-1">
                      5h / 7d
                    </div>
                    <div className="text-xs text-slate-400 font-medium">Usage window</div>
                  </div>

                  {/* Stat 4 */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="text-3xl font-semibold text-purple-300 font-heading tracking-tight mb-1">
                      ₹999
                    </div>
                    <div className="text-xs text-slate-400 font-medium">Monthly cap ($12 plan)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: CALL TO ACTION */}
        <section className="py-16">
          <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-b from-[#12101f] to-[#090811] p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl glow-purple">
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white font-heading leading-tight">
                Start routing your agents today
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Create an account, generate a key, and pick an INR-priced plan that fits your coding, research, or automation work.
              </p>
              <div className="pt-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-xl shadow-purple-950/60 transition-all transform hover:scale-105 active:scale-95"
                >
                  Open dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] bg-[#040407] text-slate-400 text-sm pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/[0.06]">
            {/* Left brand column */}
            <div className="md:col-span-5 space-y-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 p-[1px]">
                  <div className="w-full h-full bg-[#0d0c15] rounded-[7px] flex items-center justify-center">
                    <CpuIcon className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
                <span className="font-semibold text-lg tracking-tight font-heading text-white">
                  MakeThemBroke
                </span>
              </Link>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                The unified API gateway for AI agents that scale. Built for developers, students, and teams running autonomous agents every day.
              </p>
              <p className="text-xs text-slate-500">
                Host: <code className="text-purple-300">makethembroke.com</code> • 1 active key
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.05] transition-colors"
                >
                  <SendIcon className="w-3 h-3 text-sky-400" />
                  <span>Join Telegram</span>
                </a>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.05] transition-colors"
                >
                  <MessageSquareIcon className="w-3 h-3 text-indigo-400" />
                  <span>Join Discord</span>
                </a>
              </div>
            </div>

            {/* Nav Columns */}
            <div className="md:col-span-7 grid grid-cols-3 gap-8">
              {/* Product Column */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Product
                </div>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="#product" className="hover:text-white transition-colors">
                      Products
                    </Link>
                  </li>
                  <li>
                    <Link href="#pricing" className="hover:text-white transition-colors">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="#docs" className="hover:text-white transition-colors">
                      Docs
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="hover:text-white transition-colors">
                      Dashboard
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company Column */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Company
                </div>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="#company" className="hover:text-white transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="#learn" className="hover:text-white transition-colors">
                      Learn
                    </Link>
                  </li>
                  <li>
                    <Link href="#business" className="hover:text-white transition-colors">
                      Business
                    </Link>
                  </li>
                  <li>
                    <Link href="#contact" className="hover:text-white transition-colors">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal Column */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Legal
                </div>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="#terms" className="hover:text-white transition-colors">
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link href="#privacy" className="hover:text-white transition-colors">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="#refunds" className="hover:text-white transition-colors">
                      Refunds
                    </Link>
                  </li>
                  <li>
                    <Link href="#cancellation" className="hover:text-white transition-colors">
                      Cancellation
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom copyright line */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div>© 2026 MakeThemBroke. All rights reserved.</div>
            <div className="font-mono text-[11px] text-slate-600">
              All quotes and rates billed in INR (₹) and USD ($)
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
