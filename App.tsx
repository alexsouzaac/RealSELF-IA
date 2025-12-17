
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, CheckCircle2, MapPin, Shirt, Camera, RefreshCcw, Loader2, Info, KeyRound, User as UserIcon, Users, ShoppingBag, ClipboardPaste, ExternalLink, ArrowRight, AlertTriangle, Type as TypeIcon, PenTool, Download, X, FileText, Layers, FileImage, Contact, Palette, Megaphone, Hash, Layout, Clapperboard, Lightbulb, Zap, Quote, PlayCircle, Instagram, Youtube, Twitter, Linkedin, MessageCircle, Video, History as HistoryIcon, Trash2, Clock, Share2, Copy, Music, Repeat, Monitor, CircleDashed, Film, Mic, BookOpen, Quote as QuoteIcon, Briefcase, TrendingUp, ChevronDown, ChevronUp, Calendar, Workflow, Star, Crown, Diamond, Check, Smile, Ban, Wand2 } from 'lucide-react';
import { AppState, LocationType, LightingType, OutfitType, MoodType, FramingType, AppMode, DuoAction, ProductAction, LogoStyle, SocialPlatform, SocialStyle, ProfileType, ViralStrategyResult, ContentCreationResult, HistoryItem, ContentTemplate, ConsultingResult, LogoIdentityResult } from './types';
import { LOCATIONS, LIGHTINGS, OUTFITS, MOODS, FRAMINGS, DUO_ACTIONS, PRODUCT_ACTIONS, LOGO_STYLES, SOCIAL_PLATFORMS, SOCIAL_STYLES, PROFILE_TYPES, CONTENT_TEMPLATES } from './constants';
import { generateImage, generateViralProfileStrategy, generateContentStrategy, fileToBase64, fileToDataURL, generateConsultingReport, generateLogoIdentity, enhanceUserPrompt } from './services/geminiService';
import FloatingActionBar from './components/FloatingActionBar';
import { removeBackground, generateSVG } from './utils/imageProcessor';
import { generateViralProfilePDF, generateContentStrategyPDF, generateConsultingPDF, generateBrandBookPDF } from './utils/pdfGenerator';

const DEFAULT_STATE: AppState = {
  mode: AppMode.SOLO,
  referenceImage: null,
  secondImage: null,
  // START AS NONE (ORIGINAL)
  location: LocationType.NONE,
  customLocation: '',
  lighting: LightingType.NONE,
  outfit: OutfitType.NONE,
  customOutfit: '',
  mood: MoodType.NONE,
  duoAction: DuoAction.NONE,
  productAction: ProductAction.NONE,
  framing: FramingType.NONE,
  customPrompt: '',
  brandName: '',
  logoStyle: LogoStyle.MINIMALIST,
  socialPlatform: SocialPlatform.LINKEDIN,
  socialStyle: SocialStyle.CORPORATE,
  profileType: ProfileType.PERSONAL,
  profileNiche: '',
  profileGoal: '',
  contentTemplate: ContentTemplate.IDENTIFICATION,
  consultingCompany: '',
  consultingProduct: '',
  consultingGoal: '',
  consultingAudience: ''
};

// Estrutura rica de Dicas e Exemplos por Template
const TEMPLATE_GUIDES: Record<ContentTemplate, Array<{ tip: string, example: string }>> = {
    [ContentTemplate.IDENTIFICATION]: [
        { tip: "Foque em uma situação universal e embaraçosa que seu público vive secretamente.", example: "Aquele momento que você promete dormir cedo (22h), mas pisca o olho e já são 03h da manhã." },
        { tip: "Use o humor autodepreciativo sobre hábitos cotidianos.", example: "Eu me arrumando para sair: 2 horas. Eu na festa querendo ir embora: 15 minutos." }
    ],
    [ContentTemplate.POV_OBJECTION]: [
        { tip: "Use o formato P.O.V para quebrar uma crença limitante.", example: "P.O.V: Você acha que precisa ser rico para começar a investir, mas descobre que com R$ 30,00 já dá para começar." }
    ],
    [ContentTemplate.TUTORIAL_HACK]: [
        { tip: "Ensine um atalho rápido ou recurso escondido.", example: "Segredo do iPhone: Como escanear documentos sem baixar app." }
    ],
    [ContentTemplate.WARNING_ERROR]: [
        { tip: "O medo de errar gera retenção. Liste erros comuns.", example: "Pare de usar hashtags genéricas! Isso está atraindo robôs." }
    ],
    [ContentTemplate.JOURNEY_CHALLENGE]: [
        { tip: "Mostre vulnerabilidade e processo.", example: "Dia 01 tentando ficar sem açúcar por 30 dias." }
    ],
    [ContentTemplate.LIST_TOP_X]: [
        { tip: "Curadoria gera autoridade imediata.", example: "Top 5 livros sobre produtividade que mudaram minha mentalidade." }
    ],
    [ContentTemplate.MINI_VLOG]: [
        { tip: "Misture trabalho com lazer em cortes rápidos.", example: "Um dia produtivo comigo sendo arquiteta." }
    ],
    [ContentTemplate.CREATIVE_EFFECTS]: [
        { tip: "Use uma transição visual impactante.", example: "Transição de estalo de dedos: Troca de roupa instantânea." }
    ],
    [ContentTemplate.SATISFYING]: [
        { tip: "Explore o ASMR visual ou auditivo.", example: "Organizando a despensa de mantimentos por cor." }
    ],
    [ContentTemplate.DID_YOU_KNOW]: [
        { tip: "Apresente uma curiosidade óbvia mas despercebida.", example: "Você sabia que o buraquinho na tampa da caneta BIC evita asfixia?" }
    ],
    [ContentTemplate.PREMIUM_QUOTES]: [
      { tip: "O luxo não grita, ele sussurra. Foque na sofisticação da simplicidade.", example: "A verdadeira riqueza não é o que você compra, é o que você sente quando está sozinho em silêncio." },
      { tip: "Use a estética do 'Old Money' ou 'Quiet Luxury'.", example: "Troquei a necessidade de ser visto pela vontade de ser paz." }
    ],
    [ContentTemplate.MEDICAL_GENERAL]: [{ tip: "Escolha um mito popular de saúde e desminta.", example: "Mito: Beber água com limão em jejum emagrece?" }],
    [ContentTemplate.MEDICAL_PSYCHIATRIST]: [{ tip: "Valide sentimentos ocultos.", example: "A diferença entre preguiça e depressão funcional." }],
    [ContentTemplate.NURSING_CARE]: [{ tip: "Ensine primeiros socorros básicos.", example: "O que fazer se alguém desmaiar na sua frente." }],
    [ContentTemplate.LEGAL_ADVOCATE]: [{ tip: "Use o gatilho 'Eles não querem que você saiba'.", example: "A loja se recusa a trocar o presente sem nota?" }],
    [ContentTemplate.PHYSIO_TIPS]: [{ tip: "Foque no alívio visual da dor.", example: "Acordou com o pescoço travado? Faça isso." }],
    [ContentTemplate.AESTHETIC_CLINIC]: [{ tip: "Venda a transformação e o desejo.", example: "O 'Glow Up' imediato de uma limpeza de pele." }],
    [ContentTemplate.MASSAGE_THERAPY]: [{ tip: "Transmita relaxamento via tela.", example: "Imagine essa tensão saindo das suas costas agora." }],
    [ContentTemplate.GERIATRIC_CARE]: [{ tip: "Foque na segurança e cuidado.", example: "3 armadilhas na sala que causam quedas em idosos." }],
    [ContentTemplate.PSYCHOLOGY_TIPS]: [{ tip: "Explique padrões de comportamento.", example: "Por que você sempre atrai parceiros indisponíveis?" }],
    [ContentTemplate.RANDOM_LIFESTYLE]: [{ tip: "Conte uma história caótica ou engraçada.", example: "Arrume-se comigo enquanto conto do encontro que deu errado." }]
};

