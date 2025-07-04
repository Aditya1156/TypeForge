
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { AiAnalysis, ErrorDetail, PracticeMode } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.error("Gemini API key is not set. Please set the process.env.API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const fetchAiCustomDrill = async (difficultKeys: string, mode: PracticeMode): Promise<string> => {
    if (!API_KEY) {
        return Promise.resolve("API Key not configured. Cannot generate drill.");
    }

    const prompt = `
    You are Aether AI, an expert typing coach. Your task is to generate a custom typing drill.
    The user is struggling with the following keys: "${difficultKeys}".
    Generate a practice text in the format of: "${mode}".

    Here are the specific instructions for each format:
    - keys: Generate a single line of space-separated key combinations focusing heavily on the difficult keys. Example: "qza p;q qza p;q..."
    - words: Generate a single line of space-separated English words that prominently feature the difficult keys.
    - paragraph: Generate a short, coherent English paragraph (3-4 sentences) that naturally integrates words containing the difficult keys.
    - code: Generate a short, realistic code snippet (e.g., JavaScript or Python) that uses the difficult keys. Include symbols if the keys are symbolic.

    The total length of the generated text should be around 250-350 characters.
    VERY IMPORTANT: Respond ONLY with the raw text for the drill. Do not include any explanation, titles, or markdown formatting like \`\`\`text \`\`\`.
    `;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Failed to fetch AI custom drill:", error);
        throw new Error("The AI failed to generate a drill. Please try again.");
    }
};

export const fetchAiAnalysis = async (errors: ErrorDetail[]): Promise<AiAnalysis | null> => {
    if (!API_KEY) {
        return Promise.resolve({
            analysis: "API Key not configured. Please contact support.",
            drill: ["check", "your", "environment", "variables"]
        });
    }

    const prompt = `
    You are Aether AI, an expert typing coach. Your goal is to analyze a user's typing errors and provide constructive feedback and a custom practice drill. The user's errors are provided below as a JSON array of objects, where each object shows the character they were supposed to type ('expected') and the character they typed instead ('actual').

    Analyze these errors to identify patterns (e.g., hitting adjacent keys, common substitutions, left-hand vs. right-hand mistakes). Provide a short, encouraging analysis (2-3 sentences). Then, generate a custom typing drill consisting of 15-20 words that will help the user practice the specific keys and transitions they are struggling with.

    Respond ONLY with a single, valid JSON object with the following structure: { "analysis": "Your insightful analysis here.", "drill": ["word1", "word2", "word3", ...] }

    Here is the user's error data:
    ${JSON.stringify(errors)}
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });
        
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        const parsedData: AiAnalysis = JSON.parse(jsonStr);
        return parsedData;

    } catch (error) {
        console.error("Failed to fetch or parse AI analysis:", error);
        return null;
    }
};