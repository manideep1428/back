import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const listUserPayments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    const userId = identity?.subject || "demo_user"

    return await ctx.db
      .query("payments")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect()
  },
})

export const recordPayment = mutation({
  args: {
    planName: v.string(),
    amountInr: v.number(),
    paymentId: v.string(),
    orderId: v.optional(v.string()),
    creditsUsd: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    const userId = identity?.subject || "demo_user"

    // 1. Record payment transaction
    const paymentRecordId = await ctx.db.insert("payments", {
      userId,
      planName: args.planName,
      amountInr: args.amountInr,
      paymentId: args.paymentId,
      orderId: args.orderId || `ord_${Math.random().toString(36).substring(2, 10)}`,
      status: "success",
      createdAt: Date.now(),
    })

    // 2. Update or create user stats with new plan and credits
    const existingStats = await ctx.db
      .query("userStats")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first()

    if (existingStats) {
      await ctx.db.patch(existingStats._id, {
        plan: args.planName,
        balanceUsd: existingStats.balanceUsd + args.creditsUsd,
      })
    } else {
      await ctx.db.insert("userStats", {
        userId,
        plan: args.planName,
        bonusUsd: 2.5,
        balanceUsd: args.creditsUsd,
        usage5h: 0.0,
        usageWeekly: 0.0,
        requestsWeekly: 0,
        tokensWeekly: 0,
      })
    }

    return { success: true, paymentRecordId }
  },
})
