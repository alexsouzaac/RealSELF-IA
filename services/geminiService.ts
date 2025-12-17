
import { GoogleGenAI } from "@google/genai";
import { AppState, LocationType, LightingType, OutfitType, MoodType, FramingType, AppMode, DuoAction, ProductAction, LogoStyle, SocialPlatform, ViralStrategyResult, ContentCreationResult, ContentTemplate, ConsultingResult, LogoIdentityResult } from "../types";

const GEMINI_MODEL_IMAGE = 'gemini-2.5-flash-image';
const GEMINI_MODEL_TEXT = 'gemini-2.5-flash';

// Dicionário com as instruções exatas de cada modelo viral (Gatilhos Psicológicos)
const TEMPLATE_INSTRUCTIONS: Record<ContentTemplate, string> = {
  // --- GERAIS ---
  [ContentTemplate.IDENTIFICATION]: `GATILHO: Identificação Imediata. "Isso é tão eu!". Situação embaraçosa ou comum.`,
  [ContentTemplate.POV_OBJECTION]: `GATILHO: Quebra de Objeção/Crença. "Você acha que X, mas é Y".`,
  [ContentTemplate.TUTORIAL_HACK]: `GATILHO: Utilidade Rápida. "Segredo/Atalho que ninguém te contou".`,
  [ContentTemplate.WARNING_ERROR]: `GATILHO: Medo de Errar (FOMO). "Pare de fazer isso agora!".`,
  [ContentTemplate.JOURNEY_CHALLENGE]: `GATILHO: Vulnerabilidade e Processo. "Dia 01 tentando...".`,
  [ContentTemplate.LIST_TOP_X]: `GATILHO: Autoridade e Curadoria. "Os melhores X para Y".`,
  [ContentTemplate.MINI_VLOG]: `GATILHO: Conexão Lifestyle. Bastidores estéticos.`,
  [ContentTemplate.CREATIVE_EFFECTS]: `GATILHO: Retenção Visual. "Como ele fez isso?".`,
  [ContentTemplate.SATISFYING]: `GATILHO: Prazer Visual/ASMR. Do caos à ordem.`,
  [ContentTemplate.DID_YOU_KNOW]: `GATILHO: Curiosidade/Choque. "Morria e não sabia".`,
  [ContentTemplate.PREMIUM_QUOTES]: `GATILHO: Sofisticação Emocional. Frases reflexivas, maduras e estéticas sobre vida simples e paz interior.`,

  // --- NICHOS ESPECÍFICOS ---
  [ContentTemplate.MEDICAL_GENERAL]: `GATILHO: Autoridade Médica. Desmistificar mitos de saúde ou alerta de sintomas.`,
  [ContentTemplate.MEDICAL_PSYCHIATRIST]: `GATILHO: Validação Emocional. Explicar sentimentos via neurociência.`,
  [ContentTemplate.NURSING_CARE]: `GATILHO: Curiosidade de Bastidores ou Dica Prática de Cuidado.`,
  [ContentTemplate.LEGAL_ADVOCATE]: `GATILHO: "Eles não querem que você saiba". Direitos ocultos.`,
  [ContentTemplate.PHYSIO_TIPS]: `GATILHO: Alívio de Dor Imediato. Solução visual para desconforto.`,
  [ContentTemplate.AESTHETIC_CLINIC]: `GATILHO: Desejo e Transformação. Visual "Satisfatório" do procedimento.`,
  [ContentTemplate.MASSAGE_THERAPY]: `GATILHO: Relaxamento Vicário (ASMR). Transmitir paz visualmente.`,
  [ContentTemplate.GERIATRIC_CARE]: `GATILHO: Cuidado e Proteção. Alertas de segurança em casa.`,
  [ContentTemplate.PSYCHOLOGY_TIPS]: `GATILHO: Padrões de Comportamento. "Por que você faz X?".`,
  [ContentTemplate.RANDOM_LIFESTYLE]: `GATILHO: Fofoca ou Caos. Storytime envolvente.`,
};

