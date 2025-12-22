
import { GoogleGenAI } from "@google/genai";
import { AppState, LocationType, LightingType, OutfitType, MoodType, FramingType, AppMode, DuoAction, ProductAction, LogoStyle, SocialPlatform, ViralStrategyResult, ContentCreationResult, ContentTemplate, ConsultingResult, LogoIdentityResult } from "../types";

const GEMINI_MODEL_IMAGE = 'gemini-2.5-flash-image';
const GEMINI_MODEL_TEXT = 'gemini-3-flash-preview';

const safetySettings = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
];

export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const fileToBase64 = async (file: File): Promise<string> => {
  const dataUrl = await fileToDataURL(file);
  return dataUrl.split(',')[1];
};

export const enhanceUserPrompt = async (originalText: string, dynamicApiKey?: string): Promise<string> => {
  const apiKey = dynamicApiKey || process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey });
  const systemInstruction = `Atue como um DIRETOR DE VFX. Reescreva o prompt para FOTREALISMO extremo: "${originalText}". Retorne apenas o prompt em inglês.`;
  try {
    const response = await ai.models.generateContent({ 
      model: GEMINI_MODEL_TEXT, 
      contents: systemInstruction,
      config: { safetySettings } 
    });
    return response.text.trim();
  } catch (error) { return originalText; }
};

export const generateImage = async (state: AppState, dynamicApiKey?: string): Promise<string> => {
  const apiKey = dynamicApiKey || process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey: apiKey });
  const parts: any[] = [];
  
  if (state.referenceImage) {
    parts.push({ inlineData: { mimeType: state.referenceImage.file.type || 'image/png', data: state.referenceImage.base64 } });
  }

  if (state.secondImage) {
    parts.push({ inlineData: { mimeType: state.secondImage.file.type || 'image/png', data: state.secondImage.base64 } });
  }

  // Comandos ultra específicos para manter o rosto e aplicar o enquadramento
  const basePrompt = `MASTERPIECE PHOTOGRAPHY. 
    ULTRA-CRITICAL INSTRUCTION: STICK TO THE ORIGINAL FACES. DO NOT ALTER FACIAL FEATURES, EYES, NOSE, OR MOUTH. 
    Subject(s) must remain exactly as shown in reference images, but placed in a new context.
    
    Framing/Shot Type: ${state.framing || "Original framing"}. 
    Location: ${state.location}. 
    Lighting: ${state.lighting}. 
    Clothing Style: ${state.outfit}. 
    Vibe: ${state.mood}.
    
    Technical: Shot on 35mm lens, f/1.8, 8k resolution, cinematic post-processing.
    User Extra Request: ${state.customPrompt || "Professional editorial look"}.
    
    MANDATORY: 100% face preservation. No face-swapping effects that change the soul of the person. Real skin texture.`;

  parts.push({ text: basePrompt });

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_IMAGE,
      contents: { parts: parts },
      config: { 
        safetySettings,
        imageConfig: { 
          aspectRatio: (state.mode === AppMode.LOGO || state.mode === AppMode.SOCIAL_PROFILE) ? "1:1" : "3:4"
        } 
      }
    });

    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error("Sem resposta da IA.");

    if (candidate.finishReason === 'SAFETY') {
      throw new Error("⚠️ BLOQUEIO: A IA achou o conteúdo sensível. Tente fotos mais casuais.");
    }

    if (!candidate.content?.parts) throw new Error("Erro na geração da imagem.");

    for (const part of candidate.content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    
    throw new Error("Imagem não encontrada.");
  } catch (error: any) {
    throw new Error(error.message || "Erro na geração.");
  }
};

export const generateLogoIdentity = async (state: AppState, dynamicApiKey?: string): Promise<LogoIdentityResult> => {
  const apiKey = dynamicApiKey || process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey });
  const prompt = `Gere um JSON de Manual de Identidade Visual para a marca "${state.brandName}" no estilo "${state.logoStyle}".`;
  try {
    const response = await ai.models.generateContent({ model: GEMINI_MODEL_TEXT, contents: prompt, config: { responseMimeType: 'application/json', safetySettings } });
    return JSON.parse(response.text || "{}");
  } catch (error) { throw new Error("Falha na identidade."); }
};
