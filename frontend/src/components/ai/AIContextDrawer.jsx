import React, { useState, useEffect } from 'react';
import { queryAI, validateAIAction, buildContextEnvelope } from '../../services/aiClient';

export default function AIContextDrawer({
  isOpen,
  onClose,
  contextData = {},
  initialQuestion = '',
  onApplyAction = null
}) {
  const [question, setQuestion] = useState(initialQuestion);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [activeTab, setActiveTab] = useState('answer'); // 'answer' | 'context' | 'sources' | 'actions'
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    if (initialQuestion) {
      setQuestion(initialQuestion);
    }
  }, [initialQuestion]);

  if (!isOpen) return null;

  const handleAsk = async (e) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setResponse(null);

    const envelope = buildContextEnvelope(contextData);
    const res = await queryAI({
      question,
      taskType: 'chat',
      context: envelope,
      providerOverride: useMock ? 'mock' : null
    });

    setResponse(res);
    setLoading(false);
  };

  const handleExecuteAction = async (action) => {
    const validated = await validateAIAction(action);
    if (validated.validated) {
      if (onApplyAction) {
        onApplyAction(validated);
      } else {
        alert(`Action '${validated.action_type}' validated and approved!`);
      }
    } else {
      alert(`Action validation failed: ${validated.validation_error}`);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-slate-900 border-l border-cyan-500/30 shadow-2xl flex flex-col text-slate-100 font-sans">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="text-lg font-bold tracking-wide text-cyan-400">QuantumLearning AI Intelligence</h2>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
        >
          ✕
        </button>
      </div>

      {/* Context Badge */}
      <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs flex justify-between items-center text-slate-400">
        <span>Active Context: <strong className="text-cyan-300">{contextData.page || 'General'}</strong></span>
        <label className="flex items-center space-x-1 cursor-pointer">
          <input
            type="checkbox"
            checked={useMock}
            onChange={(e) => setUseMock(e.target.checked)}
            className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
          />
          <span>Test with Mock Provider</span>
        </label>
      </div>

      {/* Main Response Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-cyan-400">Analyzing quantum application state...</p>
          </div>
        )}

        {!loading && !response && (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <p className="text-sm font-semibold">Ask any question about quantum computing, circuits, errors, or results.</p>
            <p className="text-xs text-slate-500">The AI intelligence layer automatically inspects the active application context.</p>
          </div>
        )}

        {!loading && response && (
          <div className="space-y-4">
            {/* Status Header */}
            <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded bg-slate-800/80 border border-slate-700">
              <span>Intent: <strong className="text-cyan-400">{response.intent || 'explain_concept'}</strong></span>
              <span className={`px-2 py-0.5 rounded font-mono ${
                response.status === 'llm_not_configured' ? 'bg-amber-900/50 text-amber-300 border border-amber-700/50' :
                response.status === 'mock_response' ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-700/50' :
                'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50'
              }`}>
                {response.status}
              </span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('answer')}
                className={`px-3 py-2 border-b-2 font-medium transition ${activeTab === 'answer' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                Response
              </button>
              <button
                onClick={() => setActiveTab('sources')}
                className={`px-3 py-2 border-b-2 font-medium transition ${activeTab === 'sources' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                RAG Sources ({response.sources ? response.sources.length : 0})
              </button>
              <button
                onClick={() => setActiveTab('actions')}
                className={`px-3 py-2 border-b-2 font-medium transition ${activeTab === 'actions' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                Actions ({response.actions ? response.actions.length : 0})
              </button>
            </div>

            {/* Tab: Answer */}
            {activeTab === 'answer' && (
              <div className="space-y-3 text-sm leading-relaxed">
                {response.status === 'llm_not_configured' ? (
                  <div className="p-3 bg-amber-950/40 border border-amber-700/40 rounded text-amber-200 space-y-2 text-xs">
                    <p className="font-semibold text-amber-300">LLM Provider Unconfigured</p>
                    <p>Application context extracted and intent classified. To enable generative natural language reasoning, configure an <code>OPENAI_API_KEY</code> environment variable.</p>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded text-slate-200 whitespace-pre-wrap">
                    {response.answer}
                  </div>
                )}

                {response.key_points && response.key_points.length > 0 && (
                  <div className="p-3 bg-slate-900/90 border border-slate-800 rounded space-y-1">
                    <p className="text-xs font-bold text-cyan-400">Key Context Insights:</p>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                      {response.key_points.map((pt, idx) => (
                        <li key={idx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Sources */}
            {activeTab === 'sources' && (
              <div className="space-y-2 text-xs">
                {(!response.sources || response.sources.length === 0) ? (
                  <p className="text-slate-500">No RAG knowledge sources retrieved.</p>
                ) : (
                  response.sources.map((src, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-950/80 border border-slate-800 rounded space-y-1">
                      <p className="font-bold text-cyan-300">{src.title || src.document_id}</p>
                      <p className="text-slate-400 text-[11px] truncate">Path: {src.source_url || src.document_id}</p>
                      {src.content && <p className="text-slate-300 text-xs italic bg-slate-900 p-1.5 rounded">{src.content}</p>}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Actions */}
            {activeTab === 'actions' && (
              <div className="space-y-2 text-xs">
                {(!response.actions || response.actions.length === 0) ? (
                  <p className="text-slate-500">No application actions proposed.</p>
                ) : (
                  response.actions.map((act, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded flex justify-between items-center">
                      <div>
                        <p className="font-bold text-emerald-400">{act.action_type}</p>
                        <p className="text-slate-400 text-[11px]">{act.reason}</p>
                      </div>
                      <button
                        onClick={() => handleExecuteAction(act)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs transition"
                      >
                        Execute
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Footer */}
      <form onSubmit={handleAsk} className="p-4 border-t border-slate-800 bg-slate-950 flex items-center space-x-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask Quantum AI assistant..."
          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-100 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm font-semibold rounded transition"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
