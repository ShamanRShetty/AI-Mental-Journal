import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // users table is provided by authTables; do not redefine here

    // Journal entries table
    journals: defineTable({
      userId: v.id("users"),
      text: v.string(),
      reflection: v.string(),
      moodScore: v.number(), // -1 to 1 scale
    }).index("by_user_id", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;