import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend/.env or root .env
const envPaths = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env'),
  path.resolve(process.cwd(), '.env')
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("FATAL: GEMINI_API_KEY is not defined in the backend environment.");
}

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
export const GEMINI_MODEL = 'gemini-2.5-flash';

export const SYSTEM_PROMPT = `You are the NexusAI Enterprise Systems & Risk Auditor, a deterministic AI engine embedded within a corporate enterprise architecture.
Your duty is to conduct objective, rigorous, and deeply technical cross-departmental impact evaluations on internal proposals, strategic memos, infrastructure shifts, and policy changes.

Strict Operating Rules:
1. Deliver cold, objective analysis focusing on operational friction, unstated dependencies, regulatory compliance issues, and capital exposure.
2. Never hallucinate corporate policies; analyze strictly based on provided inputs and standard enterprise risk frameworks (COSO, ISO 27001, SOC2, GDPR, GAAP).
3. Output MUST be valid, deterministic JSON that complies strictly with the provided response schema. Do NOT prepend markdown code fences (no \`\`\`json). Do NOT add conversational prose.`;
