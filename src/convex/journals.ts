import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getCurrentUser } from "./users";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = internalMutation({
  args: {
    text: v.string(),
    reflection: v.string(),
    moodScore: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    return await ctx.db.insert("journals", {
      userId,
      text: args.text,
      reflection: args.reflection,
      moodScore: args.moodScore,
    });
  },
});

export const getUserEntries = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    return await ctx.db
      .query("journals")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getMoodData = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const entries = await ctx.db
      .query("journals")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .order("asc")
      .collect();

    return entries.map(entry => ({
      date: new Date(entry._creationTime).toLocaleDateString(),
      moodScore: entry.moodScore,
      createdAt: entry._creationTime,
    }));
  },
});