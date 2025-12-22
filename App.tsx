
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Loader2, Info, User as UserIcon, Users, ShoppingBag, Type as TypeIcon, PenTool, Contact, Clapperboard, Briefcase, History as HistoryIcon, ShieldCheck, KeyRound, Wand2, Ban, AlertTriangle } from 'lucide-react';
import { AppState, LocationType, LightingType, OutfitType, MoodType, FramingType, AppMode, DuoAction, ProductAction, LogoStyle, SocialPlatform, SocialStyle, ProfileType, ViralStrategyResult, ContentCreationResult, HistoryItem, ContentTemplate, ConsultingResult, LogoIdentityResult } from './types';
import { LOCATIONS, LIGHTINGS, OUTFITS, MOODS, FRAMINGS, DUO_ACTIONS, PRODUCT_ACTIONS, CONTENT_TEMPLATES } from './constants';
import { generateImage, enhanceUserPrompt, fileToDataURL, fileToBase64 } from './services/geminiService';
import FloatingActionBar from './components/FloatingActionBar';

const DEFAULT_STATE: AppState = {
  mode: AppMode.SOLO,
  referenceImage: null,
  secondImage: null,
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

function App() {
  const [formData, setFormData] = useState<AppState>(DEFAULT_STATE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);

  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      const selected = await (window as any).aistudio?.hasSelectedApiKey();
      setHasApiKey(!!selected);
    };
    checkKey();
  }, []);

  const handleOpenKeyDialog = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleModeChange = (mode: AppMode) => {
    setFormData({ ...DEFAULT_STATE, mode });
    setError(null);
    setGeneratedImageUrl(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isSecond: boolean = false) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = await fileToDataURL(file);
      const base64 = await fileToBase64(file);
      setFormData(prev => ({ ...prev, [isSecond ? 'secondImage' : 'referenceImage']: { file, previewUrl, base64 } }));
      setError(null);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!formData.customPrompt.trim()) return;
    setIsEnhancing(true);
    try {
        const enhanced = await enhanceUserPrompt(formData.customPrompt);
        setFormData(prev => ({ ...prev, customPrompt: enhanced }));
    } finally { setIsEnhancing(false); }
  };

  const handleGenerate = async () => {
    if (!formData.referenceImage && formData.mode !== AppMode.TEXT_TO_IMAGE) {
      setError("⚠️ Por favor, envie uma foto primeiro.");
      return;
    }

    setIsGenerating(true); 
    setError(null);
    
    try {
      const imageUrl = await generateImage(formData);
      setGeneratedImageUrl(imageUrl);
    } catch (err: any) { 
      setError(err.message); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  const renderParameterSelector = (title: string, options: any[], currentValue: any, field: keyof AppState) => (
    <div className="space-y-3">
      <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">{title}</h3>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = currentValue === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setFormData({ ...formData, [field]: opt.value })}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${isActive ? 'bg-pink-500/10 border-pink-500 text-white shadow-lg shadow-pink-500/10' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-pink-400' : 'text-slate-500'}`} />
              <span className="text-xs font-medium whitespace-nowrap">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="fixed top-0 w-full z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex flex-col items-start gap-0.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-white">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-indigo-400 to-cyan-400">
                  Alex Souza
                </span>
              </h1>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400/90">
                Agência de Marketing Digital
              </p>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={handleOpenKeyDialog} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${hasApiKey ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-white/5'}`}>
                 {hasApiKey ? <ShieldCheck className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
                 {hasApiKey ? 'API Ativa' : 'API Grátis'}
               </button>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
            {[
              { id: AppMode.SOLO, label: 'Solo', icon: UserIcon },
              { id: AppMode.DUO, label: 'Dupla', icon: Users },
              { id: AppMode.PRODUCT, label: 'Produto', icon: ShoppingBag },
              { id: AppMode.TEXT_TO_IMAGE, label: 'Texto', icon: TypeIcon },
              { id: AppMode.LOGO, label: 'Logo', icon: PenTool },
              { id: AppMode.SOCIAL_PROFILE, label: 'Perfil', icon: Contact },
              { id: AppMode.CONTENT_CREATION, label: 'Criador', icon: Clapperboard },
              { id: AppMode.CONSULTING, label: 'Consultoria', icon: Briefcase }
            ].map((tab) => {
                const Icon = tab.icon; const isActive = formData.mode === tab.id;
                return (
                  <button key={tab.id} onClick={() => handleModeChange(tab.id)} className={`flex-shrink-0 flex flex-col items-center justify-center gap-1 py-3 px-4 rounded-xl transition-all ${isActive ? 'bg-gradient-to-br from-pink-500/20 to-violet-600/20 border border-pink-500/30' : 'hover:bg-white/5 border border-transparent'}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-pink-400' : 'text-slate-500'}`} />
                    <span className={`text-[9px] uppercase font-bold ${isActive ? 'text-white' : 'text-slate-500'}`}>{tab.label}</span>
                  </button>
                );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-56 pb-48 space-y-10">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-2xl text-sm flex items-start gap-3 animate-in fade-in zoom-in-95">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
            <div className="flex-1">
                <p className="font-bold mb-1">Nota da Agência:</p>
                <p className="opacity-90">{error}</p>
            </div>
          </div>
        )}

        {generatedImageUrl ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
                <div className="relative group rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10">
                    <img src={generatedImageUrl} className="w-full h-auto object-cover max-h-[600px] mx-auto" alt="Resultado" />
                    <FloatingActionBar onRedo={() => setGeneratedImageUrl(null)} imageUrl={generatedImageUrl} />
                </div>
            </div>
        ) : (
          <div className="space-y-10 animate-in fade-in">
              <section className="space-y-6">
                <div className={`grid ${formData.mode === AppMode.DUO || formData.mode === AppMode.PRODUCT ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                  <div onClick={() => fileInputRef1.current?.click()} className={`relative cursor-pointer border-2 border-dashed rounded-3xl h-64 flex flex-col items-center justify-center bg-slate-900/30 transition-all ${formData.referenceImage ? 'border-emerald-500/50' : 'border-slate-700 hover:border-pink-500/50'}`}>
                    <input type="file" ref={fileInputRef1} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, false)} />
                    {formData.referenceImage ? <img src={formData.referenceImage.previewUrl} className="absolute inset-0 w-full h-full object-cover rounded-3xl opacity-60" /> : <div className="text-center p-4"><ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" /><p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">SUBIR FOTO</p></div>}
                  </div>
                  {(formData.mode === AppMode.DUO || formData.mode === AppMode.PRODUCT) && (
                    <div onClick={() => fileInputRef2.current?.click()} className={`relative cursor-pointer border-2 border-dashed rounded-3xl h-64 flex flex-col items-center justify-center bg-slate-900/30 transition-all ${formData.secondImage ? 'border-emerald-500/50' : 'border-slate-700 hover:border-pink-500/50'}`}>
                      <input type="file" ref={fileInputRef2} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, true)} />
                      {formData.secondImage ? <img src={formData.secondImage.previewUrl} className="absolute inset-0 w-full h-full object-cover rounded-3xl opacity-60" /> : <div className="text-center p-4"><ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" /><p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">FOTO 2</p></div>}
                    </div>
                  )}
                </div>

                <div className="space-y-8 bg-white/5 border border-white/5 p-6 rounded-3xl backdrop-blur-md">
                  {renderParameterSelector('Cenário', LOCATIONS, formData.location, 'location')}
                  {renderParameterSelector('Iluminação', LIGHTINGS, formData.lighting, 'lighting')}
                  {renderParameterSelector('Look', OUTFITS, formData.outfit, 'outfit')}
                  {renderParameterSelector('Enquadramento', FRAMINGS, formData.framing, 'framing')}
                  {renderParameterSelector('Expressão', MOODS, formData.mood, 'mood')}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Prompt Extra</span>
                      <button onClick={handleEnhancePrompt} disabled={isEnhancing} className="text-[10px] font-bold text-pink-400 flex items-center gap-1 hover:text-pink-300">{isEnhancing ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3"/>} Otimizar Prompt</button>
                  </div>
                  <textarea value={formData.customPrompt} onChange={(e) => setFormData({...formData, customPrompt: e.target.value})} placeholder="Instruções adicionais..." className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white h-32 focus:ring-2 focus:ring-pink-500 outline-none transition-all" />
                </div>
              </section>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent z-30 pointer-events-none">
        <button onClick={handleGenerate} disabled={isGenerating} className={`pointer-events-auto w-full max-w-2xl mx-auto h-16 rounded-full text-lg font-bold tracking-widest uppercase shadow-2xl flex items-center justify-center gap-3 transition-all duration-500 ${isGenerating ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white hover:scale-[1.02] shadow-pink-500/20'}`}>
          {isGenerating ? <><Loader2 className="w-6 h-6 animate-spin" /> Processando Foto...</> : <><Sparkles className="w-6 h-6" /> Gerar Agora</>}
        </button>
      </div>
    </div>
  );
}

export default App;
