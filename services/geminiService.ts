import { GoogleGenAI } from "@google/genai";
import { AppState, LocationType, OutfitType, AppMode } from "../types";

const GEMINI_MODEL = 'gemini-2.5-flash-image';

export const generateImage = async (state: AppState, dynamicApiKey?: string): Promise<string> => {
  const apiKey = dynamicApiKey || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key is missing. Please provide a valid API Key.");
  }

  if (!state.referenceImage) {
    throw new Error("Reference image is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  // Determine Prompt Logic based on Mode
  const locationText = state.location === LocationType.CUSTOM ? state.customLocation : state.location;
  const outfitText = state.outfit === OutfitType.CUSTOM ? state.customOutfit : state.outfit;
  
  // Base aesthetic instruction from user request
  const aestheticInstruction = `
    Estilo: hiper-realista, iluminação dourada de fim de tarde (ou coerente com o ambiente se for interior), texturas urbanas e arquitetônicas detalhadas, resolução alta.
    Paleta de cores: branco, cinza, cinza claro, tons de bege, azul turquesa, dourado e rosa do céu.
    A composição transmite uma narrativa de contemplação, estilo de vida e conexão com o dia a dia.
    Ângulo da câmera: ${state.framing}, levemente lateral, com foco na interação entre a pessoa e o ambiente.
  `;

  const identityRule = `
    REGRA FUNDAMENTAL E INVIOLÁVEL: Você DEVE manter o rosto e o cabelo da pessoa na foto original exatamente como são. 
    Preserve todas as suas características autênticas, expressão natural e identidade. 
    Não faça modificações faciais, apenas integre o rosto perfeitamente ao novo ambiente.
    A pele deve ter textura realista, sem parecer boneco de cera ou filtro excessivo.
  `;

  let prompt = "";
  const parts: any[] = [];

  // --- SOLO MODE ---
  if (state.mode === AppMode.SOLO) {
    prompt = `
      Crie uma imagem hiper-realista e cinematográfica baseada na foto da pessoa fornecida.
      
      ${identityRule}
      
      CONTEXTO DA CENA:
      A pessoa está ${state.mood}.
      Local: ${locationText}.
      Roupa: ${outfitText}.
      
      ESTÉTICA:
      ${aestheticInstruction}
    `;
    
    parts.push({ text: prompt });
    parts.push({
      inlineData: {
        mimeType: state.referenceImage.file.type,
        data: state.referenceImage.base64,
      },
    });
  } 
  
  // --- DUO MODE ---
  else if (state.mode === AppMode.DUO) {
    if (!state.secondImage) throw new Error("Second image (Person 2) is missing for Duo mode.");

    prompt = `
      Crie uma imagem hiper-realista com DUAS pessoas juntas em uma cena cotidiana.
      
      Imagem 1 fornecida é a PESSOA A (Esquerda/Principal).
      Imagem 2 fornecida é a PESSOA B (Direita/Secundária).
      
      ${identityRule} (Aplicar para AMBAS as pessoas).
      
      CONTEXTO DA CENA:
      Ação/Pose: Elas estão ${state.duoAction}. Interação natural e espontânea.
      Local: ${locationText}.
      Roupas: Estilo ${outfitText} combinando, casual e confortável (exceto se for evento de gala).
      
      ESTÉTICA:
      ${aestheticInstruction}
    `;

    parts.push({ text: prompt });
    parts.push({
      inlineData: {
        mimeType: state.referenceImage.file.type,
        data: state.referenceImage.base64,
      },
    });
    parts.push({
      inlineData: {
        mimeType: state.secondImage.file.type,
        data: state.secondImage.base64,
      },
    });
  }

  // --- PRODUCT MODE ---
  else if (state.mode === AppMode.PRODUCT) {
    if (!state.secondImage) throw new Error("Product image is missing.");

    prompt = `
      Crie uma imagem lifestyle hiper-realista de uma pessoa interagindo com um produto.
      
      Imagem 1 fornecida é a PESSOA.
      Imagem 2 fornecida é o PRODUTO.
      
      ${identityRule}
      
      REGRA PRODUTO: O produto deve ser inserido na cena de forma natural, realista e orgânica, mantendo seu design original.
      
      CONTEXTO DA CENA:
      Ação: A pessoa está ${state.productAction} (o produto da imagem 2).
      Local: ${locationText}.
      Roupa da pessoa: ${outfitText}.
      
      ESTÉTICA:
      ${aestheticInstruction}
      Estilo: Fotografia comercial lifestyle, suave e aspiracional.
    `;

    parts.push({ text: prompt });
    parts.push({
      inlineData: {
        mimeType: state.referenceImage.file.type,
        data: state.referenceImage.base64,
      },
    });
    parts.push({
      inlineData: {
        mimeType: state.secondImage.file.type,
        data: state.secondImage.base64,
      },
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4"
        }
      }
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const resultParts = candidates[0].content.parts;
      for (const part of resultParts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image generated in the response.");
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    let errorMessage = error.message || "Failed to generate image.";
    if (errorMessage.includes("{")) {
        try {
            const parsed = JSON.parse(errorMessage.substring(errorMessage.indexOf("{")));
            if (parsed.error && parsed.error.message) {
                errorMessage = parsed.error.message;
            }
        } catch (e) {
        }
    }
    throw new Error(errorMessage);
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const fileToDataURL = (file: File): Promise<string> => {
   return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}