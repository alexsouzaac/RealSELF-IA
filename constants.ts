
import { LocationType, LightingType, OutfitType, MoodType, FramingType, DuoAction, ProductAction, LogoStyle, SocialPlatform, SocialStyle, ProfileType, ContentTemplate } from './types';
import { MapPin, Sun, Moon, Cloud, Zap, Briefcase, Coffee, Palmtree, Smartphone, Camera, User, Eye, ArrowRight, LayoutTemplate, Users, ShoppingBag, Heart, MessageCircle, Hand, Sparkles, Home, Dumbbell,  Trees, GlassWater, PenTool, Type, Hexagon, Shield, Smile, Box, Grid, Feather, Crown, Layers, Linkedin, Instagram, Youtube, Twitter, Facebook, Video, Store, GraduationCap, Tv, Clapperboard, AlertTriangle, List, TrendingUp, Flag, Lightbulb, Film, Wand2, HelpCircle, Stethoscope, Scale, Brain, Flower2, Activity, Shuffle, UserPlus, HeartHandshake, Quote, Ban } from 'lucide-react';

export const LOCATIONS = [
  { value: LocationType.NONE, label: 'Original', icon: Ban },
  { value: LocationType.COFFEE_SHOP, label: 'Cafeteria', icon: Coffee },
  { value: LocationType.URBAN_PARK, label: 'Parque', icon: Trees },
  { value: LocationType.CITY_STREET, label: 'Rua Urbana', icon: MapPin },
  { value: LocationType.LIVING_ROOM, label: 'Sala de Estar', icon: Home },
  { value: LocationType.MODERN_GYM, label: 'Academia', icon: Dumbbell },
  { value: LocationType.GALA_EVENT, label: 'Evento Gala', icon: Sparkles },
];

export const LIGHTINGS = [
  { value: LightingType.NONE, label: 'Original', icon: Ban },
  { value: LightingType.GOLDEN_HOUR, label: 'Golden Hour', icon: Sun },
  { value: LightingType.NATURAL_DAY, label: 'Luz Natural', icon: Cloud },
  { value: LightingType.INDOOR_WARM, label: 'Interior', icon: Home },
  { value: LightingType.STUDIO, label: 'Estúdio', icon: Camera },
  { value: LightingType.NEON_NIGHT, label: 'Noturno', icon: Moon },
];

export const OUTFITS = [
  { value: OutfitType.NONE, label: 'Original', icon: Ban },
  { value: OutfitType.BASIC_TSHIRT, label: 'Básico (Jeans)', icon: User },
  { value: OutfitType.COMFY_HOODIE, label: 'Moletom', icon: User },
  { value: OutfitType.SUMMER_CASUAL, label: 'Verão', icon: Sun },
  { value: OutfitType.GYM_WEAR, label: 'Sport / Treino', icon: Dumbbell },
  { value: OutfitType.FORMAL_SUIT, label: 'Formal / Gala', icon: Briefcase },
];

export const MOODS = [
  { value: MoodType.NONE, label: 'Original', icon: Ban },
  { value: MoodType.RELAXED, label: 'Relaxado', icon: Coffee },
  { value: MoodType.CONTEMPLATIVE, label: 'Contemplativo', icon: Eye },
  { value: MoodType.CONFIDENT, label: 'Natural', icon: User },
  { value: MoodType.FOCUSED, label: 'Focado', icon: ArrowRight },
];

export const FRAMINGS = [
  { value: FramingType.NONE, label: 'Original', icon: Ban },
  { value: FramingType.FULL_BODY, label: 'Corpo Inteiro', icon: User },
  { value: FramingType.KNEES_UP, label: 'Plano Americano', icon: LayoutTemplate },
  { value: FramingType.WAIST_UP, label: 'Plano Médio', icon: Camera },
  { value: FramingType.CLOSE_UP, label: 'Close-up', icon: Eye },
];

export const DUO_ACTIONS = [
  { value: DuoAction.NONE, label: 'Original', icon: Ban },
  { value: DuoAction.SELFIE, label: 'Selfie', icon: Smartphone },
  { value: DuoAction.COFFEE_TALK, label: 'Conversando', icon: MessageCircle },
  { value: DuoAction.WALKING, label: 'Caminhando', icon: ArrowRight },
  { value: DuoAction.LAUGHING, label: 'Rindo', icon: Heart },
  { value: DuoAction.EVENT_POSE, label: 'Posando (Festa)', icon: Camera },
];

export const PRODUCT_ACTIONS = [
  { value: ProductAction.NONE, label: 'Original', icon: Ban },
  { value: ProductAction.CASUAL_HOLD, label: 'Segurando', icon: Hand },
  { value: ProductAction.USING_NATURAL, label: 'Usando', icon: User },
  { value: ProductAction.TABLE_FLATLAY, label: 'Na Mesa', icon: Coffee },
  { value: ProductAction.SHOWING_FRIEND, label: 'Mostrando', icon: MessageCircle },
];

// Novos Estilos de Logo
export const LOGO_STYLES = [
  { value: LogoStyle.MINIMALIST, label: 'Minimalista', icon: Box },
  { value: LogoStyle.WORDMARK, label: 'Tipográfico', icon: Type },
  { value: LogoStyle.MONOGRAM, label: 'Monograma', icon: Grid },
  { value: LogoStyle.ABSTRACT, label: 'Abstrato', icon: Hexagon },
  { value: LogoStyle.MASCOT, label: 'Mascote', icon: Smile },
  { value: LogoStyle.EMBLEM, label: 'Emblema', icon: Shield },
  { value: LogoStyle.NEGATIVE_SPACE, label: 'Espaço Negativo', icon: Layers },
  { value: LogoStyle.TECH_FUTURISTIC, label: 'Tech / Futuro', icon: Zap },
  { value: LogoStyle.LUXURY, label: 'Luxo', icon: Crown },
  { value: LogoStyle.HAND_DRAWN, label: 'Manual', icon: Feather },
];

