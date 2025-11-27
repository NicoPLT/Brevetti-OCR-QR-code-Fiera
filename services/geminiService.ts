import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ScannedCardData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CARD_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    nome: { type: Type.STRING, description: "Il nome della persona." },
    cognome: { type: Type.STRING, description: "Il cognome della persona." },
    email: { type: Type.STRING, description: "Indirizzo email corretto e validato." },
    telefono: { type: Type.STRING, description: "Numero di telefono in formato internazionale se possibile." },
    ruolo: { type: Type.STRING, description: "Job title o ruolo lavorativo." },
    azienda: { type: Type.STRING, description: "Nome dell'azienda." },
    sito_web: { type: Type.STRING, description: "URL del sito web aziendale." },
    indirizzo: { type: Type.STRING, description: "Indirizzo fisico completo." },
    note: { type: Type.STRING, description: "Note rilevanti trovate nel biglietto." },
  },
  required: ["nome", "cognome", "email", "telefono", "ruolo", "azienda", "sito_web", "indirizzo", "note"],
};

export const analyzeBusinessCard = async (base64Image: string): Promise<ScannedCardData> => {
  try {
    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const cleanBase64 = base64Image.split(",")[1] || base64Image;

    const model = "gemini-2.5-flash";

    const prompt = `
      Analizza l’immagine con OCR.
      Estrai in modo pulito e strutturato i dati del biglietto da visita.
      Se un campo non è presente, restituiscilo come stringa vuota (“”).
      Correggi automaticamente:
      - caratteri speciali mal letti
      - spazi in eccesso
      - formattazione telefono in formato internazionale se possibile
      - email con errori OCR (sostituzioni tipo “@gmaiI.com” → “@gmail.com”)
      
      Se l’immagine è scura, obliqua o sfocata, prova comunque a recuperare più dati possibili.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg", // Assuming JPEG for simplicity from canvas/upload, widely supported
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        systemInstruction: "Sei un assistente OCR avanzato specializzato in biglietti da visita.",
        responseMimeType: "application/json",
        responseSchema: CARD_SCHEMA,
        temperature: 0.1, // Low temperature for factual extraction
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Nessun dato ricevuto dall'AI.");
    }

    const json: ScannedCardData = JSON.parse(text);
    return json;

  } catch (error) {
    console.error("Gemini OCR Error:", error);
    throw error;
  }
};