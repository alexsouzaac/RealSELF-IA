export interface ReferenceImage {
  file: File;
  previewUrl: string;
  base64: string;
}

export enum AppMode {
  SOLO = 'SOLO',
  DUO = 'DUO',
  PRODUCT = 'PRODUCT'
}

export enum LocationType {
  COFFEE_SHOP = 'Cafeteria Aconchegante',
  URBAN_PARK = 'Parque Urbano ao Entardecer',
  CITY_STREET = 'Rua Movimentada (Lifestyle)',
  LIVING_ROOM = 'Sala de Estar Minimalista',
  MODERN_GYM = 'Academia Moderna',
  GALA_EVENT = 'Evento de Gala (Formal)',
  CUSTOM = 'Personalizado'
}

export enum LightingType {
  GOLDEN_HOUR = 'Golden Hour (Pôr do sol)',
  NATURAL_DAY = 'Luz Natural Suave',
  INDOOR_WARM = 'Interior Aconchegante',
  STUDIO = 'Luz de Estúdio',
  NEON_NIGHT = 'Noturno Urbano'
}

export enum OutfitType {
  BASIC_TSHIRT = 'Camiseta Básica e Jeans (Casual)',
  COMFY_HOODIE = 'Moletom Confortável (Relax)',
  SUMMER_CASUAL = 'Look de Verão Leve',
  GYM_WEAR = 'Roupa de Treino / Sport',
  FORMAL_SUIT = 'Terno / Vestido de Gala (Formal)',
  CUSTOM = 'Personalizado'
}

export enum MoodType {
  RELAXED = 'Relaxado & Sorrindo',
  CONTEMPLATIVE = 'Contemplativo (Olhando longe)',
  CONFIDENT = 'Confiante & Natural',
  FOCUSED = 'Focado / Comprometido'
}

export enum FramingType {
  FULL_BODY = 'Corpo Inteiro',
  KNEES_UP = 'Plano Americano (Joelhos para cima)',
  WAIST_UP = 'Plano Médio (Cintura para cima)',
  CLOSE_UP = 'Close-up'
}

export enum DuoAction {
  SELFIE = 'Tirando uma Selfie',
  COFFEE_TALK = 'Conversando no Café',
  WALKING = 'Caminhando na Rua',
  LAUGHING = 'Rindo Espontaneamente',
  EVENT_POSE = 'Posando no Evento'
}

export enum ProductAction {
  CASUAL_HOLD = 'Segurando casualmente',
  USING_NATURAL = 'Usando no dia a dia',
  TABLE_FLATLAY = 'Produto na mesa (Lifestyle)',
  SHOWING_FRIEND = 'Mostrando para alguém'
}

export interface AppState {
  mode: AppMode;
  referenceImage: ReferenceImage | null;
  secondImage: ReferenceImage | null; // For Person 2 or Product
  location: LocationType;
  customLocation: string;
  lighting: LightingType;
  outfit: OutfitType;
  customOutfit: string;
  mood: MoodType;
  duoAction: DuoAction;
  productAction: ProductAction;
  framing: FramingType;
}

export interface GeneratedResult {
  imageUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Stored in localStorage for demo purposes
  apiKey?: string;
}
