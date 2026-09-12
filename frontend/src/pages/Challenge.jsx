import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submitChallenge } from '../services/learningApi';

export default function Challenge() {
  const { challengeId } = useParams();
  const navigate = useNavigate();

  const [numQubits, setNumQubits] = useState(2);
  const [operations, setOperations] = useState([
    { gate: 'H', qubits: [0] },
    { gate: 'CNOT', qubits: [0, 1] }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleAddGate = (gateName) => {
    if (gateName === 'CNOT') {
      setOperations(prev => [...prev, { gate: 'CNOT', qubits: [0, 1] }]);
    } else {
      setOperations(prev => [...prev, { gate: gateName, qubits: [0] }]);
    }
  };

  const handleRemoveGate = (idx) => {
    setOperations(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitChallenge = async () => {
    setSubmitting(true);
    const res = await submitChallenge(challengeId || 'ex-3-1-1', numQubits, operations);
    setResult(res);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <button onClick={() => navigate('/learning')} className="text-xs text-slate-400 hover:text-cyan-400 font-medium">
          ← Back to Curriculum
        </button>
        <span className="text-xs font-mono font-bold text-emerald-400 px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-800/60">
          INTERACTIVE QUANTUM CHALLENGE
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-white">Challenge: Construct Target State</h1>
        <p className="text-xs text-slate-400 mt-1">
          Build a circuit on {numQubits} qubits that transforms |00⟩ into the target state. The backend quantum engine will simulate your Q-AST and evaluate physical metrics.
        </p>
      </div>

      {/* Gate Controls */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Available Gates:</p>
        <div className="flex flex-wrap gap-2">
          {['H', 'X', 'Y', 'Z', 'S', 'T', 'CNOT', 'MEASURE'].map((g) => (
            <button
              key={g}
              onClick={() => handleAddGate(g)}
              className="px-3 py-1.5 bg-slate-950 hover:bg-cyan-950 text-cyan-300 border border-slate-800 font-mono text-xs font-bold rounded transition"
            >
              + {g}
            </button>
          ))}
        </div>
      </div>

      {/* Active Operations List */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <h3 className="text-sm font-bold text-slate-200">Active Circuit Sequence ({operations.length} operations)</h3>
        {operations.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4">No gates added yet. Click gates above to build your circuit.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {operations.map((op, idx) => (
              <div key={idx} className="flex items-center space-x-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-slate-200">
                <span>{op.gate} q[{op.qubits.join(',')}]</span>
                <button onClick={() => handleRemoveGate(idx)} className="text-red-400 hover:text-red-300 font-bold ml-1">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={() => navigate('/lab', { state: { circuit: { num_qubits: numQubits, gates: operations } } })}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded"
        >
          Open Circuit in Quantum Lab
        </button>

        <button
          onClick={handleSubmitChallenge}
          disabled={submitting}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition"
        >
          {submitting ? 'Simulating on Backend...' : 'Submit & Evaluate Challenge'}
        </button>
      </div>

      {/* Evaluation Results */}
      {result && (
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <h3 className={`text-base font-bold ${result.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
              {result.passed ? 'Challenge Passed!' : 'Challenge Needs Improvement'}
            </h3>
            <span className="text-xs font-mono font-bold text-slate-300">
              Score: {Math.round(result.score * 100)}%
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{result.feedback}</p>

          {result.empirical_metrics && (
            <div className="p-3 bg-slate-950 rounded font-mono text-[11px] text-cyan-300 space-y-1">
              <p className="font-bold">Empirical Execution Metrics (SimulationService Ground Truth):</p>
              {Object.entries(result.empirical_metrics).map(([k, v]) => (
                <p key={k}>{k}: {JSON.stringify(v)}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
