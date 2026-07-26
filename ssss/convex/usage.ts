import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const validateApiKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    if (!args.key) {
      return { valid: false, reason: "API key is required" }
    }

    const keyRecord = await ctx.db
      .query("apiKeys")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first()

    if (!keyRecord || keyRecord.status !== "active") {
      return { valid: false, reason: "Invalid or revoked API key" }
    }

    const userId = keyRecord.userId
    let stats = await ctx.db
      .query("userStats")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first()

    if (!stats) {
      // Auto-create initial user stats with welcome $2.50 bonus
      const statsId = await ctx.db.insert("userStats", {
        userId,
        plan: "Starter Trial",
        bonusUsd: 2.50,
        balanceUsd: 0.0,
        usage5h: 0.0,
        usageWeekly: 0.0,
        requestsWeekly: 0,
        tokensWeekly: 0,
      })
      stats = {
        _id: statsId,
        _creationTime: Date.now(),
        userId,
        plan: "Starter Trial",
        bonusUsd: 2.50,
        balanceUsd: 0.0,
        usage5h: 0.0,
        usageWeekly: 0.0,
        requestsWeekly: 0,
        tokensWeekly: 0,
      }
    }

    const totalBalance = (stats.bonusUsd || 0) + (stats.balanceUsd || 0)
    if (totalBalance <= 0) {
      return { valid: false, reason: "Insufficient credit balance. Please add funds to your account." }
    }

    return {
      valid: true,
      userId,
      plan: stats.plan,
      bonusUsd: stats.bonusUsd,
      balanceUsd: stats.balanceUsd,
      totalBalanceUsd: totalBalance,
    }
  },
})

export const recordUsageAndDeductCredit = mutation({
  args: {
    key: v.string(),
    model: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    costUsd: v.number(),
    latencyMs: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const keyRecord = await ctx.db
      .query("apiKeys")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first()

    if (!keyRecord) {
      return { success: false, reason: "Key not found" }
    }

    // Update key lastUsed
    await ctx.db.patch(keyRecord._id, { lastUsed: Date.now() })

    const userId = keyRecord.userId
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first()

    const cost = Math.max(0, args.costUsd)
    const totalTokens = args.inputTokens + args.outputTokens

    if (stats) {
      let currentBonus = stats.bonusUsd || 0
      let currentBalance = stats.balanceUsd || 0

      if (currentBonus >= cost) {
        currentBonus -= cost
      } else {
        const diff = cost - currentBonus
        currentBonus = 0
        currentBalance = Math.max(0, currentBalance - diff)
      }

      await ctx.db.patch(stats._id, {
        bonusUsd: Math.round(currentBonus * 1000000) / 1000000,
        balanceUsd: Math.round(currentBalance * 1000000) / 1000000,
        usage5h: Math.round(((stats.usage5h || 0) + cost) * 1000000) / 1000000,
        usageWeekly: Math.round(((stats.usageWeekly || 0) + cost) * 1000000) / 1000000,
        requestsWeekly: (stats.requestsWeekly || 0) + 1,
        tokensWeekly: (stats.tokensWeekly || 0) + totalTokens,
      })
    }

    // Log usage entry
    await ctx.db.insert("usageLogs", {
      userId,
      model: args.model,
      tokens: totalTokens,
      costUsd: Math.round(cost * 1000000) / 1000000,
      latencyMs: args.latencyMs,
      status: args.status,
      createdAt: Date.now(),
    })

    return { success: true }
  },
})
