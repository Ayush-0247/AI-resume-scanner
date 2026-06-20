import React, { useState } from 'react';
import { Check, X, Search, BarChart3, AlertCircle } from 'lucide-react';

export default function KeywordMatcher({ keywordMatching }) {
  const { matched = [], missing = [], density = [] } = keywordMatching;
  const [filterQuery, setFilterQuery] = useState('');

  const filteredMatched = matched.filter(kw => 
    kw.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const filteredMissing = missing.filter(kw => 
    kw.toLowerCase().includes(filterQuery.toLowerCase())
  );

  // Density category scoring helper
  const getDensityStatus = (pct) => {
    if (pct === 0) return { label: 'Absent', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', bar: 'bg-rose-500' };
    if (pct > 4.0) return { label: 'High (Stuffing Risk)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', bar: 'bg-amber-500' };
    if (pct >= 1.0 && pct <= 3.5) return { label: 'Optimal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', bar: 'bg-emerald-500' };
    return { label: 'Low Presence', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', bar: 'bg-cyan-500' };
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
        <div>
          <h2 className="text-lg font-semibold text-white">Keyword Matching Deep-Dive</h2>
          <p className="text-xs text-slate-400 mt-1">Comparing technical keywords present in the JD against your resume.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter keywords..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg glass-input text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Keywords Matching Tags Card */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          
          {/* Matched Panel */}
          <div>
            <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
              <Check className="w-4 h-4" />
              Matched Keywords ({filteredMatched.length})
            </h3>
            {filteredMatched.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {filteredMatched.map((kw, i) => (
                  <span 
                    key={i} 
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {kw}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-xs italic">
                {filterQuery ? 'No matched keywords match search' : 'No matched keywords found.'}
              </p>
            )}
          </div>

          {/* Missing Panel */}
          <div>
            <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
              <X className="w-4 h-4" />
              Missing Keywords ({filteredMissing.length})
            </h3>
            {filteredMissing.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {filteredMissing.map((kw, i) => (
                  <span 
                    key={i} 
                    className="px-3 py-1.5 rounded-lg bg-rose-500/5 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                    {kw}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-xs italic">
                {filterQuery ? 'No missing keywords match search' : 'Excellent! No missing keywords found.'}
              </p>
            )}
          </div>

        </div>

        {/* Keyword Density Card */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Keyword Density Index
            </h3>
            <p className="text-xs text-slate-500 mb-4">Frequency and percentage profile of matched technical keywords.</p>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {density.length > 0 ? (
              density.map((item, i) => {
                const status = getDensityStatus(item.density);
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-200">{item.keyword}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono">{item.count} mentions</span>
                        <span className={`px-2 py-0.5 rounded text-xxs font-bold border ${status.color}`}>
                          {item.density}% - {status.label}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${status.bar}`}
                        style={{ width: `${Math.min(100, item.density * 20)}%` }} // Scale visualization for readability
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-8 text-slate-500">
                <AlertCircle className="w-8 h-8 text-slate-650 mb-2" />
                <p className="text-xs">Density analysis requires matching keywords.</p>
              </div>
            )}
          </div>

          <div className="text-xxs text-slate-500 flex items-start gap-1 bg-slate-900/30 p-2.5 rounded-lg border border-slate-850 mt-4">
            <AlertCircle className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
            <p>
              Aim for a keyword density between **1.0% and 3.5%** for core technical skills. Stuffing keywords excessively (&gt; 4%) is penalized by modern ATS ranking models.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
