
import React from 'react';
import { RotateCcw, Download, Share2 } from 'lucide-react';

interface FloatingActionBarProps {
  onRedo: () => void;
  imageUrl: string | null;
}

const FloatingActionBar: React.FC<FloatingActionBarProps> = ({ onRedo, imageUrl }) => {
  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `AlexSouza_AI_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!imageUrl) return;
    if (navigator.share) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'foto_ia_alexsouza.png', { type: 'image/png' });
        await navigator.share({
          title: 'RealSelf AI - Alex Souza',
          text: 'Olha essa imagem que gerei com a IA do Alex Souza!',
          files: [file],
        });
      } catch (err) {
        console.error("Erro ao compartilhar:", err);
      }
    } else {
      alert("Compartilhamento não suportado neste navegador. Use o botão de Download.");
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-6 p-4 bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl">
        
        <button 
          onClick={onRedo}
          className="p-4 rounded-full bg-white/5 hover:bg-white/20 text-white transition-all border border-white/10 group"
          title="Tentar Outra"
        >
          <RotateCcw className="w-6 h-6 group-hover:-rotate-90 transition-transform duration-300" />
        </button>

        <button 
          onClick={handleDownload}
          className="p-5 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-600 text-white shadow-lg hover:shadow-pink-500/50 hover:scale-105 transition-all group"
          title="Baixar Foto"
        >
          <Download className="w-8 h-8 group-hover:animate-bounce" />
        </button>

        <button 
          onClick={handleShare}
          className="p-4 rounded-full bg-white/5 hover:bg-white/20 text-white transition-all border border-white/10"
          title="Compartilhar"
        >
          <Share2 className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
};

export default FloatingActionBar;
