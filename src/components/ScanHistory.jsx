import React from 'react';
import { 
  Calendar, Trash2, Award, ArrowUpRight, BarChart3, 
  Trash, ChevronRight, Sparkles, CheckCircle2, History 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

export default function ScanHistory({ 
  history = [], 
  onLoadScan, 
  onDeleteScan, 
  onClearHistory 
}) {
  
  // Format history data for Recharts line chart
  const chartData = [...history]
    .reverse() // Chronological order
    .map((item, idx) => ({
      name: `Scan #${idx + 1}`,
      score: item.score,
      date: new Date(item.id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }));

  const handleClearConfirm = () => {
    if (window.confirm("Are you sure you want to delete all historical scan records? This action cannot be undone.")) {
      onClearHistory();
    }
  };

  const getScoreColorClass = (val) => {
    if (val >= 80) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
    if (val >= 60) return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/20 bg-rose-500/10';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
            <History className="w-8 h-8 text-violet-400" />
            Scan Analytics & History
          </h1>
          <p className="text-gray-400 mt-1">Track score trends over time and manage previous scan records.</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClearConfirm}
            className="px-4 py-2 bg-rose-950/30 hover:bg-rose-900/30 text-rose-350 hover:text-rose-250 text-xs font-semibold rounded-lg border border-rose-900/30 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Trash className="w-3.5 h-3.5" /> Clear All History
          </button>
        )}
      </div>

      {history.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Trend Chart Card */}
          <div className="lg:col-span-8 glass-panel p-6 rounded-2xl flex flex-col justify-between h-[360px]">
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-cyan-400" /> Score Progression Trend
              </h2>
              <p className="text-xs text-slate-500 mb-4">Historical progression indicating ATS optimization gains.</p>
            </div>
            
            <div className="w-full h-[240px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#475569" 
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <YAxis 
                    stroke="#475569" 
                    domain={[0, 100]}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      color: '#f3f4f6',
                      fontSize: '11px'
                    }}
                  />
                  <ReferenceLine y={80} stroke="rgba(16, 185, 129, 0.3)" strokeDasharray="3 3" />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    activeDot={{ r: 6, stroke: '#c4b5fd', strokeWidth: 2 }}
                    dot={{ fill: '#8b5cf6', strokeWidth: 1, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* List Card */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-2xl flex flex-col justify-between h-[360px] overflow-hidden">
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Saved Reports ({history.length})</h2>
            </div>
            
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3 bg-slate-900/40 hover:bg-slate-900/70 border border-slate-850 hover:border-slate-800 rounded-xl flex items-center justify-between gap-3 group transition"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-slate-200 block truncate" title={item.fileName}>
                      {item.fileName}
                    </span>
                    <span className="text-xxs text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.id).toLocaleDateString()} at {new Date(item.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getScoreColorClass(item.score)}`}>
                      {item.score}
                    </span>
                    <button
                      onClick={() => onLoadScan(item.result, item.fileName)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-violet-600 text-slate-400 hover:text-white transition cursor-pointer"
                      title="Load Scan Details"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteScan(item.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition cursor-pointer opacity-0 group-hover:opacity-100"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="glass-panel p-16 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
            <History className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">No Scan History Yet</h3>
            <p className="text-sm text-slate-450 mt-1 max-w-[320px]">
              Complete your first resume check to save scans and track your compatibility index progression.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
