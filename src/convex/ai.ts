"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

// Add: helper to call Gemini REST API with retries
async function callGeminiFlashJSON(journalText: string): Promise<{ reflection: string; moodScore: number }> {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY (or GEMINI_API_KEY) not set");
  }

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
    encodeURIComponent(apiKey);

  const prompt =
    `You are an empathetic mental wellness assistant.\n` +
    `Analyze the user's journal entry and return a concise reflection (<= 100 words) and a moodScore between -1 and 1.\n` +
    `- moodScore: -1 = very negative, 0 = neutral/mixed, 1 = very positive\n` +
    `- reflection: supportive, kind, specific to their text (no medical advice)\n` +
    `Return ONLY a JSON object with keys "reflection" (string) and "moodScore" (number in [-1,1]).\n\n` +
    `Journal Entry:\n"""${journalText}"""`;

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    // Ask for structured JSON
    generationConfig: {
      responseMimeType: "application/json",
    },
    // Relaxed safety for reflective content (still subject to provider policies)
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  };

  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
          throw new Error(`Transient error ${res.status}`);
        }
        const text = await res.text();
        throw new Error(`Gemini error ${res.status}: ${text}`);
      }
      const data = (await res.json()) as any;

      // Parse JSON from the first candidate
      const textContent: string | undefined =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) {
        throw new Error("No text content returned by Gemini");
      }

      let parsed: any;
      try {
        parsed = JSON.parse(textContent);
      } catch {
        // Occasionally the model may wrap or add extra text. Try to extract JSON substring.
        const match = textContent.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Failed to parse JSON from Gemini response");
        parsed = JSON.parse(match[0]);
      }

      let reflection: string = String(parsed.reflection ?? "").trim();
      let moodScoreRaw = Number(parsed.moodScore);
      if (!Number.isFinite(moodScoreRaw)) moodScoreRaw = 0;
      // Clamp to [-1, 1]
      const moodScore = Math.max(-1, Math.min(1, moodScoreRaw));

      if (!reflection) {
        throw new Error("Empty reflection from Gemini");
      }
      return { reflection, moodScore };
    } catch (err) {
      lastErr = err;
      // Backoff on rate limit / server errors
      const isTransient =
        (err instanceof Error && /Transient error|429|5\d\d/.test(err.message)) ||
        false;
      if (isTransient && attempt < 3) {
        const backoff = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 500, 8000);
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      break;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Unknown Gemini error");
}

// Extracted: heuristic fallback (previous logic) into a helper
function heuristicAnalyze(rawText: string): { reflection: string; moodScore: number } {
  const raw = rawText;
  const text = raw.toLowerCase();

  const positiveWords = [
    "happy","joy","good","great","amazing","wonderful","excited","love","grateful","blessed",
    "calm","proud","relaxed","hopeful","peaceful","confident","energized","progress","success","fun"
  ];
  const negativeWords = [
    "sad","angry","frustrated","depressed","anxious","worried","hate","terrible","awful","stressed",
    "overwhelmed","lonely","tired","guilty","scared","fear","pain","failure","regret","hurt"
  ];

  const tokens = raw
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

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

  let pos = 0;
  let neg = 0;
  for (const t of tokens) {
    if (positiveWords.includes(t.toLowerCase())) pos += 1;
    if (negativeWords.includes(t.toLowerCase())) neg += 1;
  }

  const smoothing = 1;
  let moodScore = (pos - neg) / (pos + neg + smoothing);
  if (Number.isNaN(moodScore)) moodScore = 0;
  moodScore = Math.max(-1, Math.min(1, moodScore));

  const freq: Record<string, number> = {};
  for (const t of tokens) {
    const w = t.toLowerCase();
    if (stopwords.has(w)) continue;
    if (w.length < 4) continue;
    freq[w] = (freq[w] || 0) + 1;
  }
  const keywords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([w]) => w);
  const mention =
    keywords.length > 0
      ? ` You mentioned ${keywords.map((w) => `"${w}"`).join(", ")} — thanks for opening up about that.`
      : "";

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

  return { reflection, moodScore };
}

export const analyzeJournalEntry = action({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const raw = args.text;

    // Try Gemini first if key is available; otherwise or on failure, fallback to heuristic
    let result: { reflection: string; moodScore: number };
    if (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY) {
      try {
        result = await callGeminiFlashJSON(raw);
      } catch (e) {
        console.warn("Gemini call failed, falling back to heuristic:", e);
        result = heuristicAnalyze(raw);
      }
    } else {
      result = heuristicAnalyze(raw);
    }

    await ctx.runMutation(internal.journals.create, {
      text: args.text,
      reflection: result.reflection,
      moodScore: result.moodScore,
    });

    return {
      reflection: result.reflection,
      moodScore: result.moodScore,
    };
  },
});