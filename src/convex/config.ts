import { query } from "./_generated/server";

export const googleStatus = query({
  args: {},
  handler: async () => {
    const hasClientId = !!process.env.GOOGLE_CLIENT_ID;
    const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;
    return { hasClientId, hasClientSecret };
  },
});
