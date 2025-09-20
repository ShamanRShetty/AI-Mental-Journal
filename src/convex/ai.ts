"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

export const analyzeJournalEntry = action({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, we'll create a simple sentiment analysis
    // In a real implementation, you would integrate with Google Gemini API
    const text = args.text.toLowerCase();
    
    // Simple keyword-based sentiment analysis
    const positiveWords = ['happy', 'joy', 'good', 'great', 'amazing', 'wonderful', 'excited', 'love', 'grateful', 'blessed'];
    const negativeWords = ['sad', 'angry', 'frustrated', 'depressed', 'anxious', 'worried', 'hate', 'terrible', 'awful', 'stressed'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      if (text.includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
      if (text.includes(word)) negativeCount++;
    });
    
    // Calculate mood score between -1 and 1
    let moodScore = 0;
    if (positiveCount > negativeCount) {
      moodScore = Math.min(0.8, positiveCount * 0.2);
    } else if (negativeCount > positiveCount) {
      moodScore = Math.max(-0.8, -negativeCount * 0.2);
    }
    
    // Generate empathetic reflection based on mood
    let reflection = "";
    if (moodScore > 0.3) {
      reflection = "It's wonderful to hear the positivity in your words! Your feelings are valid and it's beautiful that you're taking time to reflect on the good moments in your life.";
    } else if (moodScore < -0.3) {
      reflection = "I hear that you're going through a difficult time right now. Your feelings are completely valid, and it takes courage to express them. Remember that challenging moments are temporary.";
    } else {
      reflection = "Thank you for sharing your thoughts with me. It's important to acknowledge all of our feelings, both positive and challenging ones. You're doing great by taking time for self-reflection.";
    }
    
    // Save the journal entry using the mutation directly
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