// Mapa de Formatos por Rede Social
const PLATFORM_FORMATS: Record<string, string[]> = {
    [SocialPlatform.INSTAGRAM]: [
        "Reels (Vídeo Curto Viral)",
        "Carrossel (Educativo/Lista - Feed)",
        "Sequência de Stories (Engajamento/Enquete)"
    ],
    [SocialPlatform.LINKEDIN]: [
        "Vídeo Vertical (Profissional)",
        "Post de Texto + Foto (Copywriting/Storytelling)",
        "Carrossel PDF (Técnico/Documental)"
    ],
    [SocialPlatform.TIKTOK]: [
        "Vídeo Viral (Hook Rápido)",
        "Vídeo Respondendo Comentário (Explicação)",
        "Photo Mode (Carrossel de Fotos com Música)"
    ],
    [SocialPlatform.YOUTUBE]: [
        "Shorts (Viral)",
        "Roteiro de Vídeo Longo (Estrutura de Tópicos)",
        "Post na Comunidade (Enquete/Texto)"
    ],
    [SocialPlatform.TWITTER]: [
        "Thread (Fio detalhado)",
        "Tweet Único (Punchline/Frase de Efeito)",
        "Meme/Visual (Descrição da Imagem)"
    ],
    [SocialPlatform.WHATSAPP]: [
        "Status (Vídeo Curto/Direto)",
        "Texto de Transmissão (Pessoal)",
        "Áudio Script (Roteiro para gravar áudio)"
    ]
};

// Função auxiliar para esperar (delay)
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

/**
 * PROMPT ENHANCER V3 (VFX SUPERVISOR - ANTI-COLLAGE)
 * Foco total em iluminação, integração e eliminação de bordas artificiais.
 */
export const enhanceUserPrompt = async (originalText: string, dynamicApiKey?: string): Promise<string> => {
  const apiKey = dynamicApiKey || process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey: apiKey });

  const systemInstruction = `
    Atue como um DIRETOR DE VFX (Efeitos Visuais) premiado.
    O usuário quer inserir uma pessoa na imagem, mas odeia o "efeito adesivo" (recorte mal feito, luz errada, pessoa flutuando).
    
    SUA MISSÃO: Reescrever o prompt para garantir "FOTREALISMO DE CINEMA".
    
    CHECKLIST DE CORREÇÃO (Obrigatório incluir no prompt):
    1. MATCH LIGHTING: A luz na pessoa inserida DEVE ter a mesma direção, cor e intensidade do ambiente original.
    2. CONTACT SHADOWS (Ambient Occlusion): Se houver toque, TEM QUE haver sombra escura e suave no ponto de contato. Nada de mão flutuando.
    3. COLOR GRADING UNIFICADO: A temperatura de cor da pele deve bater com a atmosfera do local (ex: se o local é azulado/balada, a pessoa não pode estar amarela/sol).
    4. INTERAÇÃO FÍSICA: Se estiver abraçando, a roupa da pessoa original deve "amassar" levemente com a pressão da mão.
    
    OUTPUT ESPERADO (Técnico e Direto):
    "Cinematic integration of [Subject Description]. 
    CRITICAL: Match scene lighting (Direction: [Source], Temp: [Cool/Warm]). 
    Apply heavy ambient occlusion at contact points (waist/shoulder) to ground the subject. 
    Subject must interact physically with the environment (fabric compression, weight distribution). 
    Blend edges with atmospheric bloom. Unified ISO noise."

    Entrada do usuário: "${originalText}"
    
    Retorne APENAS o prompt técnico melhorado em Inglês.
  `;

  try {
    const response = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: systemInstruction,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Enhance error", error);
    return originalText; // Fallback
  }
};

