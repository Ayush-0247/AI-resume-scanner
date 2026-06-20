import React, { useState } from 'react';
import { Eye, EyeOff, Key, Save, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function SettingsModal({ apiKey, onSaveKey, onClose }) {
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, msg: string }

  const handleSave = () => {
    onSaveKey(keyInput.trim());
    if (onClose) onClose();
  };

  const handleTestConnection = async () => {
    if (!keyInput.trim()) {
      setTestResult({ success: false, msg: 'API Key cannot be blank.' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const genAI = new GoogleGenerativeAI(keyInput.trim());
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent("Respond with only the letters 'OK' to test connectivity.");
      const text = result.response.text().trim();
      
      if (text.includes('OK')) {
        setTestResult({ success: true, msg: 'Connection verified! Your API key is valid.' });
      } else {
        setTestResult({ success: true, msg: `Connected, but received unexpected response: "${text}"` });
      }
    } catch (error) {
      console.error(error);
      setTestResult({ 
        success: false, 
        msg: error.message || 'Verification failed. Please check the key and your network connectivity.' 
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-2xl overflow-hidden animate-scale-in border border-slate-700/80 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-violet-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Configure AI Settings</h3>
            <p className="text-xs text-slate-400">Enable advanced Gemini LLM insights.</p>
          </div>
        </div>

        {/* Input area */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Google Gemini API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full pl-3 pr-10 py-2 rounded-lg glass-input text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-350 transition"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xxs text-slate-500">
              Your API key is stored locally in your browser's `localStorage` and never leaves your computer.
            </p>
          </div>

          <div className="text-xxs text-slate-400 bg-slate-900/40 p-3 rounded-lg border border-slate-800/60 leading-relaxed">
            <p>
              💡 **Don't have a key?** You can get a free developer key at the [Google AI Studio](https://aistudio.google.com/) portal.
            </p>
            <p className="mt-1">
              If no API key is specified, the application falls back gracefully to its offline heuristic matching engine.
            </p>
          </div>

          {/* Test results banner */}
          {testResult && (
            <div className={`p-3 rounded-lg border text-xxs font-semibold flex items-start gap-2 ${
              testResult.success 
                ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-300' 
                : 'bg-rose-500/5 border-rose-500/10 text-rose-350'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <span>{testResult.msg}</span>
            </div>
          )}
        </div>

        {/* Buttons footer */}
        <div className="flex gap-3 justify-end pt-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleTestConnection}
            disabled={testing || !keyInput.trim()}
            className="px-4 py-2 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-300 hover:text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition disabled:opacity-40"
          >
            {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
            Test Connection
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition"
          >
            <Save className="w-3.5 h-3.5" /> Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
