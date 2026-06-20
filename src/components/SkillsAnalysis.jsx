import React from 'react';
import { CheckCircle2, AlertCircle, Info, Sparkles, Check, HelpCircle } from 'lucide-react';

const SKILLS_CATEGORIES = {
  'Frontend Technologies': ['React', 'JavaScript', 'HTML', 'CSS', 'Tailwind'],
  'Backend & APIs': ['Node.js', 'Express.js', 'REST APIs', 'JWT', 'Java', 'Python'],
  'Databases & Tools': ['MongoDB', 'SQL', 'Git', 'GitHub', 'Docker', 'AWS']
};

export default function SkillsAnalysis({ skillsAnalysis }) {
  const { found = [], matched = [], missing = [] } = skillsAnalysis;

  // Helper to determine skill status relative to JD
  const getSkillStatus = (skill) => {
    const isMatched = matched.includes(skill);
    const isMissing = missing.includes(skill);
    const isFoundOnly = found.includes(skill) && !matched.includes(skill);

    if (isMatched) {
      return {
        label: 'Matched',
        colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      };
    }
    if (isMissing) {
      return {
        label: 'Required (Missing)',
        colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        icon: <AlertCircle className="w-4 h-4 text-rose-400 animate-pulse" />
      };
    }
    if (isFoundOnly) {
      return {
        label: 'Found (Unrequested)',
        colorClass: 'text-slate-400 bg-slate-800 border-slate-700',
        icon: <Info className="w-4 h-4 text-slate-400" />
      };
    }
    return {
      label: 'Not Present',
      colorClass: 'text-slate-600 bg-slate-950 border-slate-900',
      icon: <HelpCircle className="w-4 h-4 text-slate-750" />
    };
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xxs text-slate-400 uppercase tracking-widest block font-bold">Skills Matched</span>
            <span className="text-lg font-bold text-white mt-0.5">{matched.length} Skills</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xxs text-slate-400 uppercase tracking-widest block font-bold">Gaps Identified</span>
            <span className="text-lg font-bold text-white mt-0.5">{missing.length} Missing</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-750 flex items-center justify-center text-slate-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xxs text-slate-400 uppercase tracking-widest block font-bold">Total Extracted</span>
            <span className="text-lg font-bold text-white mt-0.5">{found.length} Total</span>
          </div>
        </div>
      </div>

      {/* Grid: Skill Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(SKILLS_CATEGORIES).map(([category, skills], idx) => {
          // Calculate category match stats
          const catFound = skills.filter(s => found.includes(s));
          const catMissing = skills.filter(s => missing.includes(s));
          const completionPct = Math.round((catFound.length / skills.length) * 100);

          return (
            <div key={idx} className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-semibold text-slate-200">{category}</h3>
                  <span className="text-xxs font-mono text-slate-400">{catFound.length}/{skills.length}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                    style={{ width: `${completionPct}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2.5 flex-1 py-2">
                {skills.map((skill, sIdx) => {
                  const status = getSkillStatus(skill);
                  return (
                    <div 
                      key={sIdx} 
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold ${status.colorClass}`}
                    >
                      <span className="text-slate-200">{skill}</span>
                      <div className="flex items-center gap-1.5" title={status.label}>
                        {status.icon}
                        <span className="text-xxs opacity-80 font-medium md:inline hidden">{status.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
