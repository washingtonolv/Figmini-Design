import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateContentSuggestion = async (prompt: string, currentText: string): Promise<string> => {
  if (!apiKey) return "Erro: API Key não encontrada.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a UX writer assistant. The user wants to improve or generate text for a design interface.
      Context/Current Text: "${currentText}"
      User Request: "${prompt}"
      
      Return ONLY the suggested text string, no explanations, no quotes. Keep it concise and fit for UI.`,
    });
    return response.text?.trim() || currentText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erro ao gerar texto.";
  }
};

export const generateColorSuggestion = async (prompt: string): Promise<string> => {
  if (!apiKey) return "#cccccc";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a UI Designer. Generate a hexadecimal color code based on this request: "${prompt}".
      Return ONLY the hex code (e.g., #FF0000). Nothing else.`,
    });
    const color = response.text?.trim();
    // Validate simple hex regex
    if (color && /^#[0-9A-F]{6}$/i.test(color)) {
      return color;
    }
    return "#3b82f6"; // Fallback blue
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "#3b82f6";
  }
};
