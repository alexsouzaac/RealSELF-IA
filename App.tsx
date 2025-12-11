import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, CheckCircle2, MapPin, Shirt, Camera, RefreshCcw, Loader2, Info, KeyRound, User, Users, ShoppingBag, ClipboardPaste, ExternalLink } from 'lucide-react';
import { AppState, LocationType, LightingType, OutfitType, MoodType, FramingType, AppMode, DuoAction, ProductAction } from './types';
import { LOCATIONS, LIGHTINGS, OUTFITS, MOODS, FRAMINGS, DUO_ACTIONS, PRODUCT_ACTIONS } from './constants';
import { generateImage, fileToBase64, fileToDataURL } from './services/geminiService';
import FloatingActionBar from './components/FloatingActionBar';

const DEFAULT_STATE: AppState = {
  mode: AppMode.SOLO,
  referenceImage: null,
  secondImage: null,
  location: LocationType.COFFEE_SHOP,
  customLocation: '',
  lighting: LightingType.GOLDEN_HOUR,
  outfit: OutfitType.BASIC_TSHIRT,
  customOutfit: '',
  mood: MoodType.RELAXED,
  duoAction: DuoAction.SELFIE,
  productAction: ProductAction.CASUAL_HOLD,
  framing: FramingType.KNEES_UP,
};

