import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const getMyReferrals = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    const userId = identity?.subject || "demo_user"

    const referralList = await ctx.db
      .query("referrals")
      .withIndex("by_referrerUserId", (q) => q.eq("referrerUserId", userId))
      .order("desc")
      .collect()

    // Generate unique code based on userId
    const codeSuffix = userId.substring(userId.length - 6).toUpperCase()
    const referralCode = `INVITE10-${codeSuffix}`

    return {
      referralCode,
      referralLink: `https://makethembroke.com/pricing?ref=${referralCode}`,
      totalInvited: referralList.length,
      redeemedCount: referralList.filter((r) => r.status === "redeemed").length,
      list: referralList,
    }
  },
})

export const sendInvite = mutation({
  args: { invitedEmail: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    const userId = identity?.subject || "demo_user"

    const codeSuffix = userId.substring(userId.length - 6).toUpperCase()
    const referralCode = `INVITE10-${codeSuffix}`

    const id = await ctx.db.insert("referrals", {
      referrerUserId: userId,
      referralCode,
      invitedEmail: args.invitedEmail,
      discountPercent: 10,
      status: "active",
      createdAt: Date.now(),
    })

    return { id, code: referralCode }
  },
})

export const validateReferralCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const cleanCode = args.code.trim().toUpperCase()
    if (!cleanCode) return { valid: false, discountPercent: 0 }

    // Check if code matches pattern or is in database
    if (cleanCode.startsWith("INVITE10") || cleanCode === "FRIEND10" || cleanCode === "MAKETHEMBROKE10") {
      return {
        valid: true,
        discountPercent: 10,
        message: "Referral code applied! You get an extra 10% OFF on all plans.",
      }
    }

    const existing = await ctx.db
      .query("referrals")
      .withIndex("by_referralCode", (q) => q.eq("referralCode", cleanCode))
      .first()

    if (existing) {
      return {
        valid: true,
        discountPercent: 10,
        message: "Referral code applied! You get an extra 10% OFF on all plans.",
      }
    }

    return { valid: false, discountPercent: 0, message: "Invalid referral code" }
  },
})
