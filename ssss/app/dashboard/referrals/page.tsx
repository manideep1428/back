"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

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

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="M16 21v-2a4 4 0 0 1-4-4H6a4 4 0 0 1-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 1-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function GiftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" />
    </svg>
  )
}

export default function ReferralsPage() {
  const referralData = useQuery(api.referrals.getMyReferrals) || {
    referralCode: "INVITE10-DEMO",
    referralLink: "https://makethembroke.com/pricing?ref=INVITE10-DEMO",
    totalInvited: 0,
    redeemedCount: 0,
    list: [],
  }

  const sendInviteMutation = useMutation(api.referrals.sendInvite)

  const [copied, setCopied] = useState(false)
  const [friendEmail, setFriendEmail] = useState("")
  const [inviting, setInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralData.referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!friendEmail.trim()) return

    setInviting(true)
    try {
      await sendInviteMutation({ invitedEmail: friendEmail })
      setInviteSuccess(`Invitation sent to ${friendEmail}! They get 10% OFF and you earn referral credits.`)
      setFriendEmail("")
    } catch (err) {
      console.error("Failed to send invite:", err)
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      <div>
        <h1 className="text-3xl font-normal text-white font-heading tracking-tight">
          Invite Friends & Earn Rewards
        </h1>
        <p className="text-xs text-slate-400 font-light mt-1">
          Invite developers or teams to MakeThemBroke. Each invited friend gets an <strong className="text-purple-300">extra 10% OFF</strong> on every plan purchase, and you earn <strong className="text-emerald-400">10% discount credits</strong> on your next purchase.
        </p>
      </div>

      {/* 3 Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0c0b13] flex items-center justify-between">
          <div>
            <div className="text-3xl font-semibold text-white font-heading">
              {referralData.totalInvited}
            </div>
            <div className="text-xs text-slate-400 mt-1">Friends Invited</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <UsersIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0c0b13] flex items-center justify-between">
          <div>
            <div className="text-3xl font-semibold text-emerald-400 font-heading">
              10% OFF
            </div>
            <div className="text-xs text-slate-400 mt-1">Discount Per Referral</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <GiftIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0c0b13] flex items-center justify-between">
          <div>
            <div className="text-3xl font-semibold text-purple-300 font-heading">
              {referralData.redeemedCount}
            </div>
            <div className="text-xs text-slate-400 mt-1">Purchases Completed</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-300">
            ⚡
          </div>
        </div>
      </div>

      {/* Referral Link & Email Invite Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Unique Referral Link */}
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0c0b13] space-y-4">
          <div>
            <h3 className="text-base font-medium text-white font-heading">Your unique referral link</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Share this link with your friends or team members.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={referralData.referralLink}
                className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-purple-300 focus:outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs font-mono transition-all flex items-center gap-1.5 shrink-0"
              >
                {copied ? <CheckIcon className="w-4 h-4 text-emerald-400" /> : <CopyIcon className="w-4 h-4" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-500">
              <span>Code: <strong className="text-purple-300">{referralData.referralCode}</strong></span>
              <span className="text-emerald-400">10% One-time discount</span>
            </div>
          </div>
        </div>

        {/* Card 2: Send Direct Email Invite */}
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0c0b13] space-y-4">
          <div>
            <h3 className="text-base font-medium text-white font-heading">Invite a friend by email</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter an email address to send a 10% discount invitation.
            </p>
          </div>

          <form onSubmit={handleSendInvite} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="friend@company.com"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={inviting || !friendEmail.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs font-mono transition-all disabled:opacity-50 shrink-0"
              >
                {inviting ? "Sending..." : "Send Invite"}
              </button>
            </div>

            {inviteSuccess && (
              <p className="text-xs font-mono text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/30">
                {inviteSuccess}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Invited Friends Table */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0c0b13] space-y-4">
        <h3 className="text-base font-medium text-white font-heading">Invited Friends History</h3>

        {referralData.list.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">
            No friends invited yet. Copy your referral link above or send an invite!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-500">
                  <th className="pb-3">Invited Email</th>
                  <th className="pb-3">Referral Code</th>
                  <th className="pb-3">Discount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {referralData.list.map((ref: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-3 text-white font-medium">{ref.invitedEmail || "Direct Link"}</td>
                    <td className="py-3 text-purple-300">{ref.referralCode}</td>
                    <td className="py-3 text-emerald-400">10% OFF</td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-purple-950/60 text-purple-300 border border-purple-500/30">
                        {ref.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-500">
                      {new Date(ref.createdAt).toLocaleDateString()}
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
