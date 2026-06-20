import React, { useState } from 'react';
import { X, Copy, Check, Eye } from 'lucide-react';

export default function PreviewResume({ text, fileName, onClose }) {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getHighlightedText = (text, search) => {
    if (!search.trim()) return text;
    const parts = text.split(new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() 
            ? <mark key={i} className="bg-violet-500/40 text-white rounded px-0.5">{part}</mark> 
            : part
        )}
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-3xl rounded-2xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden animate-scale-in border border-slate-700/80">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-violet-400" />
            <div>
              <h3 className="font-semibold text-white">Parsed Text Preview</h3>
              <p className="text-xs text-slate-400 truncate max-w-[400px]">{fileName}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-850 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/30">
          <input
            type="text"
            placeholder="Search parsed content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-3 py-1.5 rounded-lg glass-input text-xs font-sans"
          />

          <button
            onClick={handleCopy}
            className="w-full sm:w-auto px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Raw Text</span>
              </>
            )}
          </button>
        </div>

        {/* Text Container */}
        <div className="p-6 overflow-y-auto bg-slate-950/80 flex-1 font-mono text-sm leading-relaxed text-slate-300 select-text">
          {text ? (
            <pre className="whitespace-pre-wrap font-mono break-words leading-relaxed select-text">
              {getHighlightedText(text, searchQuery)}
            </pre>
          ) : (
            <div className="text-center py-12 text-slate-500">
              No content extracted.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-between items-center text-xs text-slate-400">
          <span>Word Count: {text.split(/\s+/).filter(Boolean).length}</span>
          <span>Character Count: {text.length}</span>
        </div>

      </div>
    </div>
  );
}
