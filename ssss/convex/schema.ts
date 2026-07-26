import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  apiKeys: defineTable({
    userId: v.string(),
    name: v.string(),
    key: v.string(),
    status: v.string(), // "active" | "revoked"
    createdAt: v.number(),
    lastUsed: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_key", ["key"]),

  usageLogs: defineTable({
    userId: v.string(),
    model: v.string(),
    tokens: v.number(),
    costUsd: v.number(),
    latencyMs: v.number(),
    status: v.string(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  userStats: defineTable({
    userId: v.string(),
    plan: v.string(),
    bonusUsd: v.number(),
    balanceUsd: v.number(),
    usage5h: v.number(),
    usageWeekly: v.number(),
    requestsWeekly: v.number(),
    tokensWeekly: v.number(),
  }).index("by_userId", ["userId"]),

  payments: defineTable({
    userId: v.string(),
    planName: v.string(),
    amountInr: v.number(),
    paymentId: v.string(),
    orderId: v.optional(v.string()),
    status: v.string(), // "success" | "pending"
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  referrals: defineTable({
    referrerUserId: v.string(),
    referralCode: v.string(),
    invitedEmail: v.optional(v.string()),
    discountPercent: v.number(), // default 10%
    status: v.string(), // "active" | "redeemed"
    createdAt: v.number(),
  })
    .index("by_referrerUserId", ["referrerUserId"])
    .index("by_referralCode", ["referralCode"]),
})
