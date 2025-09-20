import { query } from "./_generated/server";

export const googleStatus = query({
  args: {},
  handler: async () => {
    // Check for either GOOGLE_* or AUTH_GOOGLE_* to mark as configured
    const hasClientId = !!(process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID);
    const hasClientSecret = !!(process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET);

    // Add: siteUrl and computed redirect URI
    const siteUrl = process.env.CONVEX_SITE_URL || null;
    const redirectUri = siteUrl ? `${siteUrl}/api/auth/callback/google` : null;

    return { hasClientId, hasClientSecret, siteUrl, redirectUri };
  },
});