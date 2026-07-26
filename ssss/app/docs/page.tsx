"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import DashboardLayout from "../dashboard/layout"

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

export function DocsContent() {
  const [activeTab, setActiveTab] = useState<"claude" | "codex">("claude")
  const [os, setOs] = useState<"windows" | "mac" | "linux">("windows")
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const keys = useQuery(api.apiKeys.listKeys)
  const activeKey = keys?.find((k) => k.status === "active")?.key || "mb-live-YOUR_API_KEY"

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  interface DocStep {
    num: string
    title: string
    desc: string
    code: string
    lang?: string
    note?: string
    isKey?: boolean
  }

  const claudeSteps: DocStep[] = [
    {
      num: "01",
      title: "Install Claude Code CLI",
      desc: "Install the official Anthropic Claude CLI tool globally via npm.",
      code: "npm install -g @anthropic-ai/claude-code",
      lang: "bash",
    },
    {
      num: "02",
      title: "Get your MakeThemBroke API Key",
      desc: "Copy your active live key from your dashboard. It authenticates every streaming request.",
      code: activeKey,
      isKey: true,
      note: "Keep your API key secure. It is checked against your Convex credit balance in real-time.",
    },
    {
      num: "03",
      title: "Configure Environment Variables",
      desc: "Set MakeThemBroke's base URL and endpoint to route Claude Code.",
      code: os === "windows"
        ? `$env:ANTHROPIC_BASE_URL="https://api.makethembroke.com/v1"\n$env:ANTHROPIC_API_KEY="${activeKey}"`
        : `export ANTHROPIC_BASE_URL="https://api.makethembroke.com/v1"\nexport ANTHROPIC_API_KEY="${activeKey}"`,
      lang: os === "windows" ? "powershell" : "bash",
      note: "Routes streaming requests to https://api.makethembroke.com/v1/anthropic.",
    },
    {
      num: "04",
      title: "Launch Claude Code Agent",
      desc: "Navigate to your project repository and launch Claude Code through MakeThemBroke.",
      code: "cd path/to/your-project\nclaude",
      lang: "bash",
    },
  ]

  const codexSteps: DocStep[] = [
    {
      num: "01",
      title: "Install Codex CLI",
      desc: "Install Node.js LTS first, then install Codex from PowerShell or Terminal.",
      code: "node --version\nnpm install -g @openai/codex",
      note: "Keep your codebase inside a standard workspace folder.",
    },
    {
      num: "02",
      title: "Get your MakeThemBroke API Key",
      desc: "Copy your active API key from the dashboard.",
      code: activeKey,
      isKey: true,
    },
    {
      num: "03",
      title: "Create auth.json & config.toml",
      desc: "Save configuration files to connect Codex to MakeThemBroke's OpenAI streaming gateway.",
      code: `model_provider = "makethembroke"
model = "gpt-5.6-sol"
model_reasoning_effort = "high"
disable_response_storage = true
preferred_auth_method = "apikey"

[model_providers.makethembroke]
name = "makethembroke"
base_url = "https://api.makethembroke.com/v1"
wire_api = "responses"`,
      lang: "toml",
      note: "Routes streaming requests through https://api.makethembroke.com/v1/openai.",
    },
    {
      num: "04",
      title: "Launch Codex Agent",
      desc: "Verify your installation and launch Codex.",
      code: "codex -V\ncd path/to/your-project\ncodex",
      lang: "bash",
    },
  ]

  const activeSteps = activeTab === "claude" ? claudeSteps : codexSteps

  return (
    <div className="max-w-5xl mx-auto space-y-12 font-sans">
      {/* Header */}
      <div>
        <span className="text-xs font-bold tracking-widest text-purple-400 uppercase font-mono block mb-2">
          DOCUMENTATION & API REFERENCE
        </span>
        <h1 className="text-4xl font-normal text-white font-heading tracking-tight mb-3">
          Connect AI Agents to MakeThemBroke
        </h1>
        <p className="text-slate-400 text-base font-light leading-relaxed">
          Route <strong className="text-white">Claude Code</strong> and <strong className="text-white">Codex CLI</strong> through the MakeThemBroke API Gateway. Real-time credit validation & streaming token tracking powered by Convex.
        </p>
      </div>

      {/* Pricing Cards Banner */}
      <div className="p-6 rounded-2xl border border-purple-500/30 bg-purple-950/20 backdrop-blur-md">
        <h3 className="text-sm font-mono font-bold text-purple-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>⚡</span> Live Model Pricing Schedule
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0a0812]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-heading font-medium text-white">Opus 5</span>
              <span className="text-[10px] font-mono text-purple-400 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30">
                /v1/anthropic
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">
              Input: <strong className="text-emerald-400">$5.00</strong> / 1M tokens
              <br />
              Output: <strong className="text-purple-300">$25.00</strong> / 1M tokens
            </p>
          </div>

          <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0a0812]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-heading font-medium text-white">GPT-5.6-Sol</span>
              <span className="text-[10px] font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
                /v1/openai
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">
              Input: <strong className="text-emerald-400">$5.00</strong> / 1M tokens
              <br />
              Output: <strong className="text-amber-300">$15.00</strong> / 1M tokens
            </p>
          </div>
        </div>
      </div>

      {/* Client Picker Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setActiveTab("claude")}
          className={`p-6 rounded-2xl border text-left transition-all ${
            activeTab === "claude"
              ? "bg-purple-950/30 border-purple-500/50 shadow-xl shadow-purple-950/40 ring-1 ring-purple-500/30"
              : "bg-[#0c0b13] border-white/[0.08] hover:border-purple-500/30"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold font-mono">
                CC
              </div>
              <div>
                <h3 className="font-heading text-lg text-white font-medium">Claude Code</h3>
                <p className="text-xs text-purple-400 font-mono">/v1/anthropic</p>
              </div>
            </div>
            {activeTab === "claude" && (
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
            )}
          </div>
          <p className="text-xs text-slate-400">
            Official Anthropic CLI streamed responses through MakeThemBroke gateway.
          </p>
        </button>

        <button
          onClick={() => setActiveTab("codex")}
          className={`p-6 rounded-2xl border text-left transition-all ${
            activeTab === "codex"
              ? "bg-purple-950/30 border-purple-500/50 shadow-xl shadow-purple-950/40 ring-1 ring-purple-500/30"
              : "bg-[#0c0b13] border-white/[0.08] hover:border-purple-500/30"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-900/40 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold font-mono">
                CX
              </div>
              <div>
                <h3 className="font-heading text-lg text-white font-medium">Codex CLI</h3>
                <p className="text-xs text-amber-400 font-mono">/v1/openai</p>
              </div>
            </div>
            {activeTab === "codex" && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            )}
          </div>
          <p className="text-xs text-slate-400">
            OpenAI & GPT-5.6-sol agent setup with streaming response routing.
          </p>
        </button>
      </div>

      {/* OS Selector */}
      <div className="flex items-center gap-2 pb-6 border-b border-white/[0.06]">
        <span className="text-xs font-mono text-slate-500 mr-2">OS Platform:</span>
        {(["windows", "mac", "linux"] as const).map((platform) => (
          <button
            key={platform}
            onClick={() => setOs(platform)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono capitalize transition-all ${
              os === platform
                ? "bg-white/10 text-white border border-white/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {platform === "mac" ? "macOS" : platform}
          </button>
        ))}
      </div>

      {/* Steps Walkthrough */}
      <div className="space-y-12">
        {activeSteps.map((step, idx) => (
          <div key={idx} className="flex gap-6 group">
            <div className="flex-shrink-0">
              <span className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/30 text-purple-300 font-mono text-sm font-bold flex items-center justify-center shadow-lg">
                {step.num}
              </span>
            </div>

            <div className="flex-grow space-y-3">
              <h3 className="text-xl font-medium text-white font-heading">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>

              <div className="rounded-xl border border-white/[0.08] bg-[#090810] overflow-hidden relative group/code">
                <div className="px-4 py-2 bg-white/[0.03] border-b border-white/[0.05] flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-500">
                    {step.lang || "bash"}
                  </span>
                  <button
                    onClick={() => copyToClipboard(step.code, idx)}
                    className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <CopyIcon className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-xs font-mono text-purple-200 leading-relaxed">
                  <code>{step.code}</code>
                </pre>
              </div>

              {step.note && (
                <p className="text-xs text-slate-400 bg-white/[0.02] p-3 rounded-lg border border-white/[0.05] font-sans">
                  💡 <span className="text-slate-300">{step.note}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <section className="pt-12 border-t border-white/[0.06]">
        <h2 className="text-2xl font-normal text-white font-heading mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-white/[0.06] bg-[#090810]">
            <h4 className="text-base font-medium text-white font-heading mb-2">
              How are credits deducted?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every request calculates exact input and output token counts during streaming. Costs are deducted directly from your Convex account balance based on model pricing ($5/M input, $25/M output for Opus 5; $5/M input, $15/M output for GPT-5.6-Sol).
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/[0.06] bg-[#090810]">
            <h4 className="text-base font-medium text-white font-heading mb-2">
              What is the API base URL?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              The public API gateway base URL is <code className="text-purple-300">https://api.makethembroke.com/v1</code>. Endpoint routes include <code className="text-purple-300">/v1/anthropic</code> for Claude Code and <code className="text-purple-300">/v1/openai</code> for Codex.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function DocsPage() {
  return (
    <DashboardLayout>
      <DocsContent />
    </DashboardLayout>
  )
}
