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
      title: "Complete ~/.claude/settings.json Configuration",
      desc: "Create or edit ~/.claude/settings.json in your home directory with your MakeThemBroke API key, endpoint URL, and chosen model.",
      code: `{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.makethembroke.com/v1/anthropic",
    "ANTHROPIC_API_KEY": "${activeKey}",
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
      lang: "json",
      note: os === "windows"
        ? `Windows path: C:\\Users\\YOUR_USER\\.claude\\settings.json. Supported models for "model": "claude-opus-5" (default), "claude-sonnet-5", "claude-opus-4.8", "gpt-5.6-sol", "gpt-5.6-luna", "auto".`
        : `Mac/Linux path: ~/.claude/settings.json. Supported models for "model": "claude-opus-5" (default), "claude-sonnet-5", "claude-opus-4.8", "gpt-5.6-sol", "gpt-5.6-luna", "auto".`,
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
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0b0a13]">
        <h3 className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider mb-4">
          Live Model Token Rates (Cost per 1M Tokens)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-purple-500/30 bg-[#090812]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-heading font-medium text-white">claude-opus-5</span>
              <span className="text-[10px] font-mono text-purple-300 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 font-bold">
                DEFAULT
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 leading-relaxed">
              In: <strong className="text-slate-200">$5.00</strong> / 1M | Out: <strong className="text-slate-200">$25.00</strong> / 1M
              <br />
              Context: <strong className="text-purple-300">1M window</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl border border-white/[0.06] bg-[#08070e]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-heading font-medium text-white">claude-sonnet-5</span>
              <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                1M Context
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 leading-relaxed">
              In: <strong className="text-slate-200">$3.00</strong> / 1M | Out: <strong className="text-slate-200">$15.00</strong> / 1M
              <br />
              Routing: <strong className="text-purple-300">/v1/anthropic</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl border border-white/[0.06] bg-[#08070e]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-heading font-medium text-white">claude-opus-4.8</span>
              <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                1M Context
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 leading-relaxed">
              In: <strong className="text-slate-200">$5.00</strong> / 1M | Out: <strong className="text-slate-200">$25.00</strong> / 1M
              <br />
              Routing: <strong className="text-purple-300">/v1/anthropic</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl border border-white/[0.06] bg-[#08070e]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-heading font-medium text-white">gpt-5.6-sol</span>
              <span className="text-[10px] font-mono text-amber-300 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/20">
                Reasoning
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 leading-relaxed">
              In: <strong className="text-slate-200">$5.00</strong> / 1M | Out: <strong className="text-slate-200">$15.00</strong> / 1M
              <br />
              Context: <strong className="text-amber-300">272k window</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl border border-white/[0.06] bg-[#08070e]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-heading font-medium text-white">gpt-5.6-luna</span>
              <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/20">
                Economical
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 leading-relaxed">
              In: <strong className="text-slate-200">$1.50</strong> / 1M | Out: <strong className="text-slate-200">$6.00</strong> / 1M
              <br />
              Context: <strong className="text-emerald-400">272k window</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl border border-white/[0.06] bg-[#08070e]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-heading font-medium text-white">auto</span>
              <span className="text-[10px] font-mono text-slate-300 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                Auto-Select
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 leading-relaxed">
              In: <strong className="text-slate-200">$3.00</strong> / 1M | Out: <strong className="text-slate-200">$12.00</strong> / 1M
              <br />
              Routing: <strong className="text-slate-300">Optimal Choice</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Client Picker Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setActiveTab("claude")}
          className={`p-6 rounded-2xl border text-left transition-all ${activeTab === "claude"
            ? "bg-white/[0.04] border-purple-500/40 text-white"
            : "bg-[#0b0a13] border-white/[0.08] hover:border-white/[0.2] text-slate-400"
            }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold font-mono">
                CC
              </div>
              <div>
                <h3 className="font-heading text-lg text-white font-medium">Claude Code</h3>
                <p className="text-xs text-purple-300 font-mono">/v1/anthropic</p>
              </div>
            </div>
            {activeTab === "claude" && (
              <span className="w-2 h-2 rounded-full bg-purple-400" />
            )}
          </div>
          <p className="text-xs text-slate-400">
            Official Anthropic CLI streamed responses through MakeThemBroke gateway.
          </p>
        </button>

        <button
          onClick={() => setActiveTab("codex")}
          className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden ${activeTab === "codex"
            ? "bg-amber-950/20 border-amber-500/40 text-white"
            : "bg-[#0b0a13] border-white/[0.08] hover:border-amber-500/30 text-slate-400"
            }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold font-mono">
                CX
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-lg text-white font-medium">Codex CLI</h3>
                  <span className="text-[9px] font-mono text-amber-300 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 font-bold uppercase">
                    🚧 UNDER CONSTRUCTION
                  </span>
                </div>
                <p className="text-xs text-amber-400/80 font-mono">/v1/openai (Frozen)</p>
              </div>
            </div>
            {activeTab === "codex" && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </div>
          <p className="text-xs text-slate-400">
            OpenAI Codex gateway endpoint is currently under construction and frozen.
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
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono capitalize transition-all ${os === platform
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
        {activeTab === "codex" && (
          <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-950/20 text-center space-y-2 mb-8">
            <div className="text-2xl">🚧</div>
            <h3 className="text-lg font-heading font-medium text-white">Codex CLI Gateway Under Construction</h3>
            <p className="text-xs text-slate-400 max-w-xl mx-auto font-sans leading-relaxed">
              The OpenAI / Codex endpoint (<code className="text-amber-300 font-mono">/v1/openai</code>) is currently frozen and under construction. Please use <strong>Claude Code</strong> (<code className="text-purple-300 font-mono">/v1/anthropic</code>) which is 100% operational!
            </p>
          </div>
        )}

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