export const generateLogoIdentity = async (state: AppState, dynamicApiKey?: string): Promise<LogoIdentityResult> => {
  const apiKey = dynamicApiKey || process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey: apiKey });

  const prompt = `
    Atue como um Diretor de Criação Sênior. Você acabou de desenhar o logo para a marca "${state.brandName}".
    O estilo visual escolhido foi: "${state.logoStyle}".
    Descrição extra: "${state.customPrompt}".

    Agora, sua tarefa é criar o MANUAL DE IDENTIDADE VISUAL RÁPIDO (Brand Book) para esta marca.
    
    Retorne APENAS um objeto JSON válido com a seguinte estrutura:
    {
      "brandName": "${state.brandName}",
      "tagline": "Um slogan curto e memorável (3-6 palavras)",
      "story": "Um parágrafo curto (max 40 palavras) sobre o conceito e a essência desta marca.",
      "brandArchetype": {
        "name": "O arquétipo dominante (Ex: O Criador, O Mago, O Governante)",
        "description": "Explicação curta do porquê."
      },
      "colorPalette": [
        // Gere 4 cores harmônicas que combinem com o estilo "${state.logoStyle}"
        { "hex": "#HEX", "name": "Nome Criativo da Cor", "usage": "Uso sugerido (Ex: Fundo, Destaque)" }
      ],
      "typography": {
        "primaryFont": "Sugestão de fonte para títulos (Ex: Montserrat, Playfair Display)",
        "secondaryFont": "Sugestão de fonte para corpo (Ex: Lato, Roboto)",
        "usageTip": "Dica de como combinar as fontes."
      },
      "visualElements": [
        "Elemento visual 1 (Ex: Linhas finas e orgânicas)",
        "Elemento visual 2 (Ex: Formas geométricas sólidas)"
      ],
      "applicationTips": [
        "Dica prática 1 de onde aplicar o logo",
        "Dica prática 2 de o que evitar",
        "Dica prática 3 sobre fotografia"
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });

    const text = response.text || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let cleanText = jsonMatch ? jsonMatch[0] : text;
    return JSON.parse(cleanText) as LogoIdentityResult;

  } catch (error) {
      console.error("Erro na identidade visual:", error);
      throw new Error("Falha ao gerar guia da marca.");
  }
};

export const generateConsultingReport = async (state: AppState, dynamicApiKey?: string): Promise<ConsultingResult> => {
  const apiKey = dynamicApiKey || process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey: apiKey });

  const prompt = `
    Atue como um CONSULTOR DE MARKETING E NEGÓCIOS SÊNIOR da agência "Alex Souza Agencia de Marketing e Criação de Conteúdo".
    
    TAREFA: Planejamento Estratégico + Proposta Comercial para:
    Cliente: "${state.consultingCompany}"
    Serviço: "${state.consultingProduct}"
    Objetivo: "${state.consultingGoal}"
    Público: "${state.consultingAudience}"

    ESTRUTURA DO JSON (MANDATÓRIA):
    1. marketAnalysis: Análise do nicho.
    2. brandArchetype: Arquétipo (ex: Sábio, Herói).
    3. visualIdentitySuggestion: Paleta e Tipografia.
    4. contentPillars: 4 temas macro (Array string).
    5. growthStrategy: Táticas de crescimento.
    6. calendarExample: Exemplo de semana.
    7. agencyWorkflow: Etapas de trabalho.
    8. pricingPlans: Array de objetos.
       
       IMPORTANTE - REGRAS DE PRECIFICAÇÃO (AVULSOS VS PACOTE):
       Você DEVE retornar 4 (QUATRO) Planos no array 'pricingPlans'.
       
       Plano 1: "START" (Básico mensal).
       Plano 2: "PRO" (Intermediário mensal).
       Plano 3: "ADVANCED" (Completo mensal).
       
       Plano 4: "MENU DE SERVIÇOS AVULSOS" (OBRIGATÓRIO):
       - Nome: "Menu Avulso (À la Carte)"
       - Preço: "Consulte Tabela"
       - Descrição: "Contratação individual sob demanda."
       - Features: (LISTA OBRIGATÓRIA DE ITENS):
         - "Vídeo Curto (até 60s): R$ 150,00 (unidade)"
         - "Kit 3 Vídeos (60s): R$ 400,00 (R$ 133/un)"
         - "Kit 4 Vídeos (60s): R$ 500,00 (R$ 125/un)"
         - "Post Estático: R$ 80,00 (unidade)"
         - "Pacote 8 Posts: R$ 560,00"
         - "Carrossel Educativo: R$ 200,00 (unidade)"
         - "Kit 3 Carrosséis: R$ 500,00"

       Nos planos mensais (1, 2 e 3), na lista de features, destaque a economia.
       Ex: "4 Reels (Incluso - Economia de 20%)"

    Retorne APENAS o JSON válido. NÃO use comentários.
    {
      "clientName": "${state.consultingCompany}",
      "marketAnalysis": "texto",
      "brandArchetype": "texto",
      "visualIdentitySuggestion": "texto",
      "contentPillars": ["pilar1", "pilar2"],
      "growthStrategy": "texto",
      "calendarExample": "texto",
      "agencyWorkflow": "texto",
      "pricingPlans": [
         { "name": "Start", "price": "R$ 1500", "description": "desc", "features": ["item1", "item2"] },
         { "name": "Pro", "price": "R$ 3000", "description": "desc", "features": ["item1", "item2"] },
         { "name": "Advanced", "price": "R$ 5000", "description": "desc", "features": ["item1", "item2"] },
         { "name": "Menu Avulso", "price": "Tabela", "description": "Itens individuais", "features": ["Vídeo: R$ 150", "Post: R$ 80"] }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: prompt,
        config: {
            responseMimeType: 'application/json'
        }
    });

    const text = response.text || "{}";
    
    // Extração robusta do JSON: busca o primeiro objeto JSON válido na resposta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let cleanText = jsonMatch ? jsonMatch[0] : text;

    return JSON.parse(cleanText) as ConsultingResult;

  } catch (error) {
      console.error("Erro na consultoria:", error);
      throw new Error("Falha ao gerar relatório. Tente novamente ou verifique sua API Key.");
  }
};

