"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export default function LogsPage() {
  const logs = useQuery(api.stats.getLogs) || []

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      <div>
        <h1 className="text-3xl font-normal text-white font-heading tracking-tight">Request Logs</h1>
        <p className="text-xs text-slate-400 font-light mt-1">
          Sub-millisecond ledger of all agent API completion calls through MakeThemBroke gateway.
        </p>
      </div>

      <div className="p-8 rounded-2xl border border-white/[0.08] bg-[#0c0b13] space-y-4">
        {logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 font-mono">
            No API request logs recorded yet. Run your agent with a MakeThemBroke API key to view live telemetry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-500">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Model</th>
                  <th className="pb-3">Tokens</th>
                  <th className="pb-3">Cost (USD)</th>
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
                    <td className="py-3 text-slate-300">${log.costUsd.toFixed(4)}</td>
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
