"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

export const analyzeJournalEntry = action({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    // Enhanced heuristic analysis for more varied, content-specific reflections
    const raw = args.text;
    const text = raw.toLowerCase();

    // Expanded keyword lists
    const positiveWords = [
      "happy","joy","good","great","amazing","wonderful","excited","love","grateful","blessed",
      "calm","proud","relaxed","hopeful","peaceful","confident","energized","progress","success","fun"
    ];
    const negativeWords = [
      "sad","angry","frustrated","depressed","anxious","worried","hate","terrible","awful","stressed",
      "overwhelmed","lonely","tired","guilty","scared","fear","pain","failure","regret","hurt"
    ];

    // Basic tokenization
    const tokens = raw
      .replace(/[^\p{L}\p{N}\s']/gu, " ")
      .split(/\s+/)
      .filter(Boolean);

    // Stopwords for keyword extraction
    const stopwords = new Set<string>([
      "i","me","my","myself","we","our","ours","ourselves","you","your","yours","yourself","yourselves",
      "he","him","his","himself","she","her","hers","herself","it","its","itself","they","them","their",
      "theirs","themselves","what","which","who","whom","this","that","these","those","am","is","are",
      "was","were","be","been","being","have","has","had","having","do","does","did","doing","a","an",
      "the","and","but","if","or","because","as","until","while","of","at","by","for","with","about",
      "against","between","into","through","during","before","after","above","below","to","from","up",
      "down","in","out","on","off","over","under","again","further","then","once","here","there","when",
      "where","why","how","all","any","both","each","few","more","most","other","some","such","no","nor",
      "not","only","own","same","so","than","too","very","can","will","just","don","should","now"
    ]);

    // Count sentiment hits (weighted by occurrences)
    let pos = 0;
    let neg = 0;
    for (const t of tokens) {
      if (positiveWords.includes(t.toLowerCase())) pos += 1;
      if (negativeWords.includes(t.toLowerCase())) neg += 1;
    }

    // Mood score normalized to [-1, 1]
    // (pos - neg) / (pos + neg + smoothing)
    const smoothing = 1;
    let moodScore = (pos - neg) / (pos + neg + smoothing);
    if (Number.isNaN(moodScore)) moodScore = 0;
    moodScore = Math.max(-1, Math.min(1, moodScore));

    // Keyword extraction for personalization
    const freq: Record<string, number> = {};
    for (const t of tokens) {
      const w = t.toLowerCase();
      if (stopwords.has(w)) continue;
      if (w.length < 4) continue;
      freq[w] = (freq[w] || 0) + 1;
    }
    const keywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([w]) => w);

    const mention =
      keywords.length > 0
        ? ` You mentioned ${keywords
            .map((w) => `"${w}"`)
            .join(", ")} — thanks for opening up about that.`
        : "";

    // Tailored reflection by mood band with personalization
    let reflection = "";
    if (moodScore > 0.45) {
      reflection =
        "It's uplifting to sense the positive energy in what you shared. Celebrate these wins and the strength you're building." +
        mention +
        " Keep noticing what supports your well-being and carry that forward.";
    } else if (moodScore > 0.15) {
      reflection =
        "There's a gentle optimism in your words. Even small steps can nurture momentum." +
        mention +
        " Consider one simple action that would help you feel grounded today.";
    } else if (moodScore > -0.15) {
      reflection =
        "Your entry reflects a balanced mix of feelings. It's okay to hold complexity—both ease and challenge can coexist." +
        mention +
        " Try a brief check-in: what do you need most right now—rest, support, or expression?";
    } else if (moodScore > -0.45) {
      reflection =
        "It sounds like things are weighing on you. Your feelings are valid, and writing them out is a powerful step." +
        mention +
        " Consider a compassionate pause: slow breaths, a short walk, or reaching out to someone you trust.";
    } else {
      reflection =
        "I'm hearing real heaviness in what you shared. You're not alone, and it's brave to express this." +
        mention +
        " If the weight feels overwhelming, please consider talking to someone you trust or a professional—support can make a difference.";
    }

    await ctx.runMutation(internal.journals.create, {
      text: args.text,
      reflection,
      moodScore,
    });

    return {
      reflection,
      moodScore,
    };
  },
});