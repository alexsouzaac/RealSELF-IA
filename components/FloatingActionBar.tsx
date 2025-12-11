import React from 'react';
import { RotateCcw, Download, Share2 } from 'lucide-react';

interface FloatingActionBarProps {
  onRedo: () => void;
  onDownload: () => void;
  onShare: () => void;
}

const FloatingActionBar: React.FC<FloatingActionBarProps> = ({ onRedo, onDownload, onShare }) => {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-6 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl">
        
        <button 
          onClick={onRedo}
          className="p-4 rounded-full bg-white/5 hover:bg-white/20 text-white transition-all duration-300 border border-white/10 group"
          title="Refazer"
        >
          <RotateCcw className="w-6 h-6 group-hover:-rotate-90 transition-transform duration-300" />
        </button>

        <button 
          onClick={onDownload}
          className="p-5 rounded-full bg-gradient-to-tr from-pink-500 to-violet-600 text-white shadow-lg hover:shadow-pink-500/50 hover:scale-105 transition-all duration-300 group"
          title="Download 8K"
        >
          <Download className="w-8 h-8 group-hover:animate-bounce" />
        </button>

        <button 
          onClick={onShare}
          className="p-4 rounded-full bg-white/5 hover:bg-white/20 text-white transition-all duration-300 border border-white/10"
          title="Compartilhar"
        >
          <Share2 className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
};

export default FloatingActionBar;