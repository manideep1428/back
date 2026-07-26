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

    const codeSuffix = userId.substring(userId.length - 6).toUpperCase()
    const referralCode = `REF60-${codeSuffix}`

    const redeemedCount = referralList.filter((r) => r.status === "redeemed").length
    const maxUses = 3
    const isExhausted = redeemedCount >= maxUses

    return {
      referralCode,
      referralLink: `https://makethembroke.com/pricing?ref=${referralCode}`,
      totalInvited: referralList.length,
      redeemedCount,
      maxUses,
      isExhausted,
      discountPercent: 60,
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
    const referralCode = `REF60-${codeSuffix}`

    // Check current redemptions count
    const existing = await ctx.db
      .query("referrals")
      .withIndex("by_referrerUserId", (q) => q.eq("referrerUserId", userId))
      .collect()

    const redeemedCount = existing.filter((r) => r.status === "redeemed").length
    if (redeemedCount >= 3) {
      throw new Error("Maximum limit of 3 referral redemptions reached for this account.")
    }

    const id = await ctx.db.insert("referrals", {
      referrerUserId: userId,
      referralCode,
      invitedEmail: args.invitedEmail,
      discountPercent: 60,
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
    if (!cleanCode) return { valid: false, discountPercent: 0, message: "Please enter a valid code." }

    // Hardcoded static promotional codes or database lookup
    if (cleanCode.startsWith("REF60") || cleanCode === "FRIEND60" || cleanCode === "MAKETHEMBROKE60" || cleanCode.startsWith("INVITE10")) {
      const records = await ctx.db
        .query("referrals")
        .withIndex("by_referralCode", (q) => q.eq("referralCode", cleanCode))
        .collect()

      const redeemedCount = records.filter((r) => r.status === "redeemed").length

      if (redeemedCount >= 3) {
        return {
          valid: false,
          discountPercent: 0,
          message: "❌ This referral code has reached its maximum limit of 3 uses.",
        }
      }

      const remainingUses = 3 - redeemedCount
      return {
        valid: true,
        discountPercent: 60,
        remainingUses,
        message: `🎉 60% OFF Referral Code Applied! (${remainingUses}/3 uses left)`,
      }
    }

    const existingRecords = await ctx.db
      .query("referrals")
      .withIndex("by_referralCode", (q) => q.eq("referralCode", cleanCode))
      .collect()

    if (existingRecords.length > 0) {
      const redeemedCount = existingRecords.filter((r) => r.status === "redeemed").length
      if (redeemedCount >= 3) {
        return {
          valid: false,
          discountPercent: 0,
          message: "❌ This referral code has reached its maximum limit of 3 uses.",
        }
      }

      const remainingUses = 3 - redeemedCount
      return {
        valid: true,
        discountPercent: 60,
        remainingUses,
        message: `🎉 60% OFF Referral Code Applied! (${remainingUses}/3 uses left)`,
      }
    }

    return { valid: false, discountPercent: 0, message: "❌ Invalid or expired referral code" }
  },
})

export const recordReferralRedemption = mutation({
  args: { referralCode: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    const userId = identity?.subject || "demo_user"

    const cleanCode = args.referralCode.trim().toUpperCase()

    const existingRecords = await ctx.db
      .query("referrals")
      .withIndex("by_referralCode", (q) => q.eq("referralCode", cleanCode))
      .collect()

    const redeemedCount = existingRecords.filter((r) => r.status === "redeemed").length
    if (redeemedCount >= 3) {
      return { success: false, message: "Referral code maximum redemption limit reached (3/3)." }
    }

    await ctx.db.insert("referrals", {
      referrerUserId: userId,
      referralCode: cleanCode,
      discountPercent: 60,
      status: "redeemed",
      createdAt: Date.now(),
    })

    return { success: true, redeemedCount: redeemedCount + 1 }
  },
})
