import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, GitCompare, History, Settings, Sun, Moon, 
  Menu, X, Sparkles, AlertCircle, FileText, FileCode 
} from 'lucide-react';

// Hooks
import { useLocalStorage } from './hooks/useLocalStorage';

// Utilities
import { analyzeATS } from './utils/atsEngine';
import { analyzeWithGemini } from './utils/gemini';
import { exportReportToPdf } from './utils/exportPdf';

// Components
import Dashboard from './components/Dashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import KeywordMatcher from './components/KeywordMatcher';
import SkillsAnalysis from './components/SkillsAnalysis';
import SuggestionsList from './components/SuggestionsList';
import ScanHistory from './components/ScanHistory';
import ResumeComparison from './components/ResumeComparison';
import PreviewResume from './components/PreviewResume';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'analysis', 'comparison', 'history'
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeFileName, setActiveFileName] = useState('');
  const [activeResumeText, setActiveResumeText] = useState('');
  
  // Modals / Overlays
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Persisted state hooks
  const [apiKey, setApiKey] = useLocalStorage('resumeiq_api_key', '');
  const [history, setHistory] = useLocalStorage('resumeiq_history', []);
  const [darkMode, setDarkMode] = useLocalStorage('resumeiq_dark_mode', true);

  // Apply dark mode theme to body
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Main triggers
  const handleAnalyze = async (resumeText, jdText, fileName) => {
    setIsAnalyzing(true);
    setErrorMessage('');
    setActiveResumeText(resumeText);
    setActiveFileName(fileName);
    
    try {
      let result;
      if (apiKey) {
        // Run advanced Gemini analysis
        result = await analyzeWithGemini(resumeText, jdText, apiKey);
        // Apply local keyword density calculation to Gemini response for consistency
        const localResultsForDensity = analyzeATS(resumeText, jdText);
        result.keywordMatching.density = localResultsForDensity.keywordMatching.density;
      } else {
        // Run standard heuristic rules engine
        result = analyzeATS(resumeText, jdText);
      }

      setAnalysisResult(result);
      
      // Save scan to local history
      const newScan = {
        id: Date.now(),
        fileName,
        score: result.score,
        result
      };
      setHistory([newScan, ...history]);
      
      // Move to analysis dashboard
      setActiveTab('analysis');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Verification / Analysis failed. Check credentials and retry.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadScan = (savedResult, fileName) => {
    setAnalysisResult(savedResult);
    setActiveFileName(fileName);
    setActiveResumeText(savedResult.formatting?.extractedText || ''); // fallback
    setActiveTab('analysis');
  };

  const handleDeleteScan = (id) => {
    setHistory(history.filter(item => item.id !== id));
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await exportReportToPdf('report-container', `ResumeIQ_Report_${activeFileName.replace(/\.[^/.]+$/, "")}.pdf`);
    } catch (err) {
      alert("Error generating PDF document. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Sub-tabs for the report container
  const [reportSubTab, setReportSubTab] = useState('overview'); // 'overview', 'skills', 'keywords', 'suggestions'

  return (
    <div className="min-h-screen bg-dark-dark text-slate-100 flex font-sans grid-bg relative">
      
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-10 left-10 w-96 h-96 glow-bg-violet opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 glow-bg-cyan opacity-20 pointer-events-none"></div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950/80 border-r border-slate-900/60 backdrop-blur-xl transform transition-transform duration-300 md:translate-x-0 flex flex-col justify-between ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center font-extrabold text-white text-lg tracking-tight glow-violet shadow-lg shadow-violet-500/20">
                IQ
              </div>
              <div>
                <span className="font-bold text-white text-base tracking-wide block">ResumeIQ</span>
                <span className="text-xxs font-bold text-cyan-400 uppercase tracking-widest block -mt-0.5">ATS Analyzer</span>
              </div>
            </div>
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/25 text-violet-300'
                  : 'text-slate-450 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Scanner
            </button>

            {analysisResult && (
              <button
                onClick={() => { setActiveTab('analysis'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  activeTab === 'analysis'
                    ? 'bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/25 text-violet-300'
                    : 'text-slate-450 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent'
                }`}
              >
                <FileText className="w-4 h-4" />
                Report Analysis
              </button>
            )}

            <button
              onClick={() => { setActiveTab('comparison'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'comparison'
                  ? 'bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/25 text-violet-300'
                  : 'text-slate-450 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              Compare Versions
            </button>

            <button
              onClick={() => { setActiveTab('history'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/25 text-violet-300'
                  : 'text-slate-450 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent'
              }`}
            >
              <History className="w-4 h-4" />
              History & Trends
            </button>
          </nav>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-900/60 space-y-3">
          {/* Key toggle */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-350 hover:text-white border border-slate-800/80 hover:border-slate-700/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Settings className="w-3.5 h-3.5" />
            AI Key Settings
          </button>

          {/* Theme & Meta */}
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>v1.0.0 (Beta)</span>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition"
              title="Toggle theme color"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        
        {/* Mobile Header Bar */}
        <header className="md:hidden p-4 border-b border-slate-900/60 bg-slate-950/70 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center font-extrabold text-white text-base">
              IQ
            </div>
            <span className="font-bold text-white text-sm">ResumeIQ</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-slate-900 rounded-lg text-slate-450 hover:text-slate-250 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Content Container */}
        <main className="p-6 md:p-10 max-w-6xl w-full mx-auto flex-1 pb-24">
          
          {/* Global Analyzer Loading Spinner Overlay */}
          {isAnalyzing && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-dark-dark/85 backdrop-blur-md space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin animate-reverse"></div>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-white text-lg">Analyzing Resume Compatibility</h3>
                <p className="text-xs text-slate-450 mt-1 max-w-[280px] leading-relaxed">
                  {apiKey 
                    ? "Consulting Gemini AI API for specialized recruiter insights..." 
                    : "Executing client-side NLP metrics and semantic calculations..."}
                </p>
              </div>
            </div>
          )}

          {/* Scaffolding router wrapper */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              onAnalysisComplete={handleAnalyze} 
              apiKey={apiKey}
            />
          )}

          {activeTab === 'analysis' && analysisResult && (
            <div className="space-y-6">
              
              {/* Report Header View */}
              <div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent truncate max-w-[500px]">
                  Analysis Report
                </h1>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  {activeFileName}
                </p>
              </div>

              {/* Sub navigation for Report tabs */}
              <div className="flex border-b border-slate-900/60 no-print">
                {[
                  { id: 'overview', label: 'Overview Metrics' },
                  { id: 'skills', label: 'Skills Gap' },
                  { id: 'keywords', label: 'Keywords Cloud' },
                  { id: 'suggestions', label: 'Action Checklist' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setReportSubTab(tab.id)}
                    className={`px-4 py-2 text-xs font-semibold border-b-2 transition duration-200 cursor-pointer ${
                      reportSubTab === tab.id
                        ? 'border-violet-500 text-violet-400 bg-violet-500/5'
                        : 'border-transparent text-slate-450 hover:text-slate-350 hover:bg-slate-950/30'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Printable container */}
              <div id="report-container" className="space-y-6 p-1.5">
                {reportSubTab === 'overview' && (
                  <AnalyticsDashboard 
                    result={analysisResult} 
                    onReset={() => setActiveTab('dashboard')}
                    onPreviewToggle={() => setShowPreviewModal(true)}
                    onExport={handleExportPdf}
                    isExporting={isExporting}
                  />
                )}
                {reportSubTab === 'skills' && (
                  <SkillsAnalysis skillsAnalysis={analysisResult.skillsAnalysis} />
                )}
                {reportSubTab === 'keywords' && (
                  <KeywordMatcher keywordMatching={analysisResult.keywordMatching} />
                )}
                {reportSubTab === 'suggestions' && (
                  <SuggestionsList 
                    suggestions={analysisResult.suggestions} 
                    isLocalSuggestions={analysisResult.isLocalSuggestions}
                  />
                )}
              </div>

            </div>
          )}

          {activeTab === 'comparison' && (
            <ResumeComparison history={history} />
          )}

          {activeTab === 'history' && (
            <ScanHistory 
              history={history} 
              onLoadScan={handleLoadScan} 
              onDeleteScan={handleDeleteScan}
              onClearHistory={handleClearHistory}
            />
          )}

        </main>
      </div>

      {/* Extracted Text Preview Modal Overlay */}
      {showPreviewModal && (
        <PreviewResume 
          text={activeResumeText} 
          fileName={activeFileName} 
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      {/* Settings Modal Overlay */}
      {showSettingsModal && (
        <SettingsModal 
          apiKey={apiKey} 
          onSaveKey={setApiKey} 
          onClose={() => setShowSettingsModal(false)}
        />
      )}

    </div>
  );
}
