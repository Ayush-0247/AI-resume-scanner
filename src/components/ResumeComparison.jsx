import React, { useState } from 'react';
import { Columns, ArrowRight, Check, X, AlertCircle, HelpCircle, GitCompare } from 'lucide-react';

export default function ResumeComparison({ history = [] }) {
  const [scanAId, setScanAId] = useState('');
  const [scanBId, setScanBId] = useState('');

  const scanA = history.find(item => item.id === Number(scanAId));
  const scanB = history.find(item => item.id === Number(scanBId));

  const getScoreColorClass = (val) => {
    if (val >= 80) return 'text-emerald-400';
    if (val >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getDiffBadge = (valA, valB) => {
    const diff = valA - valB;
    if (diff > 0) return <span className="text-emerald-400 font-mono font-bold text-xxs">+{diff}</span>;
    if (diff < 0) return <span className="text-rose-400 font-mono font-bold text-xxs">{diff}</span>;
    return <span className="text-slate-500 font-mono font-bold text-xxs">0</span>;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
            <GitCompare className="w-8 h-8 text-violet-400" />
            Resume Comparison Tool
          </h1>
          <p className="text-gray-400 mt-1">Compare side-by-side scores and metrics of different resume versions.</p>
        </div>
      </div>

      {history.length >= 2 ? (
        <div className="space-y-6">
          {/* Selectors Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 items-center">
            
            <div className="md:col-span-2">
              <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Resume A</label>
              <select
                value={scanAId}
                onChange={(e) => setScanAId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass-input text-xs font-sans"
              >
                <option value="">-- Choose first report --</option>
                {history.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.fileName} ({item.score} pts) - {new Date(item.id).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center md:col-span-1">
              <ArrowRight className="w-5 h-5 text-slate-500 transform rotate-90 sm:rotate-0" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Resume B</label>
              <select
                value={scanBId}
                onChange={(e) => setScanBId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass-input text-xs font-sans"
              >
                <option value="">-- Choose second report --</option>
                {history.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.fileName} ({item.score} pts) - {new Date(item.id).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {scanA && scanB ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Report A */}
              <div className="glass-panel p-6 rounded-2xl space-y-6 relative overflow-hidden border border-slate-800/85">
                <div className="absolute top-0 right-0 w-24 h-24 glow-bg-violet opacity-5"></div>
                <div>
                  <span className="px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xxs font-bold uppercase tracking-wider">
                    Resume Version A
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2 truncate">{scanA.fileName}</h3>
                  <p className="text-xxs text-slate-500 mt-0.5">Scanned on {new Date(scanA.id).toLocaleString()}</p>
                </div>

                {/* Core Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center">
                    <span className="text-xxs text-slate-400 block font-semibold">ATS Score</span>
                    <span className={`text-2xl font-extrabold block mt-1 ${getScoreColorClass(scanA.score)}`}>
                      {scanA.score}
                    </span>
                    {getDiffBadge(scanA.score, scanB.score)}
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center">
                    <span className="text-xxs text-slate-400 block font-semibold">Completeness</span>
                    <span className="text-2xl font-extrabold block text-emerald-400 mt-1">
                      {scanA.result.completeness}%
                    </span>
                    {getDiffBadge(scanA.result.completeness, scanB.result.completeness)}
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center">
                    <span className="text-xxs text-slate-400 block font-semibold">Skills Match</span>
                    <span className="text-2xl font-extrabold block text-cyan-400 mt-1">
                      {scanA.result.skillsAnalysis.matched.length}
                    </span>
                    {getDiffBadge(scanA.result.skillsAnalysis.matched.length, scanB.result.skillsAnalysis.matched.length)}
                  </div>
                </div>

                {/* Skills Breakdown */}
                <div className="space-y-4 pt-4 border-t border-slate-850">
                  <div>
                    <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-2">Matched Skills ({scanA.result.skillsAnalysis.matched.length})</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {scanA.result.skillsAnalysis.matched.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/15 text-emerald-300 text-xxs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-2">Missing Skills ({scanA.result.skillsAnalysis.missing.length})</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {scanA.result.skillsAnalysis.missing.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-rose-500/5 border border-rose-500/15 text-rose-350 text-xxs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Report B */}
              <div className="glass-panel p-6 rounded-2xl space-y-6 relative overflow-hidden border border-slate-800/85">
                <div className="absolute top-0 right-0 w-24 h-24 glow-bg-cyan opacity-5"></div>
                <div>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xxs font-bold uppercase tracking-wider">
                    Resume Version B
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2 truncate">{scanB.fileName}</h3>
                  <p className="text-xxs text-slate-500 mt-0.5">Scanned on {new Date(scanB.id).toLocaleString()}</p>
                </div>

                {/* Core Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center">
                    <span className="text-xxs text-slate-400 block font-semibold">ATS Score</span>
                    <span className={`text-2xl font-extrabold block mt-1 ${getScoreColorClass(scanB.score)}`}>
                      {scanB.score}
                    </span>
                    {getDiffBadge(scanB.score, scanA.score)}
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center">
                    <span className="text-xxs text-slate-400 block font-semibold">Completeness</span>
                    <span className="text-2xl font-extrabold block text-emerald-400 mt-1">
                      {scanB.result.completeness}%
                    </span>
                    {getDiffBadge(scanB.result.completeness, scanA.result.completeness)}
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center">
                    <span className="text-xxs text-slate-400 block font-semibold">Skills Match</span>
                    <span className="text-2xl font-extrabold block text-cyan-400 mt-1">
                      {scanB.result.skillsAnalysis.matched.length}
                    </span>
                    {getDiffBadge(scanB.result.skillsAnalysis.matched.length, scanA.result.skillsAnalysis.matched.length)}
                  </div>
                </div>

                {/* Skills Breakdown */}
                <div className="space-y-4 pt-4 border-t border-slate-850">
                  <div>
                    <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-2">Matched Skills ({scanB.result.skillsAnalysis.matched.length})</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {scanB.result.skillsAnalysis.matched.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/15 text-emerald-300 text-xxs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-2">Missing Skills ({scanB.result.skillsAnalysis.missing.length})</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {scanB.result.skillsAnalysis.missing.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-rose-500/5 border border-rose-500/15 text-rose-350 text-xxs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-panel p-16 text-center text-slate-500 text-xs italic">
              Please choose two reports from the dropdown panels above to trigger comparative analysis.
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel p-16 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
            <Columns className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Compare Requires More Records</h3>
            <p className="text-sm text-slate-450 mt-1 max-w-[320px] mx-auto">
              Please perform at least two different resume scan analyses to unlock side-by-side comparator features.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
