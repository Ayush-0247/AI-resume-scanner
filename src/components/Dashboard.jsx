import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Sparkles, HelpCircle, AlertCircle, FileCode } from 'lucide-react';
import { parsePdf, parseTxt } from '../utils/pdfParser';

const SAMPLE_JDS = [
  {
    title: "React Developer",
    text: "We are seeking a React Developer with strong proficiency in JavaScript, HTML, CSS, and Tailwind CSS. The ideal candidate has experience building responsive web interfaces, managing local state, and integrating with REST APIs. Familiarity with Git, GitHub, JWT, and SQL is preferred. Experience with Docker or AWS is a major plus."
  },
  {
    title: "Full Stack Engineer",
    text: "Looking for a Full Stack Engineer to design and implement robust APIs and frontend features. Must have excellent knowledge of React, Node.js, Express.js, and MongoDB. You should be familiar with Git, GitHub, building REST APIs, secure authentication using JWT, and database queries. Containerization using Docker and hosting on AWS is highly desirable."
  },
  {
    title: "Backend Engineer (Python/Java)",
    text: "We are hiring a Backend Engineer to build scalable microservices. Core skills required include Java or Python, REST APIs, SQL databases, Git, and Docker. Experience designing robust system architectures and deploying services on AWS Cloud is mandatory. Experience with React or frontend CSS styling is optional but helpful."
  }
];

export default function Dashboard({ onAnalysisComplete, apiKey }) {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [jd, setJd] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (selectedFile) => {
    setError('');
    const extension = selectedFile.name.split('.').pop().toLowerCase();
    
    if (extension !== 'pdf' && extension !== 'txt') {
      setError('Invalid file format. Please upload only PDF or TXT files.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5MB.');
      return;
    }

    setFile(selectedFile);
    setLoading(true);
    try {
      let parsedText = '';
      if (extension === 'pdf') {
        parsedText = await parsePdf(selectedFile);
      } else {
        parsedText = await parseTxt(selectedFile);
      }
      setExtractedText(parsedText);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error extracting text from file.');
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setExtractedText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleApplySampleJd = (sample) => {
    setJd(sample.text);
  };

  const triggerAnalyze = () => {
    if (!extractedText) {
      setError('Please upload a resume first.');
      return;
    }
    if (!jd.trim()) {
      setError('Please paste a job description.');
      return;
    }
    onAnalysisComplete(extractedText, jd, file.name);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            Scan & Analyze Resume
          </h1>
          <p className="text-gray-400 mt-1">Upload your resume and paste the job description to test compatibility.</p>
        </div>
      </div>

      {error && (
        <div className="glass-panel border-red-500/30 bg-red-500/10 p-4 rounded-xl flex items-center gap-3 text-red-200">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Upload Resume */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <FileCode className="w-5 h-5 text-violet-400" />
              Step 1: Upload Resume
            </h2>
            
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[220px] ${
                dragActive 
                  ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/5' 
                  : 'border-slate-700 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-900/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                disabled={loading}
              />
              
              {loading ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500"></div>
                  <p className="text-sm text-gray-400">Extracting resume text...</p>
                </div>
              ) : file ? (
                <div className="flex flex-col items-center space-y-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 glow-violet">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-semibold text-white truncate max-w-[280px]">{file.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200">Drag & drop your resume</p>
                    <p className="text-xs text-slate-400 mt-1">Supports PDF, TXT (Max 5MB)</p>
                  </div>
                  <span className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-700 transition">
                    Browse File
                  </span>
                </div>
              )}
            </div>

            {file && !loading && (
              <div className="mt-4 flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-slate-300 font-mono">Text successfully parsed</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(); }}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-400 flex items-start gap-2 bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
            <HelpCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
            <p>
              Your document data stays strictly in your browser. All parsing occurs client-side using PDF.js text layer mapping.
            </p>
          </div>
        </div>

        {/* Right Column: Job Description Input */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Step 2: Job Description
              </h2>
              <span className="text-xs text-slate-400 font-mono">{jd.length} chars</span>
            </div>

            <textarea
              className="w-full h-[220px] rounded-xl glass-input p-4 text-slate-200 text-sm font-sans placeholder-slate-500 resize-none"
              placeholder="Paste the job description or requirements here..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />

            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Quick Sample Templates:</p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_JDS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplySampleJd(sample)}
                    className="px-3 py-1.5 bg-slate-900/70 border border-slate-800 hover:border-violet-500 hover:bg-slate-800 text-xs font-medium rounded-lg text-slate-300 hover:text-white transition duration-200"
                  >
                    {sample.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={triggerAnalyze}
            disabled={loading || !file || !jd.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold rounded-xl transition duration-300 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group cursor-pointer shadow-lg shadow-violet-950/20"
          >
            <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" />
            Analyze Compatibility
          </button>
        </div>
      </div>
    </div>
  );
}
