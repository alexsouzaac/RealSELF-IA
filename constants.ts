import { LocationType, LightingType, OutfitType, MoodType, FramingType, DuoAction, ProductAction } from './types';
import { MapPin, Sun, Moon, Cloud, Zap, Briefcase, Coffee, Palmtree, Smartphone, Camera, User, Eye, ArrowRight, LayoutTemplate, Users, ShoppingBag, Heart, MessageCircle, Hand, Sparkles, Home, Dumbbell,  Trees, GlassWater } from 'lucide-react';

export const LOCATIONS = [
  { value: LocationType.COFFEE_SHOP, label: 'Cafeteria', icon: Coffee },
  { value: LocationType.URBAN_PARK, label: 'Parque', icon: Trees },
  { value: LocationType.CITY_STREET, label: 'Rua Urbana', icon: MapPin },
  { value: LocationType.LIVING_ROOM, label: 'Sala de Estar', icon: Home },
  { value: LocationType.MODERN_GYM, label: 'Academia', icon: Dumbbell },
  { value: LocationType.GALA_EVENT, label: 'Evento Gala', icon: Sparkles },
];

export const LIGHTINGS = [
  { value: LightingType.GOLDEN_HOUR, label: 'Golden Hour', icon: Sun },
  { value: LightingType.NATURAL_DAY, label: 'Luz Natural', icon: Cloud },
  { value: LightingType.INDOOR_WARM, label: 'Interior', icon: Home },
  { value: LightingType.STUDIO, label: 'Estúdio', icon: Camera },
  { value: LightingType.NEON_NIGHT, label: 'Noturno', icon: Moon },
];

export const OUTFITS = [
  { value: OutfitType.BASIC_TSHIRT, label: 'Básico (Jeans)', icon: User },
  { value: OutfitType.COMFY_HOODIE, label: 'Moletom', icon: User },
  { value: OutfitType.SUMMER_CASUAL, label: 'Verão', icon: Sun },
  { value: OutfitType.GYM_WEAR, label: 'Sport / Treino', icon: Dumbbell },
  { value: OutfitType.FORMAL_SUIT, label: 'Formal / Gala', icon: Briefcase },
];

export const MOODS = [
  { value: MoodType.RELAXED, label: 'Relaxado', icon: Coffee },
  { value: MoodType.CONTEMPLATIVE, label: 'Contemplativo', icon: Eye },
  { value: MoodType.CONFIDENT, label: 'Natural', icon: User },
  { value: MoodType.FOCUSED, label: 'Focado', icon: ArrowRight },
];

export const FRAMINGS = [
  { value: FramingType.FULL_BODY, label: 'Corpo Inteiro', icon: User },
  { value: FramingType.KNEES_UP, label: 'Plano Americano', icon: LayoutTemplate },
  { value: FramingType.WAIST_UP, label: 'Plano Médio', icon: Camera },
  { value: FramingType.CLOSE_UP, label: 'Close-up', icon: Eye },
];

export const DUO_ACTIONS = [
  { value: DuoAction.SELFIE, label: 'Selfie', icon: Smartphone },
  { value: DuoAction.COFFEE_TALK, label: 'Conversando', icon: MessageCircle },
  { value: DuoAction.WALKING, label: 'Caminhando', icon: ArrowRight },
  { value: DuoAction.LAUGHING, label: 'Rindo', icon: Heart },
  { value: DuoAction.EVENT_POSE, label: 'Posando (Festa)', icon: Camera },
];

export const PRODUCT_ACTIONS = [
  { value: ProductAction.CASUAL_HOLD, label: 'Segurando', icon: Hand },
  { value: ProductAction.USING_NATURAL, label: 'Usando', icon: User },
  { value: ProductAction.TABLE_FLATLAY, label: 'Na Mesa', icon: Coffee },
  { value: ProductAction.SHOWING_FRIEND, label: 'Mostrando', icon: MessageCircle },
];