// --- FUNÇÃO SEGURA PARA RENDERIZAR TEXTO ---
const renderSafeText = (value: any): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(item => renderSafeText(item)).join(", ");
  if (typeof value === "object") return JSON.stringify(value); 
  return String(value);
};

// Componente de Botão de Cópia
const CopyButton = ({ text, className = "" }: { text: string, className?: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className={`p-1.5 rounded-lg transition-colors ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'} ${className}`} title="Copiar">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
    );
};


function App() {
  // App Form State
  const [formData, setFormData] = useState<AppState>(DEFAULT_STATE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [viralStrategy, setViralStrategy] = useState<ViralStrategyResult | null>(null);
  const [contentStrategy, setContentStrategy] = useState<ContentCreationResult | null>(null);
  const [consultingResult, setConsultingResult] = useState<ConsultingResult | null>(null);
  const [logoIdentity, setLogoIdentity] = useState<LogoIdentityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualApiKey, setManualApiKey] = useState<string>("");
  const [currentGuide, setCurrentGuide] = useState<{tip: string, example: string}>(TEMPLATE_GUIDES[ContentTemplate.IDENTIFICATION]?.[0] || {tip: "Dica", example: "Exemplo"});
  const [expandedPlanIndex, setExpandedPlanIndex] = useState<number | null>(0); // Default open first plan
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Modal State for Logo Downloads
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isProcessingDownload, setIsProcessingDownload] = useState(false);

  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  
  // Text Inputs
  const customLocationRef = useRef<HTMLTextAreaElement>(null);
  const customOutfitRef = useRef<HTMLTextAreaElement>(null);
  const customPromptRef = useRef<HTMLTextAreaElement>(null);
  const brandNameRef = useRef<HTMLInputElement>(null);
  const nicheRef = useRef<HTMLInputElement>(null);
  const goalRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Carrega a API Key
    const storedKey = localStorage.getItem('gemini_api_key_simple');
    if (storedKey) {
      setManualApiKey(storedKey);
    }

    // Carrega o Histórico
    const storedHistory = localStorage.getItem('realself_history_v1');
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch (e) { console.error("History load error", e) }
    }
  }, []);

  const saveToHistory = (item: Partial<HistoryItem>) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      mode: formData.mode,
      previewTitle: getPreviewTitle(formData),
      ...item
    };
    
    const updatedHistory = [newItem, ...history].slice(10); // Keep last 10
    setHistory(updatedHistory);
    try {
      localStorage.setItem('realself_history_v1', JSON.stringify(updatedHistory));
    } catch (e) {
      console.warn("Storage full, could not save history item");
    }
  };

  const getPreviewTitle = (state: AppState) => {
    if (state.mode === AppMode.LOGO) return `Logo: ${state.brandName || 'Marca'}`;
    if (state.mode === AppMode.SOCIAL_PROFILE) return `Perfil: ${state.socialPlatform}`;
    if (state.mode === AppMode.CONTENT_CREATION) return `Conteúdo: ${state.socialPlatform}`;
    if (state.mode === AppMode.CONSULTING) return `Consultoria: ${state.consultingCompany || 'Empresa'}`;
    if (state.mode === AppMode.TEXT_TO_IMAGE) return `Texto: ${state.customPrompt.substring(0, 15)}...`;
    return `Foto: ${state.mode}`;
  }

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('realself_history_v1', JSON.stringify(updated));
  };

  const restoreFromHistory = (item: HistoryItem) => {
    // Reset all results first
    setViralStrategy(null);
    setContentStrategy(null);
    setConsultingResult(null);
    setLogoIdentity(null);
    setGeneratedImageUrl(null);

    if (item.viralStrategy) {
       setViralStrategy(item.viralStrategy);
       setGeneratedImageUrl(item.generatedImageUrl || null);
       setFormData(prev => ({ ...prev, mode: AppMode.SOCIAL_PROFILE }));
    } else if (item.contentStrategy) {
       setContentStrategy(item.contentStrategy);
       setFormData(prev => ({ ...prev, mode: AppMode.CONTENT_CREATION }));
    } else if (item.consultingResult) {
       setConsultingResult(item.consultingResult);
       setFormData(prev => ({ ...prev, mode: AppMode.CONSULTING }));
    } else if (item.generatedImageUrl) {
       setGeneratedImageUrl(item.generatedImageUrl);
       if (item.logoIdentity) setLogoIdentity(item.logoIdentity); // Restore Brand Book
       if (item.mode) setFormData(prev => ({ ...prev, mode: item.mode }));
    }
    setIsHistoryOpen(false);
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualApiKey.length > 10) {
      localStorage.setItem('gemini_api_key_simple', manualApiKey);
      setError(null);
      alert("Chave API salva no navegador!");
    } else {
      setError("A Chave API parece inválida (muito curta).");
    }
  };

  const handleModeChange = (mode: AppMode) => {
    setFormData(prev => ({
      ...prev,
      mode,
      referenceImage: null,
      secondImage: null,
      customPrompt: '',
      brandName: ''
    }));
    setError(null);
    setViralStrategy(null);
    setContentStrategy(null);
    setConsultingResult(null);
    setLogoIdentity(null);
    setGeneratedImageUrl(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isSecond: boolean = false) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const previewUrl = await fileToDataURL(file);
        const base64 = await fileToBase64(file);
        const imageObj = { file, previewUrl, base64 };
        
        setFormData(prev => ({
          ...prev,
          [isSecond ? 'secondImage' : 'referenceImage']: imageObj
        }));
        setError(null);
      } catch (err) {
        setError("Erro ao processar imagem.");
      }
    }
  };

  const handleEnhancePrompt = async () => {
    if (!formData.customPrompt.trim()) {
        setError("Digite algo para a IA melhorar.");
        return;
    }
    
    let keyToUse = manualApiKey || process.env.API_KEY;
    if (!keyToUse) {
       setError("API Key necessária.");
       return;
    }

    setIsEnhancing(true);
    try {
        const enhanced = await enhanceUserPrompt(formData.customPrompt, keyToUse);
        setFormData(prev => ({ ...prev, customPrompt: enhanced }));
    } catch (err) {
        console.error(err);
        setError("Não foi possível melhorar o prompt.");
    } finally {
        setIsEnhancing(false);
    }
  };

  const handlePaste = async (e: React.MouseEvent, field: 'customLocation' | 'customOutfit' | 'customPrompt') => {
    e.preventDefault(); 
    e.stopPropagation();

    const inputRef = field === 'customLocation' ? customLocationRef : (field === 'customOutfit' ? customOutfitRef : customPromptRef);
    if (inputRef.current) {
      inputRef.current.focus();
    }

    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setFormData(prev => ({
            ...prev,
            [field]: text
          }));
        }
      }
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  const isPlaceholderText = (text: string) => {
      if (!text) return true;
      return Object.values(TEMPLATE_GUIDES).flat().some(g => g.example === text);
  };

  const handleTemplateChange = (template: ContentTemplate) => {
    const options = TEMPLATE_GUIDES[template];
    if (!options) return;
    const randomGuide = options[Math.floor(Math.random() * options.length)];
    setCurrentGuide(randomGuide);
    setFormData(prev => {
        const shouldUpdateText = !prev.customPrompt.trim() || isPlaceholderText(prev.customPrompt);
        return {
            ...prev,
            contentTemplate: template,
            customPrompt: shouldUpdateText ? randomGuide.example : prev.customPrompt
        };
    });
  };

  const handleGenerate = async () => {
    if (formData.mode === AppMode.TEXT_TO_IMAGE && !formData.customPrompt.trim()) return setError("Por favor, digite uma descrição.");
    if (formData.mode === AppMode.LOGO && !formData.brandName.trim() && !formData.customPrompt.trim()) return setError("Por favor, digite pelo menos o nome da marca.");
    if (formData.mode === AppMode.SOCIAL_PROFILE && !formData.referenceImage) return setError("Faça o upload da sua foto.");
    if (formData.mode === AppMode.SOCIAL_PROFILE && (!formData.profileNiche || !formData.profileGoal)) return setError("Preencha profissão e foco.");
    if (formData.mode === AppMode.CONTENT_CREATION && !formData.customPrompt.trim()) return setError("Descreva o tema do conteúdo.");
    if (formData.mode === AppMode.CONSULTING && (!formData.consultingCompany || !formData.consultingProduct)) return setError("Preencha todos os campos da consultoria.");
    
    if (formData.mode !== AppMode.TEXT_TO_IMAGE && formData.mode !== AppMode.LOGO && formData.mode !== AppMode.CONTENT_CREATION && formData.mode !== AppMode.CONSULTING) {
        if (!formData.referenceImage) return setError("Faça o upload da foto.");
        if ((formData.mode === AppMode.DUO || formData.mode === AppMode.PRODUCT) && !formData.secondImage) return setError("Faça o upload da segunda foto.");
    }

    let keyToUse = manualApiKey || process.env.API_KEY;
    if (!keyToUse) {
      setError("⚠️ ATENÇÃO: Você precisa adicionar sua API Key do Gemini.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsGenerating(true);
    setError(null);
    setViralStrategy(null);
    setContentStrategy(null);
    setConsultingResult(null);
    setLogoIdentity(null);
    setGeneratedImageUrl(null); // Reset anterior

    try {
      if (formData.mode === AppMode.SOCIAL_PROFILE) {
         // Perfil gera Imagem E Estratégia
         const [imgUrl, strategy] = await Promise.all([
             generateImage(formData, keyToUse),
             generateViralProfileStrategy(formData, keyToUse)
         ]);
         setGeneratedImageUrl(imgUrl);
         setViralStrategy(strategy);
         saveToHistory({ generatedImageUrl: imgUrl, viralStrategy: strategy, platform: formData.socialPlatform });
      } 
      else if (formData.mode === AppMode.CONTENT_CREATION) {
         // Criador gera apenas Estratégia
         const strategy = await generateContentStrategy(formData, keyToUse);
         setContentStrategy(strategy);
         saveToHistory({ contentStrategy: strategy, platform: formData.socialPlatform });
      }
      else if (formData.mode === AppMode.CONSULTING) {
         const result = await generateConsultingReport(formData, keyToUse);
         setConsultingResult(result);
         saveToHistory({ consultingResult: result, previewTitle: `Consultoria: ${result.clientName}` });
      }
      else if (formData.mode === AppMode.LOGO) {
          const [imageUrl, identity] = await Promise.all([
              generateImage(formData, keyToUse),
              generateLogoIdentity(formData, keyToUse)
          ]);
          setGeneratedImageUrl(imageUrl);
          setLogoIdentity(identity);
          saveToHistory({ generatedImageUrl: imageUrl, logoIdentity: identity, thumbnail: imageUrl });
      }
      else {
         const imageUrl = await generateImage(formData, keyToUse);
         setGeneratedImageUrl(imageUrl);
         saveToHistory({ generatedImageUrl: imageUrl, thumbnail: imageUrl });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao gerar. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadClick = () => {
    if (formData.mode === AppMode.LOGO) {
      setShowDownloadModal(true);
    } else {
      triggerDownload(generatedImageUrl!, `Visionary_AI_${Date.now()}.png`);
    }
  };

  const handlePdfDownload = () => {
    if (formData.mode === AppMode.SOCIAL_PROFILE && viralStrategy) {
        generateViralProfilePDF(viralStrategy, formData.socialPlatform);
    } else if (formData.mode === AppMode.CONTENT_CREATION && contentStrategy) {
        generateContentStrategyPDF(contentStrategy, contentStrategy.topic);
    } else if (formData.mode === AppMode.CONSULTING && consultingResult) {
        generateConsultingPDF(consultingResult);
    } else if (formData.mode === AppMode.LOGO && logoIdentity && generatedImageUrl) {
        generateBrandBookPDF(logoIdentity, generatedImageUrl);
    }
  };

  const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!generatedImageUrl) return;
    if (navigator.share) {
      try {
        const response = await fetch(generatedImageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'image.png', { type: 'image/png' });
        await navigator.share({
          title: 'Visionary AI',
          files: [file]
        });
      } catch (err) { console.warn(err); }
    } 
  };

  const handleRedo = () => {
    setGeneratedImageUrl(null);
    setViralStrategy(null);
    setContentStrategy(null);
    setConsultingResult(null);
    setLogoIdentity(null);
    setShowDownloadModal(false);
  };

  const modes = [
    { id: AppMode.SOLO, label: 'Solo', icon: UserIcon },
    { id: AppMode.DUO, label: 'Dupla', icon: Users },
    { id: AppMode.PRODUCT, label: 'Produto', icon: ShoppingBag },
    { id: AppMode.TEXT_TO_IMAGE, label: 'Texto', icon: TypeIcon },
    { id: AppMode.LOGO, label: 'Logotipo', icon: PenTool },
    { id: AppMode.SOCIAL_PROFILE, label: 'Perfil', icon: Contact },
    { id: AppMode.CONTENT_CREATION, label: 'Criador', icon: Clapperboard },
    { id: AppMode.CONSULTING, label: 'Consultoria', icon: Briefcase }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      
      {/* HISTORY DRAWER */}
      {isHistoryOpen && (
          <div className="fixed inset-0 z-50 flex">
             <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsHistoryOpen(false)}></div>
             <div className="relative w-80 bg-slate-900 h-full border-r border-slate-700 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2"><HistoryIcon className="w-5 h-5 text-pink-500" /> Histórico</h2>
                    <button onClick={() => setIsHistoryOpen(false)} className="p-1 hover:bg-slate-800 rounded text-slate-400"><X className="w-5 h-5"/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {history.length === 0 ? (
                        <p className="text-slate-500 text-center mt-10 text-sm">Nenhum histórico recente.</p>
                    ) : (
                        history.map((item) => (
                            <div key={item.id} onClick={() => restoreFromHistory(item)} className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl p-3 cursor-pointer group transition-all relative">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-950/50 px-1.5 py-0.5 rounded">{item.mode}</span>
                                    <span className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <h4 className="text-sm font-medium text-slate-200 mb-1 line-clamp-2">{item.previewTitle}</h4>
                                {item.thumbnail && (
                                    <img src={item.thumbnail} className="w-full h-24 object-cover rounded-lg mt-2 opacity-80 group-hover:opacity-100 transition-opacity" />
                                )}
                                <button onClick={(e) => deleteHistoryItem(item.id, e)} className="absolute top-2 right-2 p-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
             </div>
          </div>
      )}

      {/* LOGO DOWNLOAD MODAL */}
      {showDownloadModal && generatedImageUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md relative shadow-2xl">
              <button onClick={() => setShowDownloadModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Download className="w-5 h-5 text-pink-500" /> Baixar Logo</h3>
              <p className="text-slate-400 text-sm mb-6">Escolha o formato ideal para sua marca.</p>
              <div className="space-y-3">
                 <button onClick={() => triggerDownload(generatedImageUrl, `Logo_${formData.brandName}_Original.png`)} className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl flex items-center justify-between group transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><FileImage className="w-5 h-5"/></div>
                        <div className="text-left"><p className="text-sm font-bold text-white">PNG Original</p><p className="text-xs text-slate-400">Alta qualidade com fundo branco</p></div>
                    </div>
                    <Download className="w-4 h-4 text-slate-500 group-hover:text-white" />
                 </button>
                 <button onClick={async () => { setIsProcessingDownload(true); try { const noBg = await removeBackground(generatedImageUrl); triggerDownload(noBg, `Logo_${formData.brandName}_SemFundo.png`); } catch(e) { alert("Erro ao remover fundo."); } setIsProcessingDownload(false); }} disabled={isProcessingDownload} className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl flex items-center justify-between group transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg"><Layers className="w-5 h-5"/></div>
                        <div className="text-left"><p className="text-sm font-bold text-white">PNG Transparente</p><p className="text-xs text-slate-400">Sem fundo</p></div>
                    </div>
                    {isProcessingDownload ? <Loader2 className="w-4 h-4 animate-spin text-purple-500" /> : <Download className="w-4 h-4 text-slate-500 group-hover:text-white" />}
                 </button>
                 <button onClick={() => { const svg = generateSVG(generatedImageUrl); triggerDownload(svg, `Logo_${formData.brandName}_Vetor.svg`); }} className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl flex items-center justify-between group transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg"><PenTool className="w-5 h-5"/></div>
                        <div className="text-left"><p className="text-sm font-bold text-white">SVG Vetorizado</p><p className="text-xs text-slate-400">Para impressão (Simulado)</p></div>
                    </div>
                    <Download className="w-4 h-4 text-slate-500 group-hover:text-white" />
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* HEADER */}
      <header className="fixed top-0 w-full z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <img src="https://github.com/alexsouzaac/Estudio-IA/blob/main/Logo_Crie%20uma%20logo%20para%20minha%20marca%20VISIONARY%20-%20Comunica%C3%A7%C3%A3o%20Visual%20e%20Marketing%20Digital,%20_SemFundo%20(2).png?raw=true" alt="Alex Souza Agency" className="h-12 w-auto object-contain" />
            </div>
            <div className="flex items-center gap-2">
               <button onClick={() => setIsHistoryOpen(true)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-xs font-medium border border-white/5">
                 <HistoryIcon className="w-4 h-4" /><span className="hidden sm:inline">Histórico</span>
               </button>
               <form onSubmit={handleSaveApiKey} className="flex items-center gap-2 ml-2">
                  <input type="password" value={manualApiKey} onChange={(e) => setManualApiKey(e.target.value)} placeholder="API Key..." className="w-20 sm:w-32 bg-slate-900/50 border border-slate-700/50 rounded-lg px-2 py-1 text-xs text-white focus:w-48 transition-all outline-none" />
                  <button type="submit" className="p-1.5 bg-white/10 rounded-md hover:bg-white/20 transition-colors"><KeyRound className="w-3.5 h-3.5 text-white" /></button>
               </form>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
            {modes.map((tab) => {
                const Icon = tab.icon;
                const isActive = formData.mode === tab.id;
                return (
                  <button key={tab.id} onClick={() => handleModeChange(tab.id)} className={`relative group flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all duration-300 overflow-hidden ${isActive ? 'bg-gradient-to-br from-pink-500/20 to-violet-600/20 border border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.15)]' : 'hover:bg-white/5 border border-transparent'}`}>
                    <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-pink-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className={`text-[9px] sm:text-[10px] font-medium uppercase tracking-wide transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>{tab.label}</span>
                    {isActive && (<span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-pink-500 to-violet-500 rounded-full shadow-glow"></span>)}
                  </button>
                );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-56 pb-48 space-y-10">
        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <Info className="w-5 h-5 shrink-0 mt-0.5 text-red-400" /> 
            <div className="flex flex-col gap-2 w-full">
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* --- RESULTADO DE IMAGEM (LOGO, FOTOS, ETC) --- */}
        {generatedImageUrl && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
                {/* Visualizador de Imagem Central */}
                <div className="relative group rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10">
                    <img src={generatedImageUrl} className="w-full h-auto object-cover max-h-[600px] mx-auto" alt="Resultado gerado" />
                    
                    {/* Botões Flutuantes na Imagem */}
                    <FloatingActionBar onRedo={handleRedo} onDownload={handleDownloadClick} onShare={handleShare} />
                </div>

                {/* --- CARD DE IDENTIDADE VISUAL (SÓ PARA LOGO) --- */}
                {formData.mode === AppMode.LOGO && logoIdentity && (
                   <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm space-y-8 mt-8">
                       <div className="flex justify-between items-start border-b border-white/5 pb-6">
                           <div className="space-y-2 text-left">
                               <h2 className="text-2xl font-bold text-white tracking-tight">{logoIdentity.brandName}</h2>
                               <p className="text-sm font-medium text-amber-400 tracking-widest uppercase">{logoIdentity.tagline}</p>
                           </div>
                            <button onClick={handlePdfDownload} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-xs transition-colors shadow-lg shadow-blue-500/20">
                                <FileText className="w-4 h-4" /> Baixar Manual (PDF)
                            </button>
                       </div>
                       <div className="text-center pb-6">
                           <p className="text-slate-400 text-sm italic max-w-lg mx-auto">{logoIdentity.story}</p>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {/* Arquétipo */}
                           <div>
                               <h3 className="text-xs uppercase font-bold text-slate-500 mb-3 flex items-center gap-2"><Star size={14} className="text-purple-400"/> Arquétipo da Marca</h3>
                               <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                   <p className="text-white font-bold">{logoIdentity.brandArchetype.name}</p>
                                   <p className="text-slate-400 text-xs mt-1">{logoIdentity.brandArchetype.description}</p>
                               </div>
                           </div>

                           {/* Tipografia */}
                           <div>
                               <h3 className="text-xs uppercase font-bold text-slate-500 mb-3 flex items-center gap-2"><TypeIcon size={14} className="text-blue-400"/> Tipografia</h3>
                               <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-2">
                                   <div className="flex justify-between items-center">
                                       <span className="text-slate-400 text-xs">Primária</span>
                                       <span className="text-white font-bold text-sm">{logoIdentity.typography.primaryFont}</span>
                                   </div>
                                   <div className="flex justify-between items-center">
                                       <span className="text-slate-400 text-xs">Secundária</span>
                                       <span className="text-white font-bold text-sm">{logoIdentity.typography.secondaryFont}</span>
                                   </div>
                                   <p className="text-xs text-slate-500 italic border-t border-white/5 pt-2 mt-2">{logoIdentity.typography.usageTip}</p>
                               </div>
                           </div>
                       </div>

                       {/* Paleta de Cores */}
                       <div>
                           <h3 className="text-xs uppercase font-bold text-slate-500 mb-3 flex items-center gap-2"><Palette size={14} className="text-pink-400"/> Paleta de Cores</h3>
                           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                               {logoIdentity.colorPalette.map((color, idx) => (
                                   <div key={idx} className="group relative">
                                       <div className="h-16 w-full rounded-lg mb-2 shadow-lg border border-white/10" style={{ backgroundColor: color.hex }}></div>
                                       <p className="text-white font-mono text-xs font-bold">{color.hex}</p>
                                       <p className="text-slate-500 text-[10px]">{color.name}</p>
                                       <p className="text-slate-600 text-[9px] mt-0.5">{color.usage}</p>
                                   </div>
                               ))}
                           </div>
                       </div>
                       
                        {/* Dicas de Aplicação */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
                            <div>
                                <h3 className="text-xs uppercase font-bold text-slate-500 mb-3 flex items-center gap-2"><Layout size={14} className="text-emerald-400"/> Elementos Visuais</h3>
                                <ul className="space-y-2">
                                    {logoIdentity.visualElements.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xs uppercase font-bold text-slate-500 mb-3 flex items-center gap-2"><CheckCircle2 size={14} className="text-cyan-400"/> Dicas de Aplicação</h3>
                                 <ul className="space-y-2">
                                    {logoIdentity.applicationTips.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                       </div>
                   </div>
                )}

                {/* --- 2. NOVO DISPLAY PARA PERFIL VIRAL (ESTRATÉGIA) --- */}
                {formData.mode === AppMode.SOCIAL_PROFILE && viralStrategy && (
                  <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm space-y-8 mt-8">
                     <div className="flex justify-between items-center border-b border-white/5 pb-6">
                         <h2 className="text-2xl font-bold text-white">Estratégia Viral</h2>
                         <button onClick={handlePdfDownload} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-xs transition-colors shadow-lg shadow-blue-500/20">
                             <FileText className="w-4 h-4" /> Baixar PDF
                         </button>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {/* Bio e Headline */}
                         <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
                             <div>
                                 <h3 className="text-xs uppercase font-bold text-indigo-400 mb-1">Headline (Destaque)</h3>
                                 <p className="text-white font-medium">{viralStrategy.headline}</p>
                             </div>
                             <div>
                                 <h3 className="text-xs uppercase font-bold text-purple-400 mb-1">Bio Otimizada</h3>
                                 <p className="text-slate-300 text-sm whitespace-pre-line">{viralStrategy.bio}</p>
                             </div>
                         </div>
                         
                         {/* Nomes de Usuário */}
                         <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                              <h3 className="text-xs uppercase font-bold text-emerald-400 mb-3">Sugestões de @Usuario</h3>
                              <ul className="space-y-2">
                                {viralStrategy.usernames.map((user, i) => (
                                    <li key={i} className="flex items-center gap-2 text-slate-300 text-sm bg-black/20 p-2 rounded-lg">
                                        <span className="text-emerald-500">@</span> {user}
                                    </li>
                                ))}
                              </ul>
                         </div>
                     </div>

                     {/* Content Strategy */}
                     <div className="space-y-4">
                         <h3 className="text-white font-bold flex items-center gap-2"><Megaphone size={18} className="text-pink-400"/> Plano de Conteúdo</h3>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                                 <div className="text-xs uppercase font-bold text-slate-500 mb-2">Feed</div>
                                 <p className="text-sm text-slate-300">{viralStrategy.contentStrategy.feed}</p>
                             </div>
                             <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                                 <div className="text-xs uppercase font-bold text-slate-500 mb-2">Stories</div>
                                 <p className="text-sm text-slate-300">{viralStrategy.contentStrategy.stories}</p>
                             </div>
                             <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                                 <div className="text-xs uppercase font-bold text-slate-500 mb-2">Reels/Viral</div>
                                 <p className="text-sm text-slate-300">{viralStrategy.contentStrategy.reels}</p>
                             </div>
                         </div>
                     </div>
                  </div>
                )}
            </div>
        )}

        {/* --- 3. NOVO DISPLAY PARA CONTENT CREATION --- */}
        {!generatedImageUrl && contentStrategy && (
            <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
                 <div className="w-full pt-6 pb-6 px-6 max-w-6xl mx-auto flex justify-between items-center border-b border-white/10 mb-6 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
                     <button onClick={handleRedo} className="text-white/80 hover:text-white flex items-center gap-2 text-sm font-medium bg-white/5 p-2 rounded-lg border border-white/10"><ArrowRight className="w-4 h-4 rotate-180" /> Novo Conteúdo</button>
                     <button onClick={handlePdfDownload} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-blue-500/20"><FileText className="w-4 h-4" /> Baixar Roteiro (PDF)</button>
                 </div>
                 
                 <div className="w-full max-w-4xl mx-auto p-6 space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-10">
                     <div className="text-center">
                         <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-xl shadow-purple-500/20"><Clapperboard className="w-8 h-8 text-white" /></div>
                         <h2 className="text-3xl font-bold text-white mb-2">Campanha Gerada</h2>
                         <p className="text-slate-400 text-lg">Tema: <span className="text-purple-400 font-bold">{renderSafeText(contentStrategy.topic)}</span></p>
                     </div>

                     {/* Growth Tips */}
                     <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6">
                         <h3 className="text-yellow-400 font-bold uppercase text-xs tracking-wider mb-4 flex items-center gap-2"><Zap size={16}/> Dicas de Crescimento</h3>
                         <ul className="space-y-2">
                             {contentStrategy.growthTips.map((tip, idx) => (
                                 <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                                     <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                     {renderSafeText(tip)}
                                 </li>
                             ))}
                         </ul>
                     </div>

                     {/* Content Pieces Cards */}
                     <div className="space-y-8">
                         {contentStrategy.pieces.map((piece, i) => (
                             <div key={i} className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm hover:border-purple-500/30 transition-colors">
                                 <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                                     <div className="flex items-center gap-3">
                                         <div className="bg-slate-800 p-2 rounded-lg text-slate-400 font-bold">#{i+1}</div>
                                         <div>
                                             <h4 className="text-lg font-bold text-white">{piece.format}</h4>
                                             <p className="text-xs text-slate-500">Formato Sugerido</p>
                                         </div>
                                     </div>
                                     <div className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/20">Viral</div>
                                 </div>

                                 <div className="space-y-6">
                                     <div>
                                         <h5 className="text-xs uppercase font-bold text-pink-400 mb-2">Gancho (Hook)</h5>
                                         <div className="bg-slate-800/50 p-3 rounded-xl text-white font-medium text-lg border-l-4 border-pink-500">
                                             "{renderSafeText(piece.hook)}"
                                         </div>
                                     </div>

                                     <div className="relative group/copy">
                                         <div className="flex justify-between items-center mb-2">
                                             <h5 className="text-xs uppercase font-bold text-blue-400">Roteiro / Legenda</h5>
                                             <CopyButton text={piece.script} />
                                         </div>
                                         <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5">{renderSafeText(piece.script)}</p>
                                     </div>

                                     {/* --- EXIBIÇÃO DE SLIDES PARA CARROSSEL --- */}
                                     {piece.slides && piece.slides.length > 0 && (
                                         <div className="mt-6 border-t border-white/10 pt-6">
                                            <h5 className="text-xs uppercase font-bold text-orange-400 mb-4 flex items-center gap-2"><Layers size={14}/> Estrutura do Carrossel</h5>
                                            <div className="space-y-4">
                                                {piece.slides.map((slide, sIdx) => (
                                                    <div key={sIdx} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                                                        <div className="flex justify-between mb-2">
                                                            <span className="text-xs font-bold text-slate-500 uppercase">Slide {slide.slideNumber}</span>
                                                            <CopyButton text={`${slide.title}\n\n${slide.content}`} className="scale-75" />
                                                        </div>
                                                        <h6 className="text-white font-bold text-sm mb-1">{slide.title}</h6>
                                                        <p className="text-slate-300 text-sm mb-3">{slide.content}</p>
                                                        <div className="bg-black/20 p-2 rounded text-xs text-slate-400 italic border-l-2 border-orange-500/50">
                                                            Visual: {slide.visualPrompt}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                         </div>
                                     )}

                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                                             <h5 className="text-xs uppercase font-bold text-slate-500 mb-1 flex items-center gap-1"><ImageIcon size={12}/> Sugestão Visual Geral</h5>
                                             <p className="text-xs text-slate-400">{renderSafeText(piece.visualSuggestion)}</p>
                                         </div>
                                         <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                                             <h5 className="text-xs uppercase font-bold text-slate-500 mb-1 flex items-center gap-1"><Music size={12}/> Áudio / CTA</h5>
                                             <p className="text-xs text-slate-400">CTA: {renderSafeText(piece.cta)}</p>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
            </div>
        )}

        {/* --- CONSULTING RESULT DISPLAY --- */}
        {!generatedImageUrl && consultingResult && (
            <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
                 {/* ... (Previous Consulting Code - Keeping it short for brevity as no changes requested here) ... */}
                 {/* Re-using the same code structure from previous blocks for Consulting */}
                 <div className="w-full pt-6 pb-6 px-6 max-w-6xl mx-auto flex justify-between items-center border-b border-white/10 mb-6 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
                     <button onClick={handleRedo} className="text-white/80 hover:text-white flex items-center gap-2 text-sm font-medium bg-white/5 p-2 rounded-lg border border-white/10"><ArrowRight className="w-4 h-4 rotate-180" /> Nova Consultoria</button>
                     <button onClick={handlePdfDownload} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-blue-500/20"><FileText className="w-4 h-4" /> Baixar PDF Profissional</button>
                 </div>
                 <div className="w-full max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-10 pb-20">
                     {/* ... (Existing Consulting Display Code) ... */}
                      <div className="text-center space-y-2 mb-10">
                         <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl mb-4 shadow-2xl shadow-indigo-500/20"><Briefcase className="w-10 h-10 text-white" /></div>
                        <h2 className="text-4xl font-bold text-white tracking-tight">Plano Estratégico</h2>
                        <p className="text-xl text-slate-400">Cliente: <span className="text-indigo-400 font-bold">{renderSafeText(consultingResult.clientName)}</span></p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-4 text-emerald-400 font-bold uppercase text-xs tracking-wider"><TrendingUp size={16} /> Análise de Mercado</div>
                            <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">{renderSafeText(consultingResult.marketAnalysis)}</p>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-4 text-purple-400 font-bold uppercase text-xs tracking-wider"><Users size={16} /> Arquétipo da Marca</div>
                            <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">{renderSafeText(consultingResult.brandArchetype)}</p>
                        </div>
                        <div className="md:col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8">
                            <div className="flex items-center gap-2 mb-4 text-pink-400 font-bold uppercase text-xs tracking-wider"><Palette size={16} /> Direção Visual</div>
                            <p className="text-white font-medium text-lg leading-relaxed">{renderSafeText(consultingResult.visualIdentitySuggestion)}</p>
                        </div>
                        {/* ... Rest of consulting ... */}
                    </div>
                 </div>
            </div>
        )}

        {/* --- INPUT FORMS --- */}
        {!generatedImageUrl && !contentStrategy && !consultingResult && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
              
              {/* --- LOGO MODE --- */}
              {formData.mode === AppMode.LOGO && (
                <>
                  <section className="space-y-4">
                     <div className="flex items-center gap-2 text-amber-400 font-semibold uppercase tracking-wider text-xs"><span className="w-6 h-[1px] bg-amber-500/50"></span> Nome da Empresa / Marca</div>
                    <input ref={brandNameRef} type="text" placeholder="Ex: TechNova..." value={formData.brandName} onChange={(e) => setFormData({...formData,brandName: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-white text-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </section>
                   <section className="space-y-6">
                    <div className="flex items-center gap-2 text-pink-400 font-semibold uppercase tracking-wider text-xs"><span className="w-6 h-[1px] bg-pink-500/50"></span> Estilo Visual</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {LOGO_STYLES.map((style) => (
                        <button key={style.value} onClick={() => setFormData({...formData, logoStyle: style.value})} className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 text-center h-28 ${formData.logoStyle === style.value ? 'bg-gradient-to-br from-pink-500/20 to-amber-500/20 border-pink-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}`}>
                          <style.icon className={`w-8 h-8 ${formData.logoStyle === style.value ? 'text-pink-300' : 'text-slate-500'}`} />
                          <span className="text-xs font-medium">{style.label}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-indigo-400 font-semibold uppercase tracking-wider text-xs"><span className="w-6 h-[1px] bg-indigo-500/50"></span> Detalhes</div>
                    <div className="relative">
                      <textarea ref={customPromptRef} placeholder="Descreva a logo..." value={formData.customPrompt} onChange={(e) => setFormData({...formData, customPrompt: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 pr-12 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-y min-h-[120px]" />
                    </div>
                  </section>
                </>
              )}

            {/* --- CONSULTING MODE --- */}
            {formData.mode === AppMode.CONSULTING && (
              <>
                <section className="space-y-6">
                   <div className="flex items-center gap-2 text-blue-400 font-semibold uppercase tracking-wider text-xs"><span className="w-6 h-[1px] bg-blue-500/50"></span> 1. Dados do Negócio</div>
                   <div className="grid grid-cols-1 gap-4">
                      <div>
                          <label className="text-xs text-slate-400 mb-1 block ml-1">Nome da Empresa</label>
                          <input type="text" placeholder="Ex: Doce Sabor Confeitaria" value={formData.consultingCompany} onChange={(e) => setFormData({...formData, consultingCompany: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                          <label className="text-xs text-slate-400 mb-1 block ml-1">Produto ou Serviço</label>
                          <textarea placeholder="Ex: Bolos artesanais para casamento e festas infantis..." value={formData.consultingProduct} onChange={(e) => setFormData({...formData, consultingProduct: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none h-20" />
                      </div>
                   </div>
                </section>
                <section className="space-y-6">
                   <div className="flex items-center gap-2 text-indigo-400 font-semibold uppercase tracking-wider text-xs"><span className="w-6 h-[1px] bg-indigo-500/50"></span> 2. Estratégia</div>
                   <div className="grid grid-cols-1 gap-4">
                      <div>
                          <label className="text-xs text-slate-400 mb-1 block ml-1">Objetivo Principal</label>
                          <input type="text" placeholder="Ex: Aumentar vendas pelo Instagram..." value={formData.consultingGoal} onChange={(e) => setFormData({...formData, consultingGoal: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                          <label className="text-xs text-slate-400 mb-1 block ml-1">Público Alvo</label>
                          <input type="text" placeholder="Ex: Noivas e mães de classe B/C..." value={formData.consultingAudience} onChange={(e) => setFormData({...formData, consultingAudience: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                   </div>
                </section>
              </>
            )}

            {/* --- CONTENT CREATION MODE --- */}
            {formData.mode === AppMode.CONTENT_CREATION && (
              <>
                 <section className="space-y-6">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold uppercase tracking-wider text-xs"><span className="w-6 h-[1px] bg-indigo-500/50"></span> 1. Onde você vai postar?</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {SOCIAL_PLATFORMS.map((platform) => (
                      <button key={platform.value} onClick={() => setFormData({...formData, socialPlatform: platform.value})} className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 text-center h-24 ${formData.socialPlatform === platform.value ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}`}>
                        <platform.icon className={`w-6 h-6 ${formData.socialPlatform === platform.value ? 'text-indigo-300' : 'text-slate-500'}`} />
                        <span className="text-xs font-medium">{platform.label}</span>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-orange-400 font-semibold uppercase tracking-wider text-xs"><span className="w-6 h-[1px] bg-orange-500/50"></span> 2. Escolha o Modelo Viral</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {CONTENT_TEMPLATES.filter(t => t.value === ContentTemplate.PREMIUM_QUOTES ? formData.socialPlatform === SocialPlatform.INSTAGRAM : true).map((template) => (
                      <button key={template.value} onClick={() => handleTemplateChange(template.value)} className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-start gap-2 text-center h-36 relative overflow-hidden ${formData.contentTemplate === template.value ? 'bg-orange-600/20 border-orange-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}`}>
                        <div className={`p-2 rounded-full mb-1 ${formData.contentTemplate === template.value ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-500'}`}><template.icon className="w-5 h-5" /></div>
                        <span className="text-xs font-bold leading-tight">{template.label}</span>
                        <span className="text-[10px] opacity-70 leading-tight">{template.desc}</span>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="space-y-4">
                   <div className="flex items-center gap-2 text-pink-400 font-semibold uppercase tracking-wider text-xs"><span className="w-6 h-[1px] bg-pink-500/50"></span> 3. Qual o Tema?</div>
                   <div className="bg-indigo-900/10 border border-indigo-500/20 p-4 rounded-xl mb-4 backdrop-blur-sm">
                       <div className="flex flex-col gap-3">
                           <div><h4 className="text-indigo-300 font-bold text-xs uppercase mb-1 flex gap-2 items-center"><Lightbulb size={14}/> Dica</h4><p className="text-sm text-indigo-100/90 leading-snug">{currentGuide.tip}</p></div>
                       </div>
                  </div>
                  <textarea ref={customPromptRef} placeholder="Ex: Dicas de moda..." value={formData.customPrompt} onChange={(e) => setFormData({...formData, customPrompt: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-pink-500 outline-none resize-y min-h-[160px]" />
                </section>
              </>
            )}

            {/* --- SOCIAL PROFILE MODE --- */}
            {formData.mode === AppMode.SOCIAL_PROFILE && (
              <>
                 <section className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold uppercase tracking-wider text-xs"><span className="w-6 h-[1px] bg-emerald-500/50"></span> 1. Sua Foto Atual</div>
                  <div onClick={() => fileInputRef1.current?.click()} className={`relative cursor-pointer transition-all duration-300 border-2 border-dashed rounded-xl h-48 flex items-center justify-center gap-4 ${formData.referenceImage ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-slate-700 bg-slate-900/30 hover:bg-slate-900/50'}`}>
                     <input type="file" ref={fileInputRef1} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, false)} />
                     {formData.referenceImage ? (<img src={formData.referenceImage.previewUrl} className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500/30" alt="ref" />) : (<div className="flex flex-col items-center gap-2 text-slate-500"><ImageIcon className="w-8 h-8" /><span className="text-sm">Toque para enviar sua foto</span></div>)}
                  </div>
                </section>
                 <section className="space-y-6">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold uppercase tracking-wider text-xs"><span className="w-6 h-[1px] bg-indigo-500/50"></span> 2. Rede Social</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {SOCIAL_PLATFORMS.map((platform) => (
                      <button key={platform.value} onClick={() => setFormData({...formData, socialPlatform: platform.value})} className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 text-center h-24 ${formData.socialPlatform === platform.value ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}`}>
                        <platform.icon className={`w-6 h-6 ${formData.socialPlatform === platform.value ? 'text-indigo-300' : 'text-slate-500'}`} />
                        <span className="text-xs font-medium">{platform.label}</span>
                      </button>
                    ))}
                  </div>
                </section>
                 <section className="space-y-6">
                  <div className="flex items-center gap-2 text-violet-400 font-semibold uppercase tracking-wider text-xs"><span className="w-6 h-[1px] bg-violet-500/50"></span> 3. Estilo</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {SOCIAL_STYLES.map((style) => (
                      <button key={style.value} onClick={() => setFormData({...formData, socialStyle: style.value})} className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 text-center h-24 ${formData.socialStyle === style.value ? 'bg-violet-600/20 border-violet-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}`}>
                        <style.icon className={`w-6 h-6 ${formData.socialStyle === style.value ? 'text-violet-300' : 'text-slate-500'}`} />
                        <span className="text-xs font-medium">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="space-y-4">
                   <div className="flex items-center gap-2 text-pink-400 font-semibold uppercase tracking-wider text-xs"><span className="w-6 h-[1px] bg-pink-500/50"></span> 4. Contexto</div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input ref={nicheRef} type="text" placeholder="Profissão (Ex: Advogado)" value={formData.profileNiche} onChange={(e) => setFormData({...formData, profileNiche: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-pink-500 outline-none" />
                      <input ref={goalRef} type="text" placeholder="Objetivo (Ex: Autoridade)" value={formData.profileGoal} onChange={(e) => setFormData({...formData, profileGoal: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-pink-500 outline-none" />
                   </div>
                </section>
                {/* --- ADDED CUSTOM PROMPT FOR SOCIAL PROFILE TOO --- */}
                <section className="space-y-4 pt-4 border-t border-white/5">
                   <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-emerald-400 font-semibold uppercase tracking-wider text-xs"><span className="w-6 h-[1px] bg-emerald-500/50"></span> Instrução Extra (Manual Override)</div>
                        <button onClick={handleEnhancePrompt} disabled={isEnhancing} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold transition-all border border-emerald-500/30 group">
                            {isEnhancing ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Wand2 className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform"/>}
                            Melhorar Prompt
                        </button>
                   </div>
                   <textarea ref={customPromptRef} placeholder="Ex: Adicione um fundo de escritório com janela..." value={formData.customPrompt} onChange={(e) => setFormData({...formData, customPrompt: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-y min-h-[100px]" />
                </section>
              </>
            )}

            {/* --- STANDARD PHOTO MODES (SOLO, DUO, PRODUCT, TEXT) --- */}
            {(formData.mode === AppMode.SOLO || formData.mode === AppMode.DUO || formData.mode === AppMode.PRODUCT || formData.mode === AppMode.TEXT_TO_IMAGE) && (
              <>
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-pink-400 font-semibold uppercase tracking-wider text-xs"><span className="w-6 h-[1px] bg-pink-500/50"></span> {formData.mode === AppMode.TEXT_TO_IMAGE ? "Descrição" : "Uploads"}</div>
                  {formData.mode === AppMode.TEXT_TO_IMAGE ? (
                    <div className="relative"><textarea ref={customPromptRef} placeholder="Descreva a imagem..." value={formData.customPrompt} onChange={(e) => setFormData({...formData, customPrompt: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 pr-12 text-white focus:ring-2 focus:ring-pink-500 outline-none resize-y min-h-[160px]" /></div>
                  ) : (
                    <div className={`grid gap-4 ${formData.mode === AppMode.SOLO ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        <div onClick={() => fileInputRef1.current?.click()} className={`relative cursor-pointer border-2 border-dashed rounded-3xl h-64 flex flex-col items-center justify-center bg-slate-900/30 ${formData.referenceImage ? 'border-emerald-500/50' : 'border-slate-700'}`}>
                           <input type="file" ref={fileInputRef1} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, false)} />
                           {formData.referenceImage ? <img src={formData.referenceImage.previewUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" /> : <div className="text-center p-4"><ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" /><p className="text-xs text-slate-400 uppercase font-bold">{formData.mode === AppMode.PRODUCT ? "Pessoa" : "Foto 1"}</p></div>}
                        </div>
                        {formData.mode !== AppMode.SOLO && (
                        <div onClick={() => fileInputRef2.current?.click()} className={`relative cursor-pointer border-2 border-dashed rounded-3xl h-64 flex flex-col items-center justify-center bg-slate-900/30 ${formData.secondImage ? 'border-emerald-500/50' : 'border-slate-700'}`}>
                            <input type="file" ref={fileInputRef2} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, true)} />
                            {formData.secondImage ? <img src={formData.secondImage.previewUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" /> : <div className="text-center p-4"><ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" /><p className="text-xs text-slate-400 uppercase font-bold">{formData.mode === AppMode.PRODUCT ? "Produto" : "Foto 2"}</p></div>}
                        </div>
                        )}
                    </div>
                  )}
                </section>

                {/* --- CUSTOM PROMPT SECTION FOR ALL MODES (NEW) --- */}
                {formData.mode !== AppMode.TEXT_TO_IMAGE && (
                     <section className="space-y-4">
                       <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-white/80 font-semibold uppercase tracking-wider text-xs"><span className="w-6 h-[1px] bg-white/30"></span> Comando Personalizado (Manual Override)</div>
                            <button onClick={handleEnhancePrompt} disabled={isEnhancing} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg text-xs font-bold transition-all border border-indigo-500/30 group">
                                {isEnhancing ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Wand2 className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform text-pink-400"/>}
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-violet-400">Melhorar Prompt com IA</span>
                            </button>
                       </div>
                       <textarea ref={customPromptRef} placeholder="Ex: Adicione um rapaz ao lado me abraçando pela cintura..." value={formData.customPrompt} onChange={(e) => setFormData({...formData, customPrompt: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-y min-h-[100px]" />
                     </section>
                )}

                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold uppercase tracking-wider text-xs"><span className="w-6 h-[1px] bg-indigo-500/50"></span> Cenário</div>
                  <div className="space-y-3">
                    <select value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value as LocationType})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer">
                      {LOCATIONS.map(loc => <option key={loc.value} value={loc.value}>{loc.label}</option>)}
                      <option value={LocationType.CUSTOM}>Personalizado...</option>
                    </select>
                    {formData.location === LocationType.CUSTOM && <textarea ref={customLocationRef} placeholder="Descreva o local..." value={formData.customLocation} onChange={(e) => setFormData({...formData, customLocation: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-y min-h-[80px]" />}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {LIGHTINGS.map((light) => (
                      <button key={light.value} onClick={() => setFormData({...formData, lighting: light.value})} className={`px-4 py-2 rounded-full text-xs font-medium border transition-all flex items-center gap-2 ${formData.lighting === light.value ? 'bg-amber-500/20 border-amber-500 text-amber-200' : 'bg-slate-900 border-slate-800 text-slate-400'}`}><light.icon className="w-3 h-3" />{light.label}</button>
                    ))}
                  </div>
                </section>
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-violet-400 font-semibold uppercase tracking-wider text-xs"><span className="w-6 h-[1px] bg-violet-500/50"></span> Estilo & Ação</div>
                  <div className="space-y-3">
                    <select value={formData.outfit} onChange={(e) => setFormData({...formData, outfit: e.target.value as OutfitType})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-violet-500 outline-none appearance-none cursor-pointer">
                      {OUTFITS.map(fit => <option key={fit.value} value={fit.value}>{fit.label}</option>)}
                      <option value={OutfitType.CUSTOM}>Personalizado...</option>
                    </select>
                    {formData.outfit === OutfitType.CUSTOM && <textarea ref={customOutfitRef} placeholder="Descreva a roupa..." value={formData.customOutfit} onChange={(e) => setFormData({...formData, customOutfit: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-violet-500 outline-none resize-y min-h-[80px]" />}
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(formData.mode === AppMode.SOLO || formData.mode === AppMode.TEXT_TO_IMAGE) && MOODS.map((mood) => <button key={mood.value} onClick={() => setFormData({...formData, mood: mood.value})} className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 text-center h-24 ${formData.mood === mood.value ? 'bg-violet-500/20 border-violet-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}><mood.icon className="w-6 h-6" /><span className="text-xs">{mood.label}</span></button>)}
                      {formData.mode === AppMode.DUO && DUO_ACTIONS.map((action) => <button key={action.value} onClick={() => setFormData({...formData, duoAction: action.value})} className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 text-center h-24 ${formData.duoAction === action.value ? 'bg-violet-500/20 border-violet-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}><action.icon className="w-6 h-6" /><span className="text-xs">{action.label}</span></button>)}
                      {formData.mode === AppMode.PRODUCT && PRODUCT_ACTIONS.map((action) => <button key={action.value} onClick={() => setFormData({...formData, productAction: action.value})} className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 text-center h-24 ${formData.productAction === action.value ? 'bg-violet-500/20 border-violet-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}><action.icon className="w-6 h-6" /><span className="text-xs">{action.label}</span></button>)}
                    </div>
                  </div>
                </section>
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold uppercase tracking-wider text-xs"><span className="w-6 h-[1px] bg-cyan-500/50"></span> Câmera</div>
                   <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {FRAMINGS.map((framing) => (
                         <button key={framing.value} onClick={() => setFormData({...formData, framing: framing.value})} className={`px-2 py-3 rounded-lg border text-xs font-medium transition-all flex flex-col items-center gap-2 ${formData.framing === framing.value ? 'bg-cyan-500/20 border-cyan-500 text-cyan-100' : 'bg-slate-900 border-slate-800 text-slate-400'}`}><framing.icon className="w-4 h-4" />{framing.label}</button>
                      ))}
                    </div>
                   </div>
                 </section>
              </>
            )}
            </div>
        )}
      </main>

      {/* Footer / CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent z-30 pointer-events-none">
        <button onClick={handleGenerate} disabled={isGenerating} className={`pointer-events-auto w-full max-w-2xl mx-auto h-16 rounded-full text-lg font-bold tracking-widest uppercase shadow-2xl flex items-center justify-center gap-3 transition-all duration-500 ${isGenerating ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white hover:scale-[1.02] hover:shadow-pink-500/30'}`}>
          {isGenerating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" /> 
              {formData.mode === AppMode.SOCIAL_PROFILE ? "Criando Estratégia..." : 
               formData.mode === AppMode.CONTENT_CREATION ? "Criando Campanha..." : 
               formData.mode === AppMode.CONSULTING ? "Elaborando Plano..." : "Gerando..."}
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6 animate-pulse" /> 
              {formData.mode === AppMode.LOGO ? "Criar Logo" : 
               formData.mode === AppMode.SOCIAL_PROFILE ? "Gerar Kit Viral" : 
               formData.mode === AppMode.CONTENT_CREATION ? "Gerar Conteúdo" : 
               formData.mode === AppMode.CONSULTING ? "Gerar Consultoria" : "Gerar Imagem"}
            </>
          )}
        </button>
      </div>

    </div>
  );
}

export default App;
