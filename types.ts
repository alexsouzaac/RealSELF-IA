
export interface ReferenceImage {
  file: File;
  previewUrl: string;
  base64: string;
}

export enum AppMode {
  SOLO = 'SOLO',
  DUO = 'DUO',
  PRODUCT = 'PRODUCT',
  TEXT_TO_IMAGE = 'TEXT_TO_IMAGE',
  LOGO = 'LOGO',
  SOCIAL_PROFILE = 'SOCIAL_PROFILE',
  CONTENT_CREATION = 'CONTENT_CREATION',
  CONSULTING = 'CONSULTING'
}

export enum LocationType {
  NONE = 'Ambiente Original (Manter)',
  COFFEE_SHOP = 'Cafeteria Aconchegante',
  URBAN_PARK = 'Parque Urbano ao Entardecer',
  CITY_STREET = 'Rua Movimentada (Lifestyle)',
  LIVING_ROOM = 'Sala de Estar Minimalista',
  MODERN_GYM = 'Academia Moderna',
  GALA_EVENT = 'Evento de Gala (Formal)',
  CUSTOM = 'Personalizado'
}

export enum LightingType {
  NONE = 'Iluminação Original (Manter)',
  GOLDEN_HOUR = 'Golden Hour (Pôr do sol)',
  NATURAL_DAY = 'Luz Natural Suave',
  INDOOR_WARM = 'Interior Aconchegante',
  STUDIO = 'Luz de Estúdio',
  NEON_NIGHT = 'Noturno Urbano'
}

export enum OutfitType {
  NONE = 'Roupa Original (Manter)',
  BASIC_TSHIRT = 'Camiseta Básica e Jeans (Casual)',
  COMFY_HOODIE = 'Moletom Confortável (Relax)',
  SUMMER_CASUAL = 'Look de Verão Leve',
  GYM_WEAR = 'Roupa de Treino / Sport',
  FORMAL_SUIT = 'Terno / Vestido de Gala (Formal)',
  CUSTOM = 'Personalizado'
}

export enum MoodType {
  NONE = 'Expressão Original (Manter)',
  RELAXED = 'Relaxado & Sorrindo',
  CONTEMPLATIVE = 'Contemplativo (Olhando longe)',
  CONFIDENT = 'Confiante & Natural',
  FOCUSED = 'Focado / Comprometido'
}

export enum FramingType {
  NONE = 'Enquadramento Original (Manter)',
  FULL_BODY = 'Corpo Inteiro',
  KNEES_UP = 'Plano Americano (Joelhos para cima)',
  WAIST_UP = 'Plano Médio (Cintura para cima)',
  CLOSE_UP = 'Close-up'
}

export enum DuoAction {
  NONE = 'Poses Originais (Manter)',
  SELFIE = 'Tirando uma Selfie',
  COFFEE_TALK = 'Conversando no Café',
  WALKING = 'Caminhando na Rua',
  LAUGHING = 'Rindo Espontaneamente',
  EVENT_POSE = 'Posando no Evento'
}

export enum ProductAction {
  NONE = 'Interação Original (Manter)',
  CASUAL_HOLD = 'Segurando casualmente',
  USING_NATURAL = 'Usando no dia a dia',
  TABLE_FLATLAY = 'Produto na mesa (Lifestyle)',
  SHOWING_FRIEND = 'Mostrando para alguém'
}

// Novos Estilos de Logo Profissionais
export enum LogoStyle {
  MINIMALIST = 'Minimalista & Moderno (Apple, Nike)',
  WORDMARK = 'Tipográfico / Wordmark (Google, Coca-Cola)',
  MONOGRAM = 'Monograma / Letras (Louis Vuitton, IBM)',
  ABSTRACT = 'Abstrato & Geométrico (Pepsi, Airbnb)',
  MASCOT = 'Mascote / Personagem (KFC, Pringles)',
  EMBLEM = 'Emblema / Vintage (Starbucks, Harley-Davidson)',
  NEGATIVE_SPACE = 'Espaço Negativo (FedEx, WWF)',
  TECH_FUTURISTIC = 'Tech & Futurista (Cyberpunk, Startups de IA)',
  LUXURY = 'Luxo & Elegante (Chanel, Rolex)',
  HAND_DRAWN = 'Feito à Mão / Assinatura (Disney, Pessoal)'
}

// Novos Enums para Social Profile
export enum SocialPlatform {
  LINKEDIN = 'LinkedIn (Profissional)',
  INSTAGRAM = 'Instagram (Lifestyle/Aesthetic)',
  TIKTOK = 'TikTok (Criativo/Bold)',
  YOUTUBE = 'YouTube (Expressivo)',
  TWITTER = 'X / Twitter (Tech/Clean)',
  WHATSAPP = 'WhatsApp (Casual/Friendly)'
}

export enum SocialStyle {
  CORPORATE = 'Corporativo / Executivo (Studio Light)',
  CREATOR = 'Content Creator (Colorido & Moderno)',
  MINIMALIST_BW = 'Minimalista P&B (Alto Contraste)',
  TECH_STARTUP = 'Tech Startup (Casual Smart)',
  OUTDOOR_VIBE = 'Outdoor / Natureza (Luz Natural)',
  LUXURY_LIFESTYLE = 'Luxo & Sofisticação'
}

export enum ProfileType {
  PERSONAL = 'Perfil Pessoal / Lifestyle',
  CREATOR = 'Criador de Conteúdo / Influencer',
  BUSINESS = 'Empresa / Negócio Local',
  PROFESSIONAL = 'Profissional Liberal (Médico, Advogado, etc)',
  ENTERTAINMENT = 'Entretenimento / Humor'
}

