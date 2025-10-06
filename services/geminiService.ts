
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Item, ItemFeatures, Match, ItemReportType } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    itemName: { type: Type.STRING, description: 'A short, descriptive name for the item (e.g., "Black Leather Wallet", "HydroFlask Water Bottle").' },
    primaryColor: { type: Type.STRING, description: 'The dominant color of the item.' },
    category: { type: Type.STRING, description: 'A general category like "Electronics", "Apparel", "Keys", "Bags", "Accessories".' },
    brand: { type: Type.STRING, description: 'The brand of the item, if visible or mentioned. Otherwise, "N/A".' },
    distinguishingFeatures: {
      type: Type.ARRAY,
      description: 'A list of 2-3 key visual details, like "small scratch on corner", "Mickey Mouse sticker", or "braided strap".',
      items: { type: Type.STRING }
    }
  },
  required: ['itemName', 'primaryColor', 'category', 'brand', 'distinguishingFeatures']
};


export const analyzeItem = async (imageBase64: string, mimeType: string, description: string, location: string): Promise<ItemFeatures> => {
  const prompt = `
    Analyze the attached image and the following user-provided details of an item. 
    Your goal is to extract structured information about it.

    User Description: "${description}"
    Location: "${location}"

    Based on all this information, identify the item's key features.
    Respond ONLY with a JSON object that conforms to the specified schema.
    `;
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType: mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as ItemFeatures;
  } catch (error) {
    console.error("Error analyzing item with Gemini:", error);
    throw new Error("Failed to analyze item features. The AI model may be temporarily unavailable.");
  }
};


export const findMatches = async (lostItem: Item, foundItems: Item[]): Promise<Match[]> => {
  if (foundItems.length === 0) {
    return [];
  }

  const matchesSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING, description: 'The unique ID of the found item.'},
        matchScore: { type: Type.NUMBER, description: 'A similarity score between 0.0 and 1.0, where 1.0 is a perfect match.'},
        reasoning: { type: Type.STRING, description: 'A brief, one-sentence explanation for why this item is or is not a good match.'}
      },
      required: ['id', 'matchScore', 'reasoning']
    }
  };
  
  const prompt = `
    You are a Lost & Found matching expert. I lost an item and need you to compare it against a list of found items.

    This is the item I LOST:
    ${JSON.stringify(lostItem.features)}
    Description: "${lostItem.description}"
    Location: "${lostItem.location}"

    Here is a list of items that were FOUND:
    ${JSON.stringify(foundItems.map(item => ({ id: item.id, features: item.features, description: item.description, location: item.location})))}

    Compare the lost item to each found item. Consider all features: item name, color, category, brand, distinguishing features, description, and location proximity.
    Return a JSON array of objects for ONLY the items you consider potential matches (matchScore > 0.5), sorted from most likely to least likely match.
    If no items are a good match, return an empty array.
    Your response must be ONLY the JSON array conforming to the specified schema.
    `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: matchesSchema,
      }
    });

    const jsonText = response.text.trim();
    const matchResults: {id: string, matchScore: number, reasoning: string}[] = JSON.parse(jsonText);

    const matches: Match[] = matchResults
      .map(result => {
        const foundItem = foundItems.find(item => item.id === result.id);
        if (!foundItem) return null;
        return {
          ...foundItem,
          matchScore: result.matchScore,
          reasoning: result.reasoning
        };
      })
      .filter((match): match is Match => match !== null);

    return matches;

  } catch (error) {
    console.error("Error finding matches with Gemini:", error);
    throw new Error("Failed to find matches. The AI model may be temporarily unavailable.");
  }
};
