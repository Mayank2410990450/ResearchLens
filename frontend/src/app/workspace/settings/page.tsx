'use client';

import * as React from 'react';
import {
  Settings,
  Cpu,
  Database,
  ShieldCheck,
  Key,
  Sliders,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

export default function SettingsPage() {
  const { showToast } = useToast();

  const [llmProvider, setLlmProvider] = React.useState('openai');
  const [modelName, setModelName] = React.useState('gpt-4o-mini');
  const [apiKey, setApiKey] = React.useState('sk-proj-••••••••••••••••••••••••');
  const [topK, setTopK] = React.useState(10);
  const [hybridAlpha, setHybridAlpha] = React.useState(0.6);
  const [rerankerEnabled, setRerankerEnabled] = React.useState(true);
  const [injectionShield, setInjectionShield] = React.useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'LLM provider parameters and retrieval hyperparameters updated.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="violet">System Architecture Configuration</Badge>
          <span className="text-xs font-mono text-slate-400">Environment Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Workspace Settings & Model Providers
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure multi-provider LLM gateways, dense embedding models, and hybrid retrieval hyperparameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: LLM Provider Configuration */}
        <Card variant="glass" className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Cpu className="w-4 h-4 text-violet-400" />
            <CardTitle className="text-base">LLM Model Provider</CardTitle>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                Active Inference Provider:
              </label>
              <select
                value={llmProvider}
                onChange={(e) => setLlmProvider(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                <option value="google">Google Gemini (Gemini 1.5 Pro / Flash)</option>
                <option value="groq">Groq LPU (Llama 3.1 70B Fast)</option>
                <option value="local">Local Offline (Ollama / vLLM)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                Model Identifier:
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">
              API Access Key:
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
            />
          </div>
        </Card>

        {/* Section 2: Hybrid Retrieval & Reranker Hyperparameters */}
        <Card variant="glass" className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <CardTitle className="text-base">Retrieval & Reranking Hyperparameters</CardTitle>
          </div>

          <div className="space-y-4 text-xs">
            {/* Top-K Chunks */}
            <div>
              <div className="flex justify-between font-mono mb-1">
                <span className="text-slate-400">Top-K Candidate Chunks:</span>
                <span className="text-violet-400 font-bold">{topK} Chunks</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                Number of chunks pooled from dual dense & sparse stages before reranking.
              </span>
            </div>

            {/* Hybrid Alpha */}
            <div>
              <div className="flex justify-between font-mono mb-1">
                <span className="text-slate-400">Hybrid Alpha Weighting (Dense vs Sparse):</span>
                <span className="text-cyan-400 font-bold">{hybridAlpha.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={hybridAlpha}
                onChange={(e) => setHybridAlpha(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                <span>0.0 (Pure BM25 Sparse)</span>
                <span>0.5 (Balanced RRF)</span>
                <span>1.0 (Pure Cosine Dense)</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    Cross-Encoder Reranker
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ms-marco-MiniLM-L-6-v2 neural scoring
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={rerankerEnabled}
                  onChange={(e) => setRerankerEnabled(e.target.checked)}
                  className="w-4 h-4 text-violet-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    Prompt Injection Shield
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    XML nonce isolation & sanitization
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={injectionShield}
                  onChange={(e) => setInjectionShield(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </label>
            </div>
          </div>
        </Card>

        {/* Save Actions */}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" className="gap-2 shadow-glow">
            <Save className="w-4 h-4" />
            <span>Save System Configuration</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
