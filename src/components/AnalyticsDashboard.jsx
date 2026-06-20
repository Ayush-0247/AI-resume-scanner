import React from 'react';
import { 
  Award, FileText, CheckCircle2, AlertTriangle, HelpCircle, 
  Download, Eye, RotateCcw, ShieldAlert, Sparkles, TrendingUp 
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function AnalyticsDashboard({ 
  result, 
  onReset, 
  onPreviewToggle, 
  onExport, 
  isExporting 
}) {
  const {
    score,
    completeness,
    sectionsDetected,
    sectionsMissing,
    skillsAnalysis,
    keywordMatching,
    formatting,
    recruiterInsights,
    isLocalSuggestions
  } = result;

  // Determine score colors
  const getScoreColorClass = (val) => {
    if (val >= 80) return 'text-emerald-400 stroke-emerald-400';
    if (val >= 60) return 'text-amber-400 stroke-amber-400';
    return 'text-rose-400 stroke-rose-400';
  };

  const getScoreBgClass = (val) => {
    if (val >= 80) return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300';
    if (val >= 60) return 'bg-amber-500/10 border-amber-500/20 text-amber-300';
    return 'bg-rose-500/10 border-rose-500/20 text-rose-300';
  };

  // Setup Radar Chart Data based on matching densities
  const allSectionsCount = 6;
  const sectionsMatchPercentage = Math.round((sectionsDetected.length / allSectionsCount) * 100);
  
  const totalSkillsCount = (skillsAnalysis.matched.length + skillsAnalysis.missing.length) || 1;
  const skillsMatchPercentage = Math.round((skillsAnalysis.matched.length / totalSkillsCount) * 100);

  const totalKeywordsCount = (keywordMatching.matched.length + keywordMatching.missing.length) || 1;
  const keywordsMatchPercentage = Math.round((keywordMatching.matched.length / totalKeywordsCount) * 100);

  const formattingScore = Math.round(
    (formatting.quantifiedCount >= 3 ? 35 : formatting.quantifiedCount > 0 ? 15 : 0) +
    (formatting.actionVerbsCount >= 4 ? 35 : formatting.actionVerbsCount > 0 ? 15 : 0) +
    (formatting.wordCount >= 200 && formatting.wordCount <= 800 ? 30 : 15)
  );

  const radarData = [
    { subject: 'Skills Match', A: skillsMatchPercentage, fullMark: 100 },
    { subject: 'Keywords', A: keywordsMatchPercentage, fullMark: 100 },
    { subject: 'Formatting', A: formattingScore, fullMark: 100 },
    { subject: 'Sections Found', A: sectionsMatchPercentage, fullMark: 100 },
    { subject: 'Completeness', A: completeness, fullMark: 100 },
  ];

  // SVG ring variables
  const radius = 52;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const standardSections = [
    'Summary', 'Skills', 'Education', 'Projects', 'Experience', 'Certifications'
  ];

  return (
    <div className="space-y-6">
      {/* Action Header Panel */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 no-print">
        <div className="flex items-center gap-2">
          {!isLocalSuggestions ? (
            <span className="px-2.5 py-1 rounded bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-pulse" /> Gemini AI Powered
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold">
              Heuristic Scanned
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onPreviewToggle}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <Eye className="w-4 h-4" /> Preview Extracted Text
          </button>
          
          <button
            onClick={onExport}
            disabled={isExporting}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> 
            {isExporting ? 'Generating PDF...' : 'Export Report PDF'}
          </button>

          <button
            onClick={onReset}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
            title="Scan new resume"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Score Radial Meter & Recruiter Assessment */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Score Radial Card */}
        <div className="md:col-span-4 glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 glow-bg-violet opacity-10 pointer-events-none"></div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">ATS Compatibility Score</h3>
          
          <div className="relative flex items-center justify-center w-40 h-40">
            {/* SVG circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                className="stroke-slate-800"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx="80"
                cy="80"
              />
              <circle
                className={`transition-all duration-1000 ease-out ${getScoreColorClass(score)}`}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                r={normalizedRadius}
                cx="80"
                cy="80"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-4xl font-extrabold tracking-tight ${getScoreColorClass(score)}`}>
                {score}
              </span>
              <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Scale 0-100</span>
            </div>
          </div>

          <div className={`mt-4 px-3 py-1 rounded-full text-xs font-semibold border ${getScoreBgClass(score)}`}>
            {score >= 80 ? 'Strong Match' : score >= 60 ? 'Moderate Match' : 'Weak Match'}
          </div>
        </div>

        {/* Recruiter Assessment Card */}
        <div className="md:col-span-8 glass-panel p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 glow-bg-cyan opacity-10 pointer-events-none"></div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              Recruiter Insights
            </h3>
            <p className="text-slate-200 text-sm leading-relaxed italic bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
              "{recruiterInsights}"
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850 text-center">
              <span className="text-xs text-slate-400 block">Skills Matched</span>
              <span className="text-xl font-bold text-cyan-400 mt-1 block">
                {skillsAnalysis.matched.length} <span className="text-xs text-slate-500">/ {totalSkillsCount}</span>
              </span>
            </div>
            <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850 text-center">
              <span className="text-xs text-slate-400 block">Keywords Matched</span>
              <span className="text-xl font-bold text-violet-400 mt-1 block">
                {keywordMatching.matched.length} <span className="text-xs text-slate-500">/ {totalKeywordsCount}</span>
              </span>
            </div>
            <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850 text-center">
              <span className="text-xs text-slate-400 block">Completeness</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">
                {completeness}%
              </span>
            </div>
            <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850 text-center">
              <span className="text-xs text-slate-400 block">Word Count</span>
              <span className="text-xl font-bold text-slate-200 mt-1 block">
                {formatting.wordCount}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Recharts Polar Analysis & Section completeness */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recharts Radar Polar Coverage */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              Compatibility Matrix
            </h3>
            <p className="text-xs text-slate-500 mb-4">Radar chart representing matching scores across primary categories.</p>
          </div>

          <div className="w-full h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: '#475569', fontSize: 9 }}
                />
                <Radar 
                  name="Match Score" 
                  dataKey="A" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.25} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section completion list */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Resume Section Audit
            </h3>
            <p className="text-xs text-slate-500 mb-4">Verifying existence of key sections required by scanning filters.</p>
          </div>

          <div className="space-y-3 my-4">
            {standardSections.map((section, idx) => {
              const detected = sectionsDetected.includes(section);
              return (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold ${
                    detected 
                      ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-300' 
                      : 'bg-rose-500/5 border-rose-500/10 text-rose-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${detected ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`}></span>
                    {section}
                  </span>
                  <div className="flex items-center gap-1">
                    {detected ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>Detected</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        <span>Missing</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-xxs text-slate-500 flex items-start gap-1 bg-slate-900/30 p-2.5 rounded-lg border border-slate-850">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p>
              Many automated ATS parsers expect standard section headings. Custom titles like "Stuff I did" instead of "Experience" may lead to parsing failure.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