// Modelos de Conteúdo Viral
export enum ContentTemplate {
  // Gerais
  IDENTIFICATION = 'Identificação ("Sou eu!")',
  POV_OBJECTION = 'P.O.V / Quebra de Objeção',
  TUTORIAL_HACK = 'Tutorial / Truque (Passo a Passo)',
  WARNING_ERROR = 'Alerta / Erro Comum (Pare Agora)',
  JOURNEY_CHALLENGE = 'Jornada / Desafio (Dia 01)',
  LIST_TOP_X = 'Lista / Top X Coisas',
  MINI_VLOG = 'Um dia na Vida / Mini Vlog',
  CREATIVE_EFFECTS = 'Efeitos Criativos / Transições',
  SATISFYING = 'Hipnotizante / Satisfatório',
  DID_YOU_KNOW = '"Com quantos anos..." / Segredos',
  PREMIUM_QUOTES = 'Frases Premium (Instagram)', 
  
  // Nichos Específicos Detalhados
  MEDICAL_GENERAL = 'Médico Geral (Mitos & Verdades)',
  MEDICAL_PSYCHIATRIST = 'Psiquiatra (Saúde Mental)',
  NURSING_CARE = 'Enfermeiro(a) (Curiosidades)',
  LEGAL_ADVOCATE = 'Advogado (Seus Direitos)',
  PHYSIO_TIPS = 'Fisioterapeuta (Alívio de Dor)',
  AESTHETIC_CLINIC = 'Clínica Estética (Desejo)',
  MASSAGE_THERAPY = 'Massoterapeuta (Relax/ASMR)',
  GERIATRIC_CARE = 'Geriatria (Cuidado Idoso)',
  PSYCHOLOGY_TIPS = 'Psicólogo (Comportamento)',
  RANDOM_LIFESTYLE = 'Aleatório / Storytime'
}

// Interface para o retorno da Consultoria Viral (Perfil)
export interface ViralStrategyResult {
  usernames: string[];
  bio: string;
  headline: string;
  colorPalette: { color: string; name: string }[];
  typography: string;
  contentStrategy: {
    feed: string;
    stories: string;
    reels: string;
  };
}

// Nova interface para Cenas de Vídeo AI (Veo/Sora)
export interface VideoScene {
  sceneNumber: number;
  characterDescription: string; 
  environment: string;
  action: string;
  finalPrompt: string; // O Prompt pronto para copiar
  dialogue: string;
}

// Nova interface para Slides de Carrossel
export interface CarouselSlide {
  slideNumber: number;
  title: string;
  content: string;
  visualPrompt: string;
}

// Interface para o retorno do Gerador de Conteúdo
export interface ContentPiece {
  format: string; // "Vídeo Reels", "Carrossel", "Post Único"
  hook: string; // Legenda ou Gancho
  script: string; // Roteiro geral ou Legenda completa
  cta: string; 
  visualSuggestion: string; // Descrição visual geral
  musicSuggestion: string; 
  aestheticTip?: string; 
  whyItWorks: string; 
  videoScenes?: VideoScene[]; // Preenchido apenas se for Vídeo
  slides?: CarouselSlide[]; // Preenchido apenas se for Carrossel
}

export interface ContentCreationResult {
  topic: string;
  pieces: ContentPiece[];
  growthTips: string[];
}

// Interface para os Planos de Preço
export interface PricingPlan {
  name: string; // "Start", "Pro", "Advanced"
  price: string;
  description: string;
  features: string[];
}

// Interface para Consultoria Profissional
export interface ConsultingResult {
  clientName: string;
  marketAnalysis: string; 
  brandArchetype: string; 
  visualIdentitySuggestion: string; 
  contentPillars: string[]; 
  growthStrategy: string; 
  calendarExample: string; 
  agencyWorkflow: string; 
  pricingPlans: PricingPlan[]; // Novo campo estruturado
  projectValue?: string; // Legacy field for backward compatibility
}

// Interface para Manual de Marca (Logo Identity)
export interface LogoIdentityResult {
  brandName: string;
  tagline: string;
  story: string;
  brandArchetype: {
    name: string;
    description: string;
  };
  colorPalette: Array<{
    hex: string;
    name: string;
    usage: string;
  }>;
  typography: {
    primaryFont: string;
    secondaryFont: string;
    usageTip: string;
  };
  visualElements: string[];
  applicationTips: string[];
}

// History Item Interface
export interface HistoryItem {
  id: string;
  timestamp: number;
  mode: AppMode;
  previewTitle: string; 
  thumbnail?: string; 
  
  // Stored Data
  viralStrategy?: ViralStrategyResult;
  contentStrategy?: ContentCreationResult;
  consultingResult?: ConsultingResult; 
  logoIdentity?: LogoIdentityResult; // Novo campo
  generatedImageUrl?: string;
  
  // Metadata for context
  platform?: string;
}

export interface AppState {
  mode: AppMode;
  referenceImage: ReferenceImage | null;
  secondImage: ReferenceImage | null; 
  location: LocationType;
  customLocation: string;
  lighting: LightingType;
  outfit: OutfitType;
  customOutfit: string;
  mood: MoodType;
  duoAction: DuoAction;
  productAction: ProductAction;
  framing: FramingType;
  customPrompt: string; 
  
  // Logo specific fields
  brandName: string;
  logoStyle: LogoStyle;

  // Social Profile specific fields
  socialPlatform: SocialPlatform;
  socialStyle: SocialStyle;
  
  // Viral Profile Optimization fields
  profileType: ProfileType;
  profileNiche: string;
  profileGoal: string;
  
  // Content Creation specific fields
  contentTemplate: ContentTemplate;

  // Consulting specific fields
  consultingCompany: string;
  consultingProduct: string;
  consultingGoal: string;
  consultingAudience: string;
}

export interface GeneratedResult {
  imageUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  apiKey?: string;
}
