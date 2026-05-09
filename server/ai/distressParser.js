/**
 * ai/distressParser.js — Gemini Distress Message Parser
 *
 * Takes a free-form captain distress message and returns structured
 * JSON for alert prioritisation in the Command interface.
 */

import { geminiModel } from "./geminiClient.js";

const DISTRESS_PROMPT = `You are analyzing a maritime distress message from a ship captain in the Strait of Hormuz.
Extract the following fields as a valid JSON object:

{
  "severity": <integer 1-5, where 1=minor, 5=immediate life threat>,
  "issue_type": "<short string, e.g. 'flooding', 'mechanical failure', 'medical emergency', 'fire'>",
  "injury_count": <integer or null if not mentioned>,
  "damage_estimate": "<short string or null, e.g. 'engine room flooded', 'hull breach'>",
  "recommended_action": "<short string, e.g. 'dispatch rescue', 'reroute nearby ships', 'medical assistance'>",
  "can_continue_voyage": <boolean>
}

Captain message:
`;

/**
 * Parses a captain's distress message using Gemini Flash.
 * Retries once if the response is malformed JSON.
 *
 * @param {string} rawMessage - Free-form text from the captain
 * @returns {Promise<Object>} Structured distress data
 */
async function parseDistressMessage(rawMessage) {
  if (!process.env.GEMINI_API_KEY) {
    return {
      severity: 3,
      issue_type: "unknown",
      injury_count: null,
      damage_estimate: null,
      recommended_action: "Assess situation",
      can_continue_voyage: false,
      _error: "AI parsing unavailable — no API key",
    };
  }

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await geminiModel.generateContent(DISTRESS_PROMPT + rawMessage);
      const text = result.response.text();

      // Strip markdown code fences if present
      const clean = text.replace(/```(?:json)?/g, "").trim();
      const parsed = JSON.parse(clean);

      // Validate required fields
      if (
        typeof parsed.severity !== "number" ||
        typeof parsed.issue_type !== "string" ||
        typeof parsed.can_continue_voyage !== "boolean"
      ) {
        throw new Error("Missing required fields in AI response");
      }

      // Clamp severity to 1-5
      parsed.severity = Math.min(5, Math.max(1, Math.round(parsed.severity)));
      return parsed;
    } catch (err) {
      if (attempt === 2) {
        console.error("[Gemini] Distress parse failed after 2 attempts:", err.message);
        return {
          severity: 3,
          issue_type: "parse_error",
          injury_count: null,
          damage_estimate: null,
          recommended_action: "Manual assessment required",
          can_continue_voyage: false,
          _error: err.message,
        };
      }
    }
  }
}

export { parseDistressMessage };
