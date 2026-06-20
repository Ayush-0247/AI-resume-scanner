import React, { useState } from 'react';
import { Sparkles, AlertCircle, TrendingUp, Info, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function SuggestionsList({ suggestions = [], isLocalSuggestions = true }) {
  const [filterImpact, setFilterImpact] = useState('ALL');

  const filteredSuggestions = suggestions.filter(s => {
    if (filterImpact === 'ALL') return true;
    return s.impact.toUpperCase() === filterImpact;
  });

  const getImpactBadge = (impact) => {
    const imp = impact.toUpperCase();
    if (imp === 'HIGH') return 'bg-rose-500/10 border-rose-500/25 text-rose-400';
    if (imp === 'MEDIUM') return 'bg-amber-500/10 border-amber-500/25 text-amber-400';
    return 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400';
  };

  const getCategoryIcon = (category) => {
    const cat = category.toLowerCase();
    if (cat.includes('skill')) return <AlertCircle className="w-4 h-4 text-violet-400" />;
    if (cat.includes('keyword')) return <TrendingUp className="w-4 h-4 text-cyan-400" />;
    if (cat.includes('quantified') || cat.includes('achievement')) return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    return <Info className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Filters Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            Actionable Optimization Checklist
            {!isLocalSuggestions && (
              <span className="px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xxs font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-spin" /> AI Generated
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Implement these suggestions to score higher against the ATS and recruiters.</p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((impact) => (
            <button
              key={impact}
              onClick={() => setFilterImpact(impact)}
              className={`px-3 py-1 text-xxs font-bold uppercase rounded-md transition duration-200 cursor-pointer ${
                filterImpact === impact
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {impact}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions Grid */}
      {filteredSuggestions.length > 0 ? (
        <div className="space-y-4">
          {filteredSuggestions.map((suggestion, idx) => (
            <div 
              key={idx} 
              className="glass-panel p-5 rounded-2xl flex items-start gap-4 transition-all duration-300 hover:border-slate-700/60"
            >
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex-shrink-0">
                {getCategoryIcon(suggestion.category)}
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200 font-sans">
                    {suggestion.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xxs font-bold border ${getImpactBadge(suggestion.impact)}`}>
                    {suggestion.impact} Impact
                  </span>
                </div>
                <p className="text-sm text-slate-350 leading-relaxed font-sans select-text">
                  {suggestion.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-10 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-white">No Issues Found!</h3>
            <p className="text-xs text-slate-400 mt-1">Excellent! No matching optimization recommendations in this criteria.</p>
          </div>
        </div>
      )}
    </div>
  );
}
