"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export default function DashboardUsagePage() {
  const stats = useQuery(api.stats.getUserStats) || {
    plan: "No Plan",
    bonusUsd: 2.5,
    balanceUsd: 0.0,
    usage5h: 0.0,
    usageWeekly: 0.0,
    requestsWeekly: 0,
    tokensWeekly: 0,
  }

  const logs = useQuery(api.stats.getLogs) || []

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-normal text-white font-heading tracking-tight">Usage</h1>
        <p className="text-xs text-slate-400 font-light mt-1">
          Rate limits and weekly totals on the {stats.plan} plan.
        </p>
      </div>

      {/* Top 2 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0c0b13] flex items-center justify-between">
          <div>
            <div className="text-3xl font-semibold text-white font-heading tracking-tight">
              ${(stats.bonusUsd + stats.balanceUsd).toFixed(2)}
            </div>
            <div className="text-xs text-slate-400 mt-1">Bonus + balance</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
            💳
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0c0b13] flex items-center justify-between">
          <div>
            <div className="text-3xl font-semibold text-white font-heading tracking-tight">
              ${stats.usage5h.toFixed(2)}
            </div>
            <div className="text-xs text-slate-400 mt-1">5h allowance</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
            ⏱️
          </div>
        </div>
      </div>

      {/* Rate Limits Box */}
      <div className="p-8 rounded-2xl border border-white/[0.08] bg-[#0c0b13] space-y-6">
        <div>
          <h2 className="text-base font-medium text-white font-heading">Rate limits</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{stats.plan} plan</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-y border-white/[0.06]">
          {/* Gauge 1: 5-hour included */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-28 h-28 rounded-full border-4 border-purple-500/20 border-t-purple-500 flex items-center justify-center relative">
              <span className="text-xl font-bold text-white font-heading">0%</span>
              <span className="text-[10px] text-slate-500 block font-mono">USED</span>
            </div>
            <div>
              <div className="text-sm font-medium text-white font-heading">5-hour Included</div>
              <div className="text-xs text-slate-400 font-mono">$0.00 / $0.00</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">Resets in 2h 57m</div>
            </div>
          </div>

          {/* Gauge 2: Weekly included */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-28 h-28 rounded-full border-4 border-purple-500/20 border-t-purple-500 flex items-center justify-center relative">
              <span className="text-xl font-bold text-white font-heading">0%</span>
              <span className="text-[10px] text-slate-500 block font-mono">USED</span>
            </div>
            <div>
              <div className="text-sm font-medium text-white font-heading">Weekly Included</div>
              <div className="text-xs text-slate-400 font-mono">$0.00 / $0.00</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">Resets in 2d 1h</div>
            </div>
          </div>
        </div>
      </div>

      {/* How usage works */}
      <div className="p-8 rounded-2xl border border-white/[0.08] bg-[#0c0b13] space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-white font-heading">How usage works</h3>
          <span className="text-xs font-mono px-3 py-1 rounded bg-white/[0.04] border border-white/[0.06] text-slate-400">
            PLAN: <strong className="text-purple-300">{stats.plan}</strong>
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Each request is priced by model and tokens. MakeThemBroke first uses your included plan allowance, then bonus credits, then paid balance when the active allowance is exhausted.
        </p>

        {/* Progress Bar & Breakdown */}
        <div className="space-y-4 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-medium">Active allowance</span>
            <span className="text-slate-500">Available right now: <strong className="text-white">$0.00</strong></span>
          </div>

          <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full bg-purple-500 w-0" />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center pt-2">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-sm font-semibold text-white font-mono">$0.00</div>
              <div className="text-[10px] text-slate-500 uppercase font-mono mt-0.5">5H LEFT</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-sm font-semibold text-white font-mono">$0.00</div>
              <div className="text-[10px] text-slate-500 uppercase font-mono mt-0.5">WEEK LEFT</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-sm font-semibold text-purple-300 font-mono">$2.50</div>
              <div className="text-[10px] text-slate-500 uppercase font-mono mt-0.5">BONUS + BALANCE</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Weekly Metric Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0c0b13]">
          <div className="text-2xl font-mono text-slate-500 mb-2">#</div>
          <div className="text-3xl font-semibold text-white font-heading">{stats.requestsWeekly}</div>
          <div className="text-xs text-slate-400 mt-1 font-mono">Requests • weekly</div>
        </div>

        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0c0b13]">
          <div className="text-2xl font-mono text-slate-500 mb-2">📦</div>
          <div className="text-3xl font-semibold text-white font-heading">{stats.tokensWeekly}</div>
          <div className="text-xs text-slate-400 mt-1 font-mono">Tokens • weekly</div>
        </div>

        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0c0b13]">
          <div className="text-2xl font-mono text-slate-500 mb-2">💳</div>
          <div className="text-3xl font-semibold text-white font-heading">${stats.usageWeekly.toFixed(2)}</div>
          <div className="text-xs text-slate-400 mt-1 font-mono">Spend • weekly</div>
        </div>
      </div>

      {/* Usage by model */}
      <div className="p-8 rounded-2xl border border-white/[0.08] bg-[#0c0b13] space-y-4">
        <div>
          <h3 className="text-base font-medium text-white font-heading">Usage by model</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Weekly usage, including cache tokens, ranked by spend
          </p>
        </div>
        <div className="py-12 text-center text-xs text-slate-500 font-mono">
          No usage this week.
        </div>
      </div>

      {/* Latest 50 Logs */}
      <div className="p-8 rounded-2xl border border-white/[0.08] bg-[#0c0b13] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-white font-heading">Latest 50 logs</h3>
          <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Live</span>
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">
            No API requests recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-500">
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Model</th>
                  <th className="pb-3">Tokens</th>
                  <th className="pb-3">Latency</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {logs.map((log: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-3 text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</td>
                    <td className="py-3 text-purple-300">{log.model}</td>
                    <td className="py-3 text-slate-300">{log.tokens}</td>
                    <td className="py-3 text-slate-400">{log.latencyMs}ms</td>
                    <td className="py-3 text-emerald-400">{log.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