export const generateContentStrategy = async (state: AppState, dynamicApiKey?: string): Promise<ContentCreationResult> => {
  const apiKey = dynamicApiKey || process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey: apiKey });

  let prompt = "";
  
  if (state.contentTemplate === ContentTemplate.PREMIUM_QUOTES) {
      prompt = `
        Atue como um gerador de conteúdo PREMIUM para Instagram.
        ESTILO: Frases reflexivas, maduras, sofisticadas. Foco em vida simples, paz interior, afeto e leveza. Evite atacar luxo ou status, apenas valorize o essencial.
        
        TEMA: "${state.customPrompt}"
        
        Sua tarefa é gerar 3 FRASES DISTINTAS seguindo a estrutura de BLOCOS abaixo.
        Você deve formatar a saída EXATAMENTE como o JSON solicitado no final, mapeando os blocos para os campos do JSON.
        
        ESTRUTURA DE CADA PEÇA (Mapeamento para JSON):
        1. BLOCO 1 (A Frase): Curta, reflexiva, sem emojis. (Coloque no campo 'script' do JSON).
        2. BLOCO 2 (Prompt de Imagem): Ultra realista, cinematográfico, luz natural, atmosfera coerente com a frase. (Coloque no campo 'visualSuggestion' do JSON).
        3. BLOCO 3 (Legenda): Complementa a frase, tom calmo, máx 1 emoji. (Coloque no campo 'hook' do JSON).
        4. BLOCO 4 (Hashtags + Música): 5-10 tags e sugestão de música calma/lo-fi/indie. (Coloque no campo 'aestheticTip' do JSON).
        5. BLOCO 5 (Dica Estética): Uma frase curta e direta sobre a estética da imagem (cores, filtro, composição) que combina com essa postagem específica. (Coloque no campo 'aestheticTip' do JSON).
        
        Retorne APENAS um objeto JSON válido com esta estrutura:
        {
          "topic": "Resumo do tema",
          "pieces": [
            {
              "format": "Frase Premium",
              "script": "A FRASE AQUI (Bloco 1)",
              "visualSuggestion": "O PROMPT DE IMAGEM AQUI (Bloco 2)",
              "hook": "A LEGENDA AQUI (Bloco 3)",
              "musicSuggestion": "TAGS E MÚSICA AQUI (Bloco 4)",
              "aestheticTip": "A DICA ESTÉTICA AQUI (Bloco 5)",
              "cta": "Não use este campo",
              "whyItWorks": "Sofisticação e conexão emocional."
            },
            // ... Repita para Frase 2 e Frase 3 (Total 3 itens no array)
          ],
          "growthTips": [
             "Use áudios em alta de piano ou acústicos.",
             "Publique nos horários de pico noturnos (reflexão).",
             "A estética da imagem é 80% do sucesso deste post."
          ]
        }
      `;
  } else {
      const templateInstruction = TEMPLATE_INSTRUCTIONS[state.contentTemplate] || TEMPLATE_INSTRUCTIONS[ContentTemplate.IDENTIFICATION];
      const targetFormats = PLATFORM_FORMATS[state.socialPlatform] || ["Vídeo Reels", "Carrossel", "Story"];

      prompt = `
        Atue como um Especialista em Criação de Conteúdo e, PRINCIPALMENTE, como um CONSULTOR TÉCNICO SÊNIOR (Fact-Checker).
        
        TEMA CENTRAL: "${state.customPrompt}"
        ESTRATÉGIA VIRAL: ${templateInstruction}
        PLATAFORMA: ${state.socialPlatform}
        
        DIRETRIZES DE INTEGRIDADE E ESTRUTURA:
        1. ANTI-ALUCINAÇÃO: Informações devem ser fidedignas e éticas.
        2. VÍDEOS (Reels/TikTok/Shorts): VOCÊ DEVE GERAR "videoScenes" para cada peça de vídeo.
           - O campo "finalPrompt" deve ser um prompt de engenharia pronto para uso em Veo/Sora, detalhando câmera, iluminação e movimento.
        3. CARROSSÉIS (Slide a Slide): VOCÊ DEVE GERAR "slides" para cada peça de formato Carrossel/Documento.
           - Detalhe Título, Texto do Slide e Prompt Visual do Slide.
        
        Gere uma campanha com 3 peças de conteúdo (${targetFormats.join(', ')}).
        
        Retorne APENAS um objeto JSON válido com a seguinte estrutura:
        {
          "topic": "Resumo do tema",
          "pieces": [
            {
              "format": "${targetFormats[0]} (Ex: Vídeo Reels)", 
              "hook": "Gancho/Legenda principal",
              "script": "Roteiro completo (Narrativa ou Legenda)",
              "cta": "Chamada para ação",
              "visualSuggestion": "Resumo visual simples",
              "aestheticTip": "Dica de cor/filtro",
              "musicSuggestion": "Sugestão de áudio",
              "whyItWorks": "Explicação estratégica",
              
              // PREENCHA 'videoScenes' SE FOR VÍDEO. DEIXE [] SE FOR FOTO/CARROSSEL.
              "videoScenes": [
                 {
                   "sceneNumber": 1,
                   "characterDescription": "Descrição EXTREMAMENTE detalhada do personagem (Idade, etnia, roupa, cabelo). Mantenha consistente.",
                   "environment": "Descrição do cenário (Ex: 'Modern aesthetic clinic background, soft depth of field')",
                   "action": "Ação visual (Ex: 'Holding a glass of water, looking skeptical')",
                   "dialogue": "Texto falado (Máx 15 palavras)",
                   "finalPrompt": "Cinematic shot of [characterDescription] in [environment], [action]. 8k, photorealistic, soft lighting, arri alexa style. --ar 9:16"
                 }
              ],

              // PREENCHA 'slides' SE FOR CARROSSEL/DOCUMENTO. DEIXE [] SE FOR VÍDEO.
              "slides": [
                 {
                    "slideNumber": 1,
                    "title": "Título do Slide (Impactante)",
                    "content": "Texto principal do slide (Curto e direto)",
                    "visualPrompt": "Minimalist graphic design, bold typography, contrasting colors. Text overlay area."
                 },
                 {
                    "slideNumber": 2,
                    "title": "Subtítulo / Desenvolvimento",
                    "content": "Explicação ou lista de itens...",
                    "visualPrompt": "Infographic style illustration showing [concept]."
                 }
                 // ...até 5 a 7 slides
              ]
            },
            // ... repita para as outras 2 peças
          ],
          "growthTips": [
             "Use áudios em alta de piano ou acústicos.",
             "Publique nos horários de pico noturnos (reflexão).",
             "A estética da imagem é 80% do sucesso deste post."
          ]
        }
      `;
  }

  try {
    const response = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: prompt,
        config: {
            responseMimeType: 'application/json'
        }
    });

    const text = response.text || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let cleanText = jsonMatch ? jsonMatch[0] : text;
    return JSON.parse(cleanText) as ContentCreationResult;

  } catch (error) {
      console.error("Erro no gerador de conteúdo:", error);
      throw new Error("Falha ao gerar estratégia de conteúdo. Tente novamente.");
  }
};