function App() {
  const [formData, setFormData] = useState<AppState>(DEFAULT_STATE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isCheckingKey, setIsCheckingKey] = useState<boolean>(true);
  
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  
  // Referências para os inputs de texto para controle de foco (Agora TextAreas)
  const customLocationRef = useRef<HTMLTextAreaElement>(null);
  const customOutfitRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      if ((window as any).aistudio) {
        const has = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      } else {
        setHasApiKey(true);
      }
    } catch (e) {
      console.error("Error checking API key:", e);
      setHasApiKey(false);
    } finally {
      setIsCheckingKey(false);
    }
  };

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
      setError(null);
    }
  };

  // --- Handlers ---

  const handleModeChange = (mode: AppMode) => {
    setFormData(prev => ({
      ...prev,
      mode,
      referenceImage: null, // Reset images on mode change for clean state or keep them? Reset safer.
      secondImage: null
    }));
    setError(null);
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

  const handlePaste = async (e: React.MouseEvent, field: 'customLocation' | 'customOutfit') => {
    e.preventDefault(); // Evita comportamento padrão do botão
    e.stopPropagation();

    // Identifica o input correto e força o foco
    const inputRef = field === 'customLocation' ? customLocationRef : customOutfitRef;
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Tenta ler a área de transferência
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setFormData(prev => ({
            ...prev,
            [field]: text
          }));
        }
      } else {
        // Fallback caso a API não esteja disponível (comum em http ou webviews antigas)
        console.warn("Clipboard API not available. Input focused for manual paste.");
      }
    } catch (err) {
      console.error('Failed to read clipboard', err);
      // Se falhar (permissão negada), o foco já está no input, permitindo que o usuário cole manualmente (long press)
    }
  };

  const handleGenerate = async () => {
    if (!formData.referenceImage) {
      setError(formData.mode === AppMode.SOLO ? "Faça o upload da sua foto." : "Faça o upload da primeira foto.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (formData.mode !== AppMode.SOLO && !formData.secondImage) {
      setError(formData.mode === AppMode.DUO ? "Faça o upload da segunda pessoa." : "Faça o upload da foto do produto.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const imageUrl = await generateImage(formData);
      setGeneratedImageUrl(imageUrl);
    } catch (err: any) {
      console.error(err);
      if (err.message && (err.message.includes("403") || err.message.includes("PERMISSION_DENIED"))) {
        setError("Permissão negada (403). Sua chave de API pode não ter acesso ou expirou.");
        setHasApiKey(false);
      } else if (err.message && err.message.includes("Requested entity was not found")) {
        setError("Chave inválida ou expirada. Por favor, selecione novamente.");
        setHasApiKey(false);
      } else {
        setError(err.message || "Ocorreu um erro ao gerar a imagem. Tente novamente.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImageUrl) {
      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.download = `RealSelf_AI_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async () => {
    if (generatedImageUrl && navigator.share) {
      try {
        const response = await fetch(generatedImageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'realself-ai.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'RealSelf AI Photo',
          text: 'Minha foto hiper-realista gerada com IA!',
          files: [file]
        });
      } catch (err) {
        console.log('Sharing failed', err);
      }
    } else {
      alert("Compartilhamento não suportado neste navegador.");
    }
  };

  const handleRedo = () => {
    setGeneratedImageUrl(null);
  };

  // --- Render Loading/Auth States ---

  if (isCheckingKey) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
        
        <div className="relative z-10 max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
             <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">RealSelf AI</h1>
            <p className="text-slate-400">
              Para gerar imagens hiper-realistas, precisamos conectar aos serviços do Google AI Studio.
            </p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleSelectKey}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold tracking-wide transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 group"
            >
              <KeyRound className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Conectar API Key
            </button>
            
            <p className="text-xs text-slate-500 leading-relaxed flex items-center justify-center gap-1">
              *Nota: Obtenha sua chave gratuitamente no <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 flex items-center gap-0.5">Google AI Studio <ExternalLink className="w-3 h-3"/></a>.
            </p>
          </div>
        </div>

        {error && (
           <div className="max-w-md bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-sm flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
      </div>
    );
  }

  // --- Render Result View ---

  if (generatedImageUrl) {
    return (
      <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col items-center justify-center">
        <div 
            className="absolute inset-0 bg-contain bg-center bg-no-repeat z-10"
            style={{ backgroundImage: `url(${generatedImageUrl})` }}
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-3xl -z-0" 
             style={{ backgroundImage: `url(${generatedImageUrl})`, backgroundSize: 'cover' }} 
        />
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 bg-gradient-to-b from-black/60 to-transparent">
          <div>
             <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" /> RealSelf AI
            </h1>
            <p className="text-xs text-white/70">Mode: {formData.mode}</p>
          </div>
        </div>
        <FloatingActionBar 
          onRedo={handleRedo} 
          onDownload={handleDownload} 
          onShare={handleShare}
        />
      </div>
    );
  }

  // --- Render Form View ---

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-32">
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
                 RealSelf AI
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <a 
               href="https://aistudio.google.com/app/apikey" 
               target="_blank" 
               rel="noopener noreferrer"
               className="hidden sm:flex items-center gap-1 text-[10px] font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1.5 rounded-md transition-colors border border-indigo-500/20"
               title="Obter chave gratuita no Google AI Studio"
             >
               Obter Key Grátis
               <ExternalLink className="w-3 h-3" />
             </a>
             <button onClick={handleSelectKey} title="Trocar API Key" className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                <KeyRound className="w-4 h-4" />
             </button>
             <div className="text-[10px] text-slate-500 font-mono ml-2 hidden sm:block">
              Credits: Alex Souza
            </div>
          </div>
        </div>
        
        {/* Mode Tabs */}
        <div className="max-w-2xl mx-auto px-6 pb-2 pt-0 flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: AppMode.SOLO, label: 'Solo', icon: User },
            { id: AppMode.DUO, label: 'Dupla', icon: Users },
            { id: AppMode.PRODUCT, label: 'Produto', icon: ShoppingBag }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = formData.mode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleModeChange(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap
                  ${isActive 
                    ? 'bg-white/10 text-white border border-white/20 shadow-lg' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-pink-400' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-36 space-y-10">
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
            <Info className="w-5 h-5 shrink-0 mt-0.5" /> 
            <div className="flex flex-col gap-2 w-full">
              <span>{error}</span>
              <div className="flex gap-2">
                {(error.includes("Permissão negada") || error.includes("Chave inválida")) && (
                  <button 
                    onClick={handleSelectKey}
                    className="self-start px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-100 text-xs rounded-lg transition-colors border border-red-500/20"
                  >
                    Reconectar API Key
                  </button>
                )}
                 <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="self-start px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 text-xs rounded-lg transition-colors border border-indigo-500/20 flex items-center gap-1"
                  >
                    Gerar nova Key <ExternalLink className="w-3 h-3" />
                  </a>
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Uploads (Dynamic Layout) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-pink-400 font-semibold uppercase tracking-wider text-xs">
            <span className="w-6 h-[1px] bg-pink-500/50"></span> Seção 1: Uploads
          </div>
          <h2 className="text-2xl font-light text-white">
            {formData.mode === AppMode.SOLO && "Sua foto original"}
            {formData.mode === AppMode.DUO && "Fotos da Dupla"}
            {formData.mode === AppMode.PRODUCT && "Pessoa e Produto"}
          </h2>
          
          <div className={`grid gap-4 ${formData.mode === AppMode.SOLO ? 'grid-cols-1' : 'grid-cols-2'}`}>
            
            {/* Upload Box 1 */}
            <div 
              onClick={() => fileInputRef1.current?.click()}
              className={`
                relative group cursor-pointer transition-all duration-300
                border-2 border-dashed rounded-3xl h-64 flex flex-col items-center justify-center
                overflow-hidden bg-slate-900/30
                ${formData.referenceImage ? 'border-green-500/50 bg-green-900/10' : 'border-slate-700 hover:border-slate-500'}
              `}
            >
              <input 
                type="file" 
                ref={fileInputRef1} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, false)}
              />
              {formData.referenceImage ? (
                <>
                  <img src={formData.referenceImage.previewUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="1" />
                  <div className="absolute inset-0 flex items-center justify-center"><CheckCircle2 className="w-8 h-8 text-green-400 drop-shadow-lg" /></div>
                </>
              ) : (
                <div className="text-center p-4">
                  <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                    {formData.mode === AppMode.PRODUCT ? "Pessoa" : (formData.mode === AppMode.DUO ? "Pessoa 1" : "Você")}
                  </p>
                </div>
              )}
            </div>

            {/* Upload Box 2 (Conditional) */}
            {formData.mode !== AppMode.SOLO && (
              <div 
                onClick={() => fileInputRef2.current?.click()}
                className={`
                  relative group cursor-pointer transition-all duration-300
                  border-2 border-dashed rounded-3xl h-64 flex flex-col items-center justify-center
                  overflow-hidden bg-slate-900/30
                  ${formData.secondImage ? 'border-green-500/50 bg-green-900/10' : 'border-slate-700 hover:border-slate-500'}
                `}
              >
                <input 
                  type="file" 
                  ref={fileInputRef2} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, true)}
                />
                {formData.secondImage ? (
                  <>
                    <img src={formData.secondImage.previewUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="2" />
                    <div className="absolute inset-0 flex items-center justify-center"><CheckCircle2 className="w-8 h-8 text-green-400 drop-shadow-lg" /></div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    {formData.mode === AppMode.PRODUCT ? (
                       <ShoppingBag className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    ) : (
                       <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    )}
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                      {formData.mode === AppMode.PRODUCT ? "Produto" : "Pessoa 2"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Environment */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold uppercase tracking-wider text-xs">
            <span className="w-6 h-[1px] bg-indigo-500/50"></span> Seção 2: O Cenário
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <MapPin className="w-4 h-4" /> Local
            </label>
            <div className="grid grid-cols-1 gap-3">
              <select 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value as LocationType})}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
              >
                {LOCATIONS.map(loc => (
                  <option key={loc.value} value={loc.value}>{loc.label}</option>
                ))}
                <option value={LocationType.CUSTOM}>Personalizado...</option>
              </select>
              
              {formData.location === LocationType.CUSTOM && (
                <div className="relative animate-in fade-in slide-in-from-top-2">
                  <textarea 
                    ref={customLocationRef}
                    placeholder="Descreva o local (ex: Café em Tóquio...)"
                    value={formData.customLocation}
                    onChange={(e) => setFormData({...formData, customLocation: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 pr-12 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-y min-h-[100px]"
                    autoComplete="off"
                    autoCorrect="off"
                    style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
                  />
                  <button
                    onClick={(e) => handlePaste(e, 'customLocation')}
                    className="absolute right-3 top-3 p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors z-10 cursor-pointer"
                    title="Colar texto"
                    type="button"
                  >
                    <ClipboardPaste size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm text-slate-400">Iluminação</label>
            <div className="flex flex-wrap gap-2">
              {LIGHTINGS.map((light) => {
                const Icon = light.icon;
                const isSelected = formData.lighting === light.value;
                return (
                  <button
                    key={light.value}
                    onClick={() => setFormData({...formData, lighting: light.value})}
                    className={`
                      px-4 py-2 rounded-full text-xs font-medium border transition-all flex items-center gap-2
                      ${isSelected 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}
                    `}
                  >
                    <Icon className="w-3 h-3" />
                    {light.label}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Section 3: Style & Action (Dynamic) */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-violet-400 font-semibold uppercase tracking-wider text-xs">
             <span className="w-6 h-[1px] bg-violet-500/50"></span> Seção 3: Estilo & Ação
          </div>

          <div className="space-y-3">
             <label className="flex items-center gap-2 text-sm text-slate-400">
              <Shirt className="w-4 h-4" /> {formData.mode === AppMode.DUO ? 'O que vestem?' : 'O que você veste?'}
            </label>
            <div className="grid grid-cols-1 gap-3">
              <select 
                value={formData.outfit}
                onChange={(e) => setFormData({...formData, outfit: e.target.value as OutfitType})}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-violet-500 outline-none appearance-none"
              >
                {OUTFITS.map(fit => (
                  <option key={fit.value} value={fit.value}>{fit.label}</option>
                ))}
                <option value={OutfitType.CUSTOM}>Personalizado...</option>
              </select>
               {formData.outfit === OutfitType.CUSTOM && (
                <div className="relative animate-in fade-in slide-in-from-top-2">
                  <textarea 
                    ref={customOutfitRef}
                    placeholder="Descreva a roupa..."
                    value={formData.customOutfit}
                    onChange={(e) => setFormData({...formData, customOutfit: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 pr-12 text-white focus:ring-2 focus:ring-violet-500 outline-none resize-y min-h-[100px]"
                    autoComplete="off"
                    autoCorrect="off"
                    style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
                  />
                  <button
                    onClick={(e) => handlePaste(e, 'customOutfit')}
                    className="absolute right-3 top-3 p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors z-10 cursor-pointer"
                    title="Colar texto"
                    type="button"
                  >
                    <ClipboardPaste size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm text-slate-400">
              {formData.mode === AppMode.SOLO && "Qual a sua vibe?"}
              {formData.mode === AppMode.DUO && "Ação da Dupla"}
              {formData.mode === AppMode.PRODUCT && "Interação com o Produto"}
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* SOLO: MOODS */}
              {formData.mode === AppMode.SOLO && MOODS.map((mood) => {
                const Icon = mood.icon;
                const isSelected = formData.mood === mood.value;
                return (
                  <button key={mood.value} onClick={() => setFormData({...formData, mood: mood.value})}
                    className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 text-center h-24 ${isSelected ? 'bg-violet-500/20 border-violet-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-violet-300' : ''}`} />
                    <span className="text-xs">{mood.label}</span>
                  </button>
                )
              })}

              {/* DUO: ACTIONS */}
              {formData.mode === AppMode.DUO && DUO_ACTIONS.map((action) => {
                const Icon = action.icon;
                const isSelected = formData.duoAction === action.value;
                return (
                  <button key={action.value} onClick={() => setFormData({...formData, duoAction: action.value})}
                    className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 text-center h-24 ${isSelected ? 'bg-violet-500/20 border-violet-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-violet-300' : ''}`} />
                    <span className="text-xs">{action.label}</span>
                  </button>
                )
              })}

              {/* PRODUCT: ACTIONS */}
              {formData.mode === AppMode.PRODUCT && PRODUCT_ACTIONS.map((action) => {
                const Icon = action.icon;
                const isSelected = formData.productAction === action.value;
                return (
                  <button key={action.value} onClick={() => setFormData({...formData, productAction: action.value})}
                    className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 text-center h-24 ${isSelected ? 'bg-violet-500/20 border-violet-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-violet-300' : ''}`} />
                    <span className="text-xs">{action.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

         {/* Section 4: Camera */}
         <section className="space-y-6">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold uppercase tracking-wider text-xs">
             <span className="w-6 h-[1px] bg-cyan-500/50"></span> Seção 4: A Câmera
          </div>
           <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <Camera className="w-4 h-4" /> Enquadramento
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FRAMINGS.map((framing) => {
                const Icon = framing.icon;
                const isSelected = formData.framing === framing.value;
                return (
                   <button
                    key={framing.value}
                    onClick={() => setFormData({...formData, framing: framing.value})}
                    className={`
                      px-2 py-3 rounded-lg border text-xs font-medium transition-all flex flex-col items-center gap-2
                      ${isSelected 
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-100' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {framing.label}
                  </button>
                )
              })}
            </div>
           </div>
         </section>
      </main>

      {/* Footer / CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent z-30">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`
            w-full max-w-2xl mx-auto h-16 rounded-full text-lg font-bold tracking-widest uppercase shadow-2xl
            flex items-center justify-center gap-3 transition-all duration-500
            ${isGenerating 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white hover:scale-[1.02] hover:shadow-pink-500/30'}
          `}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" /> Gerando...
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6 animate-pulse" /> Gerar Imagem
            </>
          )}
        </button>
      </div>

    </div>
  );
}

export default App;