// Listas para Social Profile
export const SOCIAL_PLATFORMS = [
  { value: SocialPlatform.LINKEDIN, label: 'LinkedIn', icon: Linkedin },
  { value: SocialPlatform.INSTAGRAM, label: 'Instagram', icon: Instagram },
  { value: SocialPlatform.TIKTOK, label: 'TikTok', icon: Video },
  { value: SocialPlatform.YOUTUBE, label: 'YouTube', icon: Youtube },
  { value: SocialPlatform.TWITTER, label: 'X / Twitter', icon: Twitter },
  { value: SocialPlatform.WHATSAPP, label: 'WhatsApp', icon: MessageCircle },
];

export const SOCIAL_STYLES = [
  { value: SocialStyle.CORPORATE, label: 'Corporativo', icon: Briefcase },
  { value: SocialStyle.CREATOR, label: 'Creator', icon: Sparkles },
  { value: SocialStyle.MINIMALIST_BW, label: 'P&B Minimalista', icon: Moon },
  { value: SocialStyle.TECH_STARTUP, label: 'Tech Startup', icon: Zap },
  { value: SocialStyle.OUTDOOR_VIBE, label: 'Outdoor', icon: Sun },
  { value: SocialStyle.LUXURY_LIFESTYLE, label: 'Luxo', icon: Crown },
];

export const PROFILE_TYPES = [
  { value: ProfileType.PERSONAL, label: 'Pessoal', icon: User },
  { value: ProfileType.CREATOR, label: 'Creator', icon: Camera },
  { value: ProfileType.BUSINESS, label: 'Empresa', icon: Store },
  { value: ProfileType.PROFESSIONAL, label: 'Profissional', icon: GraduationCap },
  { value: ProfileType.ENTERTAINMENT, label: 'Humor/Entret.', icon: Tv },
];

// Templates de Conteúdo Viral
export const CONTENT_TEMPLATES = [
  // Nichos Específicos
  { value: ContentTemplate.MEDICAL_GENERAL, label: 'Médico Geral', icon: Stethoscope, desc: 'Mitos, Alertas e Dicas' },
  { value: ContentTemplate.MEDICAL_PSYCHIATRIST, label: 'Psiquiatra', icon: Brain, desc: 'Transtornos e Mente' },
  { value: ContentTemplate.PSYCHOLOGY_TIPS, label: 'Psicólogo', icon: MessageCircle, desc: 'Comportamento e Emoção' },
  { value: ContentTemplate.NURSING_CARE, label: 'Enfermeiro(a)', icon: Heart, desc: 'Curiosidade e Cuidado' },
  { value: ContentTemplate.GERIATRIC_CARE, label: 'Geriatria', icon: UserPlus, desc: 'Idosos e Longevidade' },
  { value: ContentTemplate.LEGAL_ADVOCATE, label: 'Advogado', icon: Scale, desc: 'Direitos e Leis' },
  { value: ContentTemplate.AESTHETIC_CLINIC, label: 'Estética', icon: Flower2, desc: 'Desejo e Transformação' },
  { value: ContentTemplate.PHYSIO_TIPS, label: 'Fisioterapeuta', icon: Activity, desc: 'Dor e Movimento' },
  { value: ContentTemplate.MASSAGE_THERAPY, label: 'Massoterapia', icon: HeartHandshake, desc: 'Relaxamento e ASMR' },
  { value: ContentTemplate.RANDOM_LIFESTYLE, label: 'Aleatório', icon: Shuffle, desc: 'Stories e Humor' },

  // Gerais
  { value: ContentTemplate.PREMIUM_QUOTES, label: 'Frases Premium', icon: Quote, desc: 'Reflexão & Estética (Insta)' }, // NOVO
  { value: ContentTemplate.IDENTIFICATION, label: 'Identificação', icon: User, desc: '"Sou eu todinho!"' },
  { value: ContentTemplate.MINI_VLOG, label: 'Mini Vlog', icon: Film, desc: 'Um dia na Vida' },
  { value: ContentTemplate.DID_YOU_KNOW, label: 'Curiosidade', icon: HelpCircle, desc: '"Morria e não sabia"' },
  { value: ContentTemplate.CREATIVE_EFFECTS, label: 'Efeitos', icon: Wand2, desc: 'Transições Visuais' },
  { value: ContentTemplate.SATISFYING, label: 'Satisfatório', icon: Layers, desc: 'Hipnotizante / ASMR' },
  { value: ContentTemplate.POV_OBJECTION, label: 'P.O.V', icon: Eye, desc: 'Quebra de Objeção' },
  { value: ContentTemplate.TUTORIAL_HACK, label: 'Tutorial', icon: Lightbulb, desc: 'Ensina rápido' },
  { value: ContentTemplate.WARNING_ERROR, label: 'Alerta', icon: AlertTriangle, desc: 'Erro Comum (Pare!)' },
  { value: ContentTemplate.JOURNEY_CHALLENGE, label: 'Jornada', icon: Flag, desc: 'Desafio Dia 01' },
  { value: ContentTemplate.LIST_TOP_X, label: 'Lista', icon: List, desc: 'Top X Melhores' },
];
