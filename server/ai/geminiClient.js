/**
 * ai/geminiClient.js — Google Gemini AI Client
 *
 * Initialises a singleton Gemini Flash model instance.
 * All AI calls in the system go through this module.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("[Gemini] GEMINI_API_KEY not set — AI distress parsing will be unavailable.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Gemini 1.5 Flash model — free tier, fast, suitable for JSON extraction.
 * @type {import('@google/generative-ai').GenerativeModel}
 */
const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.1,      // Low temp for deterministic JSON output
    maxOutputTokens: 512,
    responseMimeType: "application/json",
  },
});

export { geminiModel };
