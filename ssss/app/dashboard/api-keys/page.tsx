"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

function KeyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="m21 3-9.5 9.5M15.5 7.5l3 3M18 5l2 2" />
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

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}

export default function ApiKeysPage() {
  const keys = useQuery(api.apiKeys.listKeys) || []
  const createKeyMutation = useMutation(api.apiKeys.createKey)
  const revokeKeyMutation = useMutation(api.apiKeys.revokeKey)

  const [keyName, setKeyName] = useState("")
  const [creating, setCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyName.trim()) return

    setCreating(true)
    try {
      const res = await createKeyMutation({ name: keyName })
      setNewlyCreatedKey(res.key)
      setKeyName("")
    } catch (err) {
      console.error("Failed to create key:", err)
    } finally {
      setCreating(false)
    }
  }

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-normal text-white font-heading tracking-tight">API Keys</h1>
        <p className="text-xs text-slate-400 font-light mt-1">
          Manage MakeThemBroke API keys for your autonomous agents, CLI tools, and web applications.
        </p>
      </div>

      {/* Create Key Card */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0c0b13] space-y-4">
        <h3 className="text-base font-medium text-white font-heading">Create new secret key</h3>
        <form onSubmit={handleCreateKey} className="flex gap-4">
          <input
            type="text"
            placeholder="Key name (e.g. Codex CLI Agent)"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            type="submit"
            disabled={creating || !keyName.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm transition-all disabled:opacity-50"
          >
            {creating ? "Generating..." : "Create key"}
          </button>
        </form>

        {newlyCreatedKey && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-2 mt-4">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-mono font-bold">
              <span>Key generated! Copy it now (it won&apos;t be shown again):</span>
              <button
                onClick={() => copyKey(newlyCreatedKey, "new")}
                className="flex items-center gap-1 text-slate-200 hover:text-white"
              >
                {copiedId === "new" ? <CheckIcon className="w-4 h-4 text-emerald-400" /> : <CopyIcon className="w-4 h-4" />}
              </button>
            </div>
            <code className="block p-3 rounded-lg bg-black/60 font-mono text-xs text-purple-200 break-all select-all">
              {newlyCreatedKey}
            </code>
          </div>
        )}
      </div>

      {/* Keys Table */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0c0b13] space-y-4">
        <h3 className="text-base font-medium text-white font-heading">Your API Keys</h3>

        {keys.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">
            No API keys created yet. Create one above to connect your agents.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-500">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Key Preview</th>
                  <th className="pb-3">Created</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {keys.map((k: any) => (
                  <tr key={k._id} className="hover:bg-white/[0.02]">
                    <td className="py-4 font-medium text-white">{k.name}</td>
                    <td className="py-4 text-purple-300">
                      {k.key.substring(0, 10)}...{k.key.substring(k.key.length - 4)}
                    </td>
                    <td className="py-4 text-slate-400">
                      {new Date(k.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      {k.status === "active" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-red-950/60 text-red-400 border border-red-500/30">
                          Revoked
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <button
                        onClick={() => copyKey(k.key, k._id)}
                        className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300"
                        title="Copy Key"
                      >
                        {copiedId === k._id ? <CheckIcon className="w-4 h-4 text-emerald-400" /> : <CopyIcon className="w-4 h-4" />}
                      </button>
                      {k.status === "active" && (
                        <button
                          onClick={() => revokeKeyMutation({ id: k._id })}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30"
                          title="Revoke Key"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </td>
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
