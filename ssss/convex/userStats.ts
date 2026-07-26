import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    const userId = identity?.subject || "demo_user"

    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first()

    if (!stats) {
      return {
        userId,
        plan: "No Plan",
        bonusUsd: 2.5,
        balanceUsd: 0.0,
        usage5h: 0.0,
        usageWeekly: 0.0,
        requestsWeekly: 0,
        tokensWeekly: 0,
      }
    }

    return stats
  },
})