export const generateViralProfileStrategy = async (state: AppState, dynamicApiKey?: string): Promise<ViralStrategyResult> => {
  const apiKey = dynamicApiKey || process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey: apiKey });

  const prompt = `
    Atue como um Estrategista de Mídia Social Sênior e Especialista em Branding Viral.
    
    O usuário deseja otimizar o perfil para: ${state.socialPlatform}.
    Tipo de Perfil: ${state.profileType}.
    Nicho/Área: ${state.profileNiche}.
    Objetivo Principal: ${state.profileGoal}.
    Vibe/Estilo Visual Desejado: ${state.socialStyle}.
    Descrição Extra: ${state.customPrompt}.

    Sua tarefa é criar um KIT DE MARCA VIRAL completo.
    
    Retorne APENAS um objeto JSON válido (sem markdown, sem code blocks) com a seguinte estrutura exata:
    {
      "usernames": ["@usuario1", "@usuario2", "@usuario3"], // 3 nomes magnéticos, curtos e memoráveis disponíveis.
      "bio": "Texto da bio otimizado para ${state.socialPlatform} com quebras de linha e emojis estratégicos. Inclua CTA se apropriado.",
      "headline": "Uma frase de impacto curta (Headline) para usar abaixo do nome ou em destaque.",
      "colorPalette": [
         {"color": "#HEXCODE", "name": "Nome da Cor"},
         {"color": "#HEXCODE", "name": "Nome da Cor"},
         {"color": "#HEXCODE", "name": "Nome da Cor"}
      ],
      "typography": "Sugestão de par de fontes (Ex: Montserrat para títulos, Lato para corpo).",
      "contentStrategy": {
        "feed": "Dica estratégica de estilo de postagem para o Feed.",
        "stories": "Dica estratégica para Stories diários.",
        "reels": "Ideia de conteúdo viral para Reels/Shorts."
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: prompt,
        config: {
            responseMimeType: 'application/json'
        }
    });

    const text = response.text || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let cleanText = jsonMatch ? jsonMatch[0] : text;
    return JSON.parse(cleanText) as ViralStrategyResult;

  } catch (error) {
      console.error("Erro na consultoria viral:", error);
      throw new Error("Falha ao gerar estratégia viral. Tente novamente.");
  }
};

export const generateImage = async (state: AppState, dynamicApiKey?: string): Promise<string> => {
  const apiKey = dynamicApiKey || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key is missing. Please provide a valid API Key.");
  }

  if (state.mode !== AppMode.TEXT_TO_IMAGE && 
      state.mode !== AppMode.LOGO && 
      state.mode !== AppMode.CONTENT_CREATION && 
      state.mode !== AppMode.CONSULTING && 
      !state.referenceImage) {
    throw new Error("Reference image is missing.");
  }
  
  if ((state.mode === AppMode.CONTENT_CREATION || state.mode === AppMode.CONSULTING) && !state.customPrompt) {
      throw new Error("Missing description for image generation.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  const locationText = state.location === LocationType.CUSTOM ? state.customLocation : state.location;
  const outfitText = state.outfit === OutfitType.CUSTOM ? state.customOutfit : state.outfit;
  
  // NANO BANANA PRO: TÉCNICAS DE ESTÚDIO PARA QUALIDADE E REALISMO
  const nanoBananaProInstruction = `
    QUALIDADE VISUAL "NANO BANANA PRO" (ESTÚDIO & ÓPTICA):
    1. LENTES: Simule lente 85mm (retratos) ou 50mm (padrão). Evite distorção de grande angular (wide-angle) no rosto.
    2. TEXTURA DE PELE: Hiper-realista (Visible pores, vellus hair, texture). NADA de pele lisa/plástica.
    3. ILUMINAÇÃO: Use iluminação baseada na geometria real do rosto da foto.
  `;
  
  // REGRA ANTI-COLAGEM REVISADA COM "NEGATIVE COMMANDS" EXPLÍCITOS
  const seamlessIntegrationRule = `
    CRITICAL VFX SUPERVISOR INSTRUCTIONS (ANTI-COLLAGE PROTOCOL):
    
    1. NEGATIVE PROMPTS (WHAT TO AVOID):
       - NO "sticker effect", NO "bad photoshop", NO "floating heads", NO "hard cut-out edges".
       - NO mismatched lighting temperatures (e.g., cool subject on warm background).
       - NO inconsistent noise/grain.
    
    2. PHYSICS & INTERACTION:
       - CONTACT SHADOWS (Ambient Occlusion): If the subject touches anything (chair, person, rail), there MUST be deep, soft shadows at the contact point.
       - WEIGHT: The subject must look like they have weight and are affecting the environment (pressing into the seat, compressing fabric).
    
    3. LIGHTING MATCH (GLOBAL ILLUMINATION):
       - Analyze the background light source direction and intensity.
       - Re-light the inserted subject to match this EXACT lighting setup.
       - Match the "Black Level" of the subject to the background.
    
    4. FINAL COMPOSITING:
       - Apply a unified film grain/ISO noise over the entire image to glue the layers together.
       - Soften the edges of the subject slightly to blend with the atmosphere.
  `;

  // LÓGICA CONDICIONAL: "ORIGINAL" vs "ALTERADO"
  const outfitInstruction = (state.outfit as string).includes('Original') || (state.outfit as string).includes('NONE')
    ? `VESTUÁRIO: MANTER ROUPA ORIGINAL. Não altere tecido, cor ou caimento.`
    : `VESTUÁRIO: Alterar para "${outfitText}". Mantenha o caimento realista no corpo.`;

  const locationInstruction = (state.location as string).includes('Original') || (state.location as string).includes('NONE')
    ? `CENÁRIO: MANTER FUNDO ORIGINAL.`
    : `CENÁRIO: Alterar para "${locationText}".`;

  const lightingInstruction = (state.lighting as string).includes('Original') || (state.lighting as string).includes('NONE')
    ? `ILUMINAÇÃO: Manter luz original.`
    : `ILUMINAÇÃO: Alterar para "${state.lighting}".`;

  const moodInstruction = (state.mood as string).includes('Original') || (state.mood as string).includes('NONE')
    ? `EXPRESSÃO: TRAVAR EXPRESSÃO ORIGINAL. Não sorrir se estiver sério. Não abrir a boca se estiver fechada.`
    : `EXPRESSÃO: Alterar para "${state.mood}", mas mantenha a estrutura óssea facial inalterada.`;

  // --- NOVA REGRA CRÍTICA: TRAVAMENTO ANGULAR E ESTRUTURAL ---
  const structuralLockRule = `
    DIRETRIZES DE TRAVAMENTO ESTRUTURAL E ANGULAR (CRÍTICO):
    1. TRAVAMENTO DE ÂNGULO (ANGLE LOCK): Mantenha ESTRITAMENTE o ângulo da cabeça e do corpo da foto original. 
       - Se a pessoa está de frente (Frontal), mantenha frontal. 
       - Se está de lado (Perfil/3-4), mantenha EXATAMENTE o mesmo grau de rotação.
       - NÃO tente "girar" a cabeça ou mudar a pose. A variação de ângulo deve ser ZERO graus.
    
    2. MAPEAMENTO DE PIXELS (PIXEL MAPPING): 
       - Use os pixels faciais visíveis como verdade absoluta. 
       - NÃO INVENTE partes do rosto que não estão visíveis (ex: não crie a outra orelha se a pessoa está de perfil).
       - A geometria do crânio, nariz, olhos e boca deve ser pixel-perfect em relação à referência.
    
    3. EXPRESSÃO SEM DEFORMAÇÃO: 
       - Ao mudar a expressão (apenas se solicitado), mova apenas os micro-músculos faciais (canto da boca, pálpebras), SEM alterar a rotação da mandíbula ou do crânio.
    
    4. CONSISTÊNCIA 100%: O objetivo é parecer a MESMA foto, apenas com o "render" melhorado ou roupa/fundo trocados. Não crie uma "nova pose".
  `;
  
  // INSTRUÇÃO DE OVERRIDE (COMANDOS DO USUÁRIO EM TEXTO LIVRE)
  // Isso permite que o usuário escreva "adicione um cara me abraçando" e isso sobrescreva ou complemente o resto.
  const userOverrideInstruction = state.customPrompt ? `
    INSTRUÇÃO PRIORITÁRIA DO USUÁRIO (MANUAL OVERRIDE):
    "${state.customPrompt}"
    
    ATENÇÃO: Execute esta instrução acima com prioridade, mas mantendo as regras de "Structural Lock" e "Nano Banana Pro" para proteger a identidade da pessoa.
  ` : "";

  let prompt = "";
  const parts: any[] = [];

  if (state.mode === AppMode.SOLO) {
    prompt = `
      Crie uma imagem hiper-realista da pessoa fornecida.
      
      ${userOverrideInstruction}
      
      INSTRUÇÕES DE PRESERVAÇÃO:
      ${locationInstruction}
      ${outfitInstruction}
      ${lightingInstruction}
      ${moodInstruction}
      ${state.framing !== FramingType.NONE ? `ENQUADRAMENTO: ${state.framing}` : 'ENQUADRAMENTO: Manter zoom e corte originais.'}

      ${structuralLockRule}
      ${nanoBananaProInstruction}
      ${seamlessIntegrationRule}
    `;
    parts.push({ text: prompt });
    if (state.referenceImage) {
        parts.push({ inlineData: { mimeType: state.referenceImage.file.type, data: state.referenceImage.base64 } });
    }
  } 
  else if (state.mode === AppMode.DUO) {
    if (!state.secondImage) throw new Error("Second image (Person 2) is missing for Duo mode.");
    if (!state.referenceImage) throw new Error("Reference image is missing.");
    prompt = `
      Crie uma imagem hiper-realista com DUAS pessoas.
      Imagem 1: PESSOA A. Imagem 2: PESSOA B.
      
      ${userOverrideInstruction}
      
      INSTRUÇÕES DE FUSÃO:
      - Combine as pessoas em uma cena coesa, mas MANTENHA SUAS POSES E ÂNGULOS ORIGINAIS INDIVIDUAIS.
      - Não force interação física (abraços) se isso exigir rotação antinatural dos corpos.
      
      ${locationInstruction}
      ${outfitInstruction}
      
      AÇÃO: ${state.duoAction !== DuoAction.NONE ? state.duoAction : 'Manter poses originais, apenas ajustando a proximidade'}.

      ${structuralLockRule} (Aplicar rigorosamente para AMBAS as pessoas).
      ${nanoBananaProInstruction}
      ${seamlessIntegrationRule}
    `;
    parts.push({ text: prompt });
    parts.push({ inlineData: { mimeType: state.referenceImage.file.type, data: state.referenceImage.base64 } });
    parts.push({ inlineData: { mimeType: state.secondImage.file.type, data: state.secondImage.base64 } });
  }
  else if (state.mode === AppMode.PRODUCT) {
    if (!state.secondImage) throw new Error("Product image is missing.");
    if (!state.referenceImage) throw new Error("Reference image is missing.");
    
    const productActionText = state.productAction !== ProductAction.NONE ? state.productAction : "Posicionamento natural do produto na cena";

    prompt = `
      Fotografia comercial lifestyle (Product Photography).
      Imagem 1: MODELO. Imagem 2: PRODUTO.
      
      TAREFA: Compor a imagem mantendo a integridade da modelo.
      AÇÃO: ${productActionText}.
      
      ${userOverrideInstruction}
      
      ${locationInstruction}
      ${outfitInstruction}
      
      ${structuralLockRule}
      ${nanoBananaProInstruction}
      ${seamlessIntegrationRule}
    `;
    parts.push({ text: prompt });
    parts.push({ inlineData: { mimeType: state.referenceImage.file.type, data: state.referenceImage.base64 } });
    parts.push({ inlineData: { mimeType: state.secondImage.file.type, data: state.secondImage.base64 } });
  }
  else if (state.mode === AppMode.TEXT_TO_IMAGE || state.mode === AppMode.CONTENT_CREATION || state.mode === AppMode.CONSULTING) {
      if (!state.customPrompt) throw new Error("Please provide a text description.");
      prompt = `
        Fotografia de estúdio baseada em: "${state.customPrompt}".
        
        ${locationInstruction}
        ${lightingInstruction}
        ${outfitInstruction !== 'VESTUÁRIO: MANTER ROUPA ORIGINAL.' ? outfitInstruction : ''}
        
        ${nanoBananaProInstruction}
      `;
      parts.push({ text: prompt });
  }
  else if (state.mode === AppMode.LOGO) {
    if (!state.brandName && !state.customPrompt) throw new Error("Por favor, forneça o nome da marca ou uma descrição.");
    prompt = `
      Atue como um Designer Gráfico Sênior. TAREFA: Criar um LOGOTIPO profissional.
      MARCA: "${state.brandName}"
      ESTILO: ${state.logoStyle}
      DESCRIÇÃO: "${state.customPrompt}"
      DIRETRIZES: Fundo branco sólido (#FFFFFF). Vetorizável. Alta legibilidade.
    `;
    parts.push({ text: prompt });
    if (state.referenceImage) {
        parts.push({ inlineData: { mimeType: state.referenceImage.file.type, data: state.referenceImage.base64 } });
    }
  }
  else if (state.mode === AppMode.SOCIAL_PROFILE) {
    if (!state.referenceImage) throw new Error("Reference image is missing for Social Profile.");
    
    let bgContext = "";
    if (state.socialPlatform.includes("LinkedIn")) bgContext = "Contexto: Profissional / Corporativo.";
    else if (state.socialPlatform.includes("Instagram")) bgContext = "Contexto: Lifestyle / Estético.";
    else bgContext = "Contexto: Clean / Moderno.";

    prompt = `
      Crie uma FOTO DE PERFIL PROFISSIONAL (Headshot).
      PLATAFORMA: ${state.socialPlatform}.
      ${bgContext}
      
      ${userOverrideInstruction}
      
      ${locationInstruction}
      ${lightingInstruction}
      
      ${structuralLockRule}
      ${nanoBananaProInstruction}
      ${seamlessIntegrationRule}
    `;
    parts.push({ text: prompt });
    parts.push({ inlineData: { mimeType: state.referenceImage.file.type, data: state.referenceImage.base64 } });
  }

  const maxRetries = 3;
  let lastError: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL_IMAGE,
        contents: { parts: parts },
        config: { imageConfig: { aspectRatio: (state.mode === AppMode.LOGO || state.mode === AppMode.SOCIAL_PROFILE) ? "1:1" : "3:4" } }
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
      lastError = error;
      const isQuotaError = error.message?.includes("429") || error.message?.includes("Quota exceeded") || error.message?.includes("RESOURCE_EXHAUSTED");
      if (isQuotaError && attempt < maxRetries) {
        const delayTime = 2000 * Math.pow(2, attempt - 1);
        await wait(delayTime);
        continue;
      } else {
        break;
      }
    }
  }
  let errorMessage = lastError?.message || "Failed to generate image.";
  if (errorMessage.includes("{")) {
      try {
          const parsed = JSON.parse(errorMessage.substring(errorMessage.indexOf("{")));
          if (parsed.error && parsed.error.message) errorMessage = parsed.error.message;
      } catch (e) {}
  }
  throw new Error(errorMessage);
};
