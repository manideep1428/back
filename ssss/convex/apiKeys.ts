import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const listKeys = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    const userId = identity?.subject || "demo_user"
    return await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect()
  },
})

export const createKey = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    const userId = identity?.subject || "demo_user"
    
    // Generate a secure MakeThemBroke API key
    const randomHex = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12)
    const key = `mb-live-${randomHex}`

    const id = await ctx.db.insert("apiKeys", {
      userId,
      name: args.name || "Default Key",
      key,
      status: "active",
      createdAt: Date.now(),
    })

    return { id, key }
  },
})

export const revokeKey = mutation({
  args: { id: v.id("apiKeys") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "revoked" })
  },
})
