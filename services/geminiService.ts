import { GoogleGenAI, Type } from "@google/genai";
import { HintResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const COMMON_ALIASES: Record<string, string[]> = {
  "United States": ["usa", "us", "america", "united states of america"],
  "United Kingdom": ["uk", "britain", "great britain", "england"],
  "Russia": ["russian federation"],
  "China": ["prc", "people's republic of china"],
  "South Africa": ["rsa"],
  "United Arab Emirates": ["uae"],
  "Republic of Korea": ["south korea", "korea"],
  "Democratic People's Republic of Korea": ["north korea"],
};

// Local Levenshtein distance for fallback fuzzy matching
const levenshtein = (a: string, b: string): number => {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i - 1] === a[j - 1]
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j]) + 1;
    }
  }
  return matrix[b.length][a.length];
};

export const getCountryHint = async (countryName: string): Promise<HintResponse> => {
  try {
    const modelId = "gemini-2.5-flash"; // Supports Google Maps grounding
    
    const prompt = `
      I am playing a game where I need to guess the country based on its map outline. 
      The country is "${countryName}". 
      Give me a short, clever, and slightly cryptic hint about this country using a real geographical fact or landmark found there. 
      Do NOT mention the country's name in the hint. 
      Use the Google Maps tool to verify a famous place or geographic feature to base your hint on.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        temperature: 0.7,
      },
    });

    const text = response.text || "I couldn't find a specific hint, but it's a very interesting place!";
    
    // Extract grounding chunks if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let mapLink = undefined;
    let placeName = undefined;

    if (groundingChunks) {
      // Look for a map chunk
      for (const chunk of groundingChunks) {
        // @ts-ignore - Dynamic check for maps property as types might be in flux
        if (chunk.maps?.uri) {
           // @ts-ignore
           mapLink = chunk.maps.uri;
           // @ts-ignore
           placeName = chunk.maps.title;
           break;
        }
      }
    }

    return {
      text,
      mapLink,
      placeName
    };
  } catch (error: any) {
    // Handle Quota Exceeded (429) specifically
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
        // Suppress console error for 429 to avoid alarming developers/users checking console
        // Just return the fallback message
        return {
           text: "Global hint quota exceeded. You'll have to rely on your geography skills!",
        };
    }

    console.error("Gemini API Error:", error);
    return {
      text: "The AI is having trouble connecting to the satellite. Try guessing based on the shape!",
    };
  }
};

export const checkAnswerWithAI = async (userGuess: string, actualCountry: string): Promise<boolean> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        The correct answer is "${actualCountry}".
        The user guessed "${userGuess}".
        Is this guess correct? 
        Allow for:
        1. Minor typos (e.g. "Itali" for "Italy")
        2. Common abbreviations (e.g. "USA" for "United States")
        3. Standard English names
        
        Respond with valid JSON only.
      `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
          },
        },
      },
    });

    const cleanText = response.text?.replace(/```json/g, '').replace(/```/g, '').trim() || "{}";
    const result = JSON.parse(cleanText);
    return result.isCorrect === true;

  } catch (e: any) {
    // Only warn if it's not a quota error
    if (!e.message?.includes('429') && e.status !== 429) {
        console.warn("AI Validation error, using local fallback:", e.message);
    }
    
    // Fallback: Local Fuzzy Match
    const normalizedGuess = userGuess.toLowerCase().trim();
    const normalizedActual = actualCountry.toLowerCase().trim();
    
    // 1. Exact match (Safety check)
    if (normalizedGuess === normalizedActual) return true;

    // 2. Check Aliases
    const aliases = COMMON_ALIASES[actualCountry] || [];
    if (aliases.some(alias => alias === normalizedGuess)) return true;

    // 3. Levenshtein Distance for typos
    const distance = levenshtein(normalizedGuess, normalizedActual);
    
    // Allow 2 typos max, or 20% of length for longer names
    const threshold = Math.max(2, Math.floor(normalizedActual.length * 0.2)); 
    
    if (distance <= threshold) return true;

    return false;
  }
};
