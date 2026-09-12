import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CircuitBuilder from '../components/quantum/CircuitBuilder';
import BackendSelector from '../components/quantum/BackendSelector';
import ResultsPanel from '../components/visualization/ResultsPanel';
import QuantumCodeEditor from '../components/quantum/QuantumCodeEditor';
import GatePalette from '../components/quantum/GatePalette';
import RightInspector from '../components/quantum/RightInspector';
import AlgorithmModePanel from '../components/quantum/AlgorithmModePanel';
import ExperimentModePanel from '../components/quantum/ExperimentModePanel';
import AIContextDrawer from '../components/ai/AIContextDrawer';
import LevelSelector from '../components/learning/LevelSelector';
import { fetchLevel, setUserLevel } from '../services/learningApi';

export default function Lab() {
  const location = useLocation();

  // Mode Bar State: 'builder' | 'code' | 'algorithms' | 'experiment'
  const [activeMode, setActiveMode] = useState('builder');
  const [codeText, setCodeText] = useState('# Quantum Circuit Syntax\nqubits 2\nH q[0]\nCNOT q[0], q[1]\nM q[0]\n');
  const [codeError, setCodeError] = useState(null);

  // Circuit State
  const [numQubits, setNumQubits] = useState(2);
  const [visualGates, setVisualGates] = useState([]);
  const [selectedGate, setSelectedGate] = useState(null);
  const [interactionState, setInteractionState] = useState('idle');
  const [pendingControlQubit, setPendingControlQubit] = useState(null);
  const [selectedBackend, setSelectedBackend] = useState('custom_m1');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  // Undo / Redo History Stacks
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Simulation State
  const [userLevel, setUserLevelState] = useState('Beginner');
  const [simResult, setSimResult] = useState(null);
  const [parallelResults, setParallelResults] = useState(null);
  const [isStale, setIsStale] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isResultWorkspaceOpen, setIsResultWorkspaceOpen] = useState(false);
  const [parameterPrompt, setParameterPrompt] = useState(null);

  useEffect(() => {
    async function loadLvl() {
      const data = await fetchLevel();
      if (data?.level) setUserLevelState(data.level);
    }
    loadLvl();

    const handleLevelChanged = (e) => {
      if (e.detail?.level) setUserLevelState(e.detail.level);
    };
    window.addEventListener('learning:level_changed', handleLevelChanged);
    return () => window.removeEventListener('learning:level_changed', handleLevelChanged);
  }, []);

  // Helper to push history
  const pushStateToHistory = (newGates, newQubitCount = numQubits) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push({ gates: newGates, qubits: newQubitCount });
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setVisualGates(prev.gates);
      setNumQubits(prev.qubits);
      setHistoryIndex(historyIndex - 1);
      setIsStale(true);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setVisualGates(next.gates);
      setNumQubits(next.qubits);
      setHistoryIndex(historyIndex + 1);
      setIsStale(true);
    }
  };

  // Load preset if navigated from Learn or Experiments
  useEffect(() => {
    if (location.state && location.state.preset) {
      if (location.state.numQubits) {
        setNumQubits(location.state.numQubits);
      }
      setVisualGates(location.state.preset);
      pushStateToHistory(location.state.preset, location.state.numQubits || numQubits);
      setIsStale(true);
      window.history.replaceState({}, document.title);
    } else {
      pushStateToHistory([]);
    }
  }, [location]);

  // Drag & Drop Handlers
  const handleDragStart = (e, gateId) => {
    e.dataTransfer.setData('gate', gateId);
  };

  const handleDrop = (e, q, c) => {
    e.preventDefault();
    const gate = e.dataTransfer.getData('gate');
    if (!gate) return;

    let newGates = [];
    if (['CNOT', 'CZ', 'SWAP'].includes(gate)) {
      setInteractionState(`pending_${gate.toLowerCase()}_target`);
      setPendingControlQubit({ gate, qubit: q, col: c });
      return;
    } else if (gate === 'IF') {
      setInteractionState(`pending_if_target`);
      setPendingControlQubit({ gate, cbit: q, col: c });
      return;
    } else if (['RX', 'RY', 'RZ'].includes(gate)) {
      setParameterPrompt({ gate, qubit: q, col: c });
      return;
    } else {
      newGates = [...visualGates, { id: Math.random().toString(), gate, qubit: q, col: c }];
    }

    setVisualGates(newGates);
    pushStateToHistory(newGates);
    setIsStale(true);
  };

  const handleParameterSubmit = (thetaStr) => {
    if (!parameterPrompt) return;
    const theta = parseFloat(thetaStr);
    if (!isNaN(theta)) {
      const newGates = [...visualGates, {
        id: Math.random().toString(),
        gate: parameterPrompt.gate,
        qubit: parameterPrompt.qubit,
        col: parameterPrompt.col,
        parameters: { theta }
      }];
      setVisualGates(newGates);
      pushStateToHistory(newGates);
      setIsStale(true);
    }
    setParameterPrompt(null);
  };

  const handleTargetClick = (q, c) => {
    if (interactionState.startsWith('pending_') && pendingControlQubit) {
      let newGates = visualGates;
      if (pendingControlQubit.gate === 'IF') {
        const targetGateStr = prompt("Enter target gate for condition (e.g., X, H):", "X");
        if (targetGateStr) {
          newGates = [...visualGates, {
            id: Math.random().toString(),
            gate: 'IF',
            cbit: pendingControlQubit.cbit,
            targetQubit: q,
            targetGate: targetGateStr.toUpperCase(),
            col: c
          }];
        }
      } else if (q !== pendingControlQubit.qubit) {
        newGates = [...visualGates, {
          id: Math.random().toString(),
          gate: pendingControlQubit.gate,
          control: pendingControlQubit.qubit,
          target: q,
          col: c
        }];
      }
      setVisualGates(newGates);
      pushStateToHistory(newGates);
      setIsStale(true);
      setInteractionState('idle');
      setPendingControlQubit(null);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleSelectGate = (gate) => {
    setSelectedGate(gate);
  };

  const handleDeleteSelectedGate = (gateId) => {
    const updated = visualGates.filter(g => g.id !== gateId);
    setVisualGates(updated);
    pushStateToHistory(updated);
    setSelectedGate(null);
    setIsStale(true);
  };

  const handleUpdateGateParam = (gateId, theta) => {
    const updated = visualGates.map(g => g.id === gateId ? { ...g, parameters: { theta } } : g);
    setVisualGates(updated);
    pushStateToHistory(updated);
    setSelectedGate(prev => prev && prev.id === gateId ? { ...prev, parameters: { theta } } : prev);
    setIsStale(true);
  };

  const clearCircuit = () => {
    setVisualGates([]);
    pushStateToHistory([]);
    setSimResult(null);
    setSelectedGate(null);
    setIsStale(false);
    setError(null);
    setInteractionState('idle');
  };

  // API Call: Run simulation
  const runSimulation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sortedGates = [...visualGates].sort((a, b) => a.col - b.col);
      const operations = [];
      sortedGates.forEach(g => {
        if (['CNOT', 'CZ', 'SWAP'].includes(g.gate)) {
          operations.push({ type: 'gate', gate: g.gate, qubits: [g.control, g.target] });
        } else if (g.gate === 'M') {
          operations.push({ type: 'measure', qubits: [g.qubit], cbits: [g.qubit] });
        } else if (g.gate === 'Reset') {
          operations.push({ type: 'reset', qubits: [g.qubit] });
        } else if (g.gate === 'IF') {
          operations.push({
            type: 'conditional',
            cbit: g.cbit,
            value: 1,
            operation: { type: 'gate', gate: g.targetGate, qubits: [g.targetQubit] }
          });
        } else {
          const op = { type: 'gate', gate: g.gate, qubits: [g.qubit] };
          if (g.parameters) op.parameters = g.parameters;
          operations.push(op);
        }
      });

      const payload = {
        backend: selectedBackend,
        num_qubits: numQubits,
        num_cbits: numQubits,
        operations: operations
      };

      const res = await fetch('/api/simulation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error(`Failed to parse JSON response: ${text}`); }
      if (!res.ok) throw new Error(data.detail || 'Simulation failed');

      setSimResult(data);
      setIsStale(false);
      setIsResultWorkspaceOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Run parallel multi-backend simulation
  const runParallelSimulation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sortedGates = [...visualGates].sort((a, b) => a.col - b.col);
      const operations = [];
      sortedGates.forEach(g => {
        if (['CNOT', 'CZ', 'SWAP'].includes(g.gate)) {
          operations.push({ type: 'gate', gate: g.gate, qubits: [g.control, g.target] });
        } else if (g.gate === 'M') {
          operations.push({ type: 'measure', qubits: [g.qubit], cbits: [g.qubit] });
        } else if (g.gate === 'Reset') {
          operations.push({ type: 'reset', qubits: [g.qubit] });
        } else {
          operations.push({ type: 'gate', gate: g.gate, qubits: [g.qubit] });
        }
      });
      const payload = {
        num_qubits: numQubits,
        num_cbits: numQubits,
        operations,
        backends: ['custom_m1', 'qiskit_aer', 'pennylane', 'cirq']
      };
      const res = await fetch('/api/simulation/run_parallel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Parallel simulation failed');
      setParallelResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadAlgorithmTemplate = (algoId) => {
    let newQubits = 2;
    let gates = [];
    switch(algoId) {
      // ── Beginner Presets ──
      case 'superposition':
        newQubits = 1;
        gates = [
          { id: 'g1', gate: 'H', qubit: 0, col: 1 },
          { id: 'g2', gate: 'M', qubit: 0, col: 2 }
        ];
        break;
      case 'not_flip':
        newQubits = 1;
        gates = [
          { id: 'g1', gate: 'X', qubit: 0, col: 1 },
          { id: 'g2', gate: 'M', qubit: 0, col: 2 }
        ];
        break;
      case 'phase_flip':
        newQubits = 1;
        gates = [
          { id: 'g1', gate: 'H', qubit: 0, col: 1 },
          { id: 'g2', gate: 'Z', qubit: 0, col: 2 },
          { id: 'g3', gate: 'H', qubit: 0, col: 3 },
          { id: 'g4', gate: 'M', qubit: 0, col: 4 }
        ];
        break;
      case 'rotation_ry':
        newQubits = 1;
        gates = [
          { id: 'g1', gate: 'RY', qubit: 0, col: 1, parameters: { theta: 1.5708 } },
          { id: 'g2', gate: 'M', qubit: 0, col: 2 }
        ];
        break;

      // ── Intermediate Presets ──
      case 'bell':
        newQubits = 2;
        gates = [
          { id: 'g1', gate: 'H', qubit: 0, col: 1 },
          { id: 'g2', gate: 'CNOT', control: 0, target: 1, col: 2 },
          { id: 'g3', gate: 'M', qubit: 0, col: 3 },
          { id: 'g4', gate: 'M', qubit: 1, col: 3 }
        ];
        break;
      case 'ghz':
        newQubits = 3;
        gates = [
          { id: 'g1', gate: 'H', qubit: 0, col: 1 },
          { id: 'g2', gate: 'CNOT', control: 0, target: 1, col: 2 },
          { id: 'g3', gate: 'CNOT', control: 1, target: 2, col: 3 },
          { id: 'g4', gate: 'M', qubit: 0, col: 4 },
          { id: 'g5', gate: 'M', qubit: 1, col: 4 },
          { id: 'g6', gate: 'M', qubit: 2, col: 4 }
        ];
        break;
      case 'teleport':
        newQubits = 3;
        gates = [
          { id: 'g1', gate: 'H', qubit: 0, col: 1 },
          { id: 'g2', gate: 'H', qubit: 1, col: 1 },
          { id: 'g3', gate: 'CNOT', control: 1, target: 2, col: 2 },
          { id: 'g4', gate: 'CNOT', control: 0, target: 1, col: 3 },
          { id: 'g5', gate: 'H', qubit: 0, col: 4 },
          { id: 'g6', gate: 'M', qubit: 0, col: 5 },
          { id: 'g7', gate: 'M', qubit: 1, col: 5 },
          { id: 'g8', gate: 'CNOT', control: 1, target: 2, col: 6 },
          { id: 'g9', gate: 'CZ', control: 0, target: 2, col: 7 },
          { id: 'g10', gate: 'M', qubit: 2, col: 8 }
        ];
        break;
      case 'deutsch':
        newQubits = 2;
        gates = [
          { id: 'g1', gate: 'X', qubit: 1, col: 1 },
          { id: 'g2', gate: 'H', qubit: 0, col: 2 },
          { id: 'g3', gate: 'H', qubit: 1, col: 2 },
          { id: 'g4', gate: 'CNOT', control: 0, target: 1, col: 3 },
          { id: 'g5', gate: 'H', qubit: 0, col: 4 },
          { id: 'g6', gate: 'M', qubit: 0, col: 5 }
        ];
        break;
      case 'bv':
        newQubits = 3;
        gates = [
          { id: 'g1', gate: 'X', qubit: 2, col: 1 },
          { id: 'g2', gate: 'H', qubit: 0, col: 2 },
          { id: 'g3', gate: 'H', qubit: 1, col: 2 },
          { id: 'g4', gate: 'H', qubit: 2, col: 2 },
          { id: 'g5', gate: 'CNOT', control: 0, target: 2, col: 3 },
          { id: 'g6', gate: 'CNOT', control: 1, target: 2, col: 4 },
          { id: 'g7', gate: 'H', qubit: 0, col: 5 },
          { id: 'g8', gate: 'H', qubit: 1, col: 5 },
          { id: 'g9', gate: 'M', qubit: 0, col: 6 },
          { id: 'g10', gate: 'M', qubit: 1, col: 6 }
        ];
        break;

      // ── Advanced Presets ──
      case 'grover':
        newQubits = 2;
        gates = [
          { id: 'g1', gate: 'H', qubit: 0, col: 1 },
          { id: 'g2', gate: 'H', qubit: 1, col: 1 },
          { id: 'g3', gate: 'CZ', control: 0, target: 1, col: 2 },
          { id: 'g4', gate: 'H', qubit: 0, col: 3 },
          { id: 'g5', gate: 'H', qubit: 1, col: 3 },
          { id: 'g6', gate: 'X', qubit: 0, col: 4 },
          { id: 'g7', gate: 'X', qubit: 1, col: 4 },
          { id: 'g8', gate: 'CZ', control: 0, target: 1, col: 5 },
          { id: 'g9', gate: 'X', qubit: 0, col: 6 },
          { id: 'g10', gate: 'X', qubit: 1, col: 6 },
          { id: 'g11', gate: 'H', qubit: 0, col: 7 },
          { id: 'g12', gate: 'H', qubit: 1, col: 7 },
          { id: 'g13', gate: 'M', qubit: 0, col: 8 },
          { id: 'g14', gate: 'M', qubit: 1, col: 8 }
        ];
        break;
      case 'qft':
        newQubits = 2;
        gates = [
          { id: 'g1', gate: 'H', qubit: 0, col: 1 },
          { id: 'g2', gate: 'S', qubit: 0, col: 2 },
          { id: 'g3', gate: 'H', qubit: 1, col: 3 },
          { id: 'g4', gate: 'SWAP', control: 0, target: 1, col: 4 },
          { id: 'g5', gate: 'M', qubit: 0, col: 5 },
          { id: 'g6', gate: 'M', qubit: 1, col: 5 }
        ];
        break;
      case 'qec':
        newQubits = 3;
        gates = [
          { id: 'g1', gate: 'H', qubit: 0, col: 1 },
          { id: 'g2', gate: 'CNOT', control: 0, target: 1, col: 2 },
          { id: 'g3', gate: 'CNOT', control: 0, target: 2, col: 3 },
          { id: 'g4', gate: 'X', qubit: 1, col: 4 }, // Error injection
          { id: 'g5', gate: 'M', qubit: 0, col: 5 },
          { id: 'g6', gate: 'M', qubit: 1, col: 5 },
          { id: 'g7', gate: 'M', qubit: 2, col: 5 }
        ];
        break;
      case 'vqe':
        newQubits = 2;
        gates = [
          { id: 'g1', gate: 'RY', qubit: 0, col: 1, parameters: { theta: 0.785 } },
          { id: 'g2', gate: 'CNOT', control: 0, target: 1, col: 2 },
          { id: 'g3', gate: 'M', qubit: 0, col: 3 },
          { id: 'g4', gate: 'M', qubit: 1, col: 3 }
        ];
        break;
      case 'qaoa':
        newQubits = 2;
        gates = [
          { id: 'g1', gate: 'H', qubit: 0, col: 1 },
          { id: 'g2', gate: 'H', qubit: 1, col: 1 },
          { id: 'g3', gate: 'CNOT', control: 0, target: 1, col: 2 },
          { id: 'g4', gate: 'RZ', qubit: 1, col: 3, parameters: { theta: 0.5 } },
          { id: 'g5', gate: 'CNOT', control: 0, target: 1, col: 4 },
          { id: 'g6', gate: 'M', qubit: 0, col: 5 },
          { id: 'g7', gate: 'M', qubit: 1, col: 5 }
        ];
        break;
      default:
        break;
    }
    setNumQubits(newQubits);
    setVisualGates(gates);
    pushStateToHistory(gates, newQubits);
    setIsStale(true);
    setSimResult(null);
  };

  // Algorithm mode integration: Build circuit from generator
  const handleBuildAlgorithmCircuit = async (algoId, params) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/algorithms/${algoId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parameters: params, backend: selectedBackend })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Algorithm build failed');

      if (data.circuit) {
        const qast = data.circuit;
        setNumQubits(qast.num_qubits || 2);

        const newGates = [];
        (qast.operations || []).forEach((op, index) => {
          if (op.type === 'gate') {
            if (['CNOT', 'CZ', 'SWAP'].includes(op.gate)) {
              newGates.push({
                id: `op_${index}_${Math.random()}`,
                gate: op.gate,
                control: op.qubits[0],
                target: op.qubits[1],
                col: index + 1
              });
            } else {
              const item = {
                id: `op_${index}_${Math.random()}`,
                gate: op.gate,
                qubit: op.qubits[0],
                col: index + 1
              };
              if (op.parameters) item.parameters = op.parameters;
              newGates.push(item);
            }
          } else if (op.type === 'measure') {
            newGates.push({
              id: `op_${index}_${Math.random()}`,
              gate: 'M',
              qubit: op.qubits[0],
              col: index + 1
            });
          }
        });

        setVisualGates(newGates);
        pushStateToHistory(newGates, qast.num_qubits || 2);
        setActiveMode('builder');
        setIsStale(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Algorithm mode integration: Run algorithm simulation
  const handleRunAlgorithmSimulation = async (algoId, params) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/algorithms/${algoId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parameters: params, backend: selectedBackend })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Algorithm execution failed');

      if (data.result) {
        setSimResult(data.result);
      } else {
        setSimResult(data);
      }
      setIsStale(false);
      setIsResultWorkspaceOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const compileCodeToVisual = async (codeToCompile) => {
    try {
      setCodeError(null);
      const res = await fetch('/api/simulation/code_to_qast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToCompile || codeText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to compile quantum code');
      const qast = data;
      setNumQubits(qast.num_qubits || 2);

      const newGates = [];
      (qast.operations || []).forEach((op, index) => {
        if (op.type === 'gate') {
          if (['CNOT', 'CZ', 'SWAP'].includes(op.gate)) {
            newGates.push({
              id: `op_${index}_${Math.random()}`,
              gate: op.gate,
              control: op.qubits[0],
              target: op.qubits[1],
              col: index + 1
            });
          } else {
            const item = {
              id: `op_${index}_${Math.random()}`,
              gate: op.gate,
              qubit: op.qubits[0],
              col: index + 1
            };
            if (op.parameters) item.parameters = op.parameters;
            newGates.push(item);
          }
        } else if (op.type === 'measure') {
          newGates.push({
            id: `op_${index}_${Math.random()}`,
            gate: 'M',
            qubit: op.qubits[0],
            col: index + 1
          });
        }
      });

      setVisualGates(newGates);
      pushStateToHistory(newGates, qast.num_qubits || 2);
      setActiveMode('builder');
      setIsStale(true);
    } catch (err) {
      setCodeError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-primary)' }}>

      {/* TOP HEADER: Main Quantum Controls */}
      <div style={{
        padding: '12px 24px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.04em', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--accent-primary)' }}>QUANTUM</span> LAB
          </h2>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn" onClick={clearCircuit} style={{ fontSize: '0.78rem', padding: '6px 10px', fontFamily: 'var(--font-mono)' }} title="Reset Circuit">
              New Circuit
            </button>
            <button className="btn" onClick={handleUndo} disabled={historyIndex <= 0} style={{ fontSize: '0.78rem', padding: '6px 10px', fontFamily: 'var(--font-mono)' }}>
              ↶ Undo
            </button>
            <button className="btn" onClick={handleRedo} disabled={historyIndex >= history.length - 1} style={{ fontSize: '0.78rem', padding: '6px 10px', fontFamily: 'var(--font-mono)' }}>
              ↷ Redo
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>BACKEND:</span>
            <BackendSelector selectedBackend={selectedBackend} onBackendChange={setSelectedBackend} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>QUBITS:</span>
            <select
              value={numQubits}
              onChange={e => {
                const n = parseInt(e.target.value, 10);
                setNumQubits(n);
                pushStateToHistory(visualGates, n);
              }}
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                padding: '6px 10px',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem'
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n} Qubits</option>)}
            </select>
          </div>

          {/* Level Switcher in Lab Header */}
          <LevelSelector
            compact={true}
            onLevelChange={(lvl) => setUserLevelState(lvl)}
          />

          <button
            className="btn"
            onClick={() => setIsAiDrawerOpen(true)}
            style={{
              fontSize: '0.8rem',
              borderColor: '#BFDBFE',
              color: 'var(--accent-primary)',
              backgroundColor: '#EFF6FF'
            }}
          >
            🤖 ASK AI TUTOR
          </button>

          <button
            onClick={runSimulation}
            disabled={isLoading}
            style={{
              padding: '8px 20px',
              fontSize: '0.875rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              background: 'var(--accent-primary)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-xs)',
              fontFamily: 'var(--font-mono)'
            }}
          >
            {isLoading ? 'RUNNING...' : '▶ RUN SIMULATION'}
          </button>
        </div>
      </div>

      {/* SECONDARY MODE BAR WITH PRESET TEMPLATES */}
      <div style={{
        backgroundColor: '#F8FAFC',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '6px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { id: 'builder', label: 'BUILDER' },
            { id: 'code', label: 'CODE' },
            { id: 'algorithms', label: 'ALGORITHMS' },
            { id: 'experiment', label: 'EXPERIMENT' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                backgroundColor: activeMode === m.id ? '#FFFFFF' : 'transparent',
                color: activeMode === m.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                borderBottom: activeMode === m.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Level-Grouped Circuit Presets Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            {userLevel.toUpperCase()} PRESETS:
          </span>
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                handleLoadAlgorithmTemplate(e.target.value);
                e.target.value = '';
              }
            }}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              fontWeight: 600,
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              color: '#0F172A',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer'
            }}
          >
            <option value="" disabled>⚡ Load {userLevel} Preset...</option>
            {userLevel === 'Beginner' && (
              <optgroup label="🌱 Beginner Tier Presets">
                <option value="superposition">|+⟩ Equal Superposition (H)</option>
                <option value="not_flip">|1⟩ Pauli-X Bit Flip</option>
                <option value="phase_flip">|-⟩ Pauli-Z Phase Inversion</option>
                <option value="rotation_ry">Ry(π/2) Arbitrary Rotation</option>
              </optgroup>
            )}
            {userLevel === 'Intermediate' && (
              <optgroup label="⚡ Intermediate Tier Presets">
                <option value="bell">Bell State |Φ⁺⟩ Entanglement</option>
                <option value="ghz">3-Qubit GHZ Entangled State</option>
                <option value="teleport">Quantum Teleportation Protocol</option>
                <option value="deutsch">Deutsch-Jozsa Balanced Oracle</option>
                <option value="bv">Bernstein-Vazirani Algorithm</option>
              </optgroup>
            )}
            {userLevel === 'Advanced' && (
              <optgroup label="🚀 Advanced Tier Presets">
                <option value="grover">Grover 2-Qubit Search & Diffusion</option>
                <option value="qft">Quantum Fourier Transform (QFT)</option>
                <option value="qec">3-Qubit Bit-Flip QEC Code</option>
                <option value="vqe">Hardware-Efficient VQE Ansatz</option>
                <option value="qaoa">QAOA Max-Cut Ansatz Circuit</option>
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {/* Execution Error Banner */}
      {error && (
        <div style={{ margin: '16px 24px', padding: '14px 18px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gate-x)', fontFamily: 'var(--font-mono)' }}>SIMULATION EXECUTION ERROR</div>
            <div style={{ fontSize: '0.85rem', color: '#991B1B', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>{error}</div>
          </div>
          <button className="btn" style={{ fontSize: '0.75rem' }} onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Parameter Prompt Dialog for RX/RY/RZ */}
      {parameterPrompt && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-medium)', padding: '24px', borderRadius: '10px', width: '340px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: 'var(--shadow-lg)' }}>
            <h4 style={{ margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700 }}>Set Rotation Parameter (θ)</h4>
            <input
              type="number"
              step="0.1"
              defaultValue="0.785"
              id="thetaInput"
              style={{ padding: '9px 12px', background: '#FFFFFF', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setParameterPrompt(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => handleParameterSubmit(document.getElementById('thetaInput').value)}>Apply Gate</button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN WORKSPACE CONTENT */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {activeMode === 'builder' && (
          <>
            <GatePalette onDragStart={handleDragStart} onSelectGate={handleSelectGate} selectedGateId={selectedGate?.id} />
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
              <CircuitBuilder
                visualGates={visualGates}
                interactionState={interactionState}
                pendingControlQubit={pendingControlQubit}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onTargetClick={handleTargetClick}
                onSelectGate={handleSelectGate}
                selectedGateId={selectedGate?.id}
                numQubits={numQubits}
                onLoadAlgorithmTemplate={handleLoadAlgorithmTemplate}
              />
            </div>
            <RightInspector
              selectedGate={selectedGate}
              onUpdateGateParam={handleUpdateGateParam}
              onDeleteSelectedGate={handleDeleteSelectedGate}
              onDeselectGate={() => setSelectedGate(null)}
              numQubits={numQubits}
              visualGates={visualGates}
              selectedBackend={selectedBackend}
              simResult={simResult}
              isStale={isStale}
            />
          </>
        )}

        {activeMode === 'code' && (
          <div style={{ flex: 1, padding: '20px', display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <QuantumCodeEditor
                code={codeText}
                onChangeCode={(c) => { setCodeText(c); setIsStale(true); }}
                onCompile={compileCodeToVisual}
                error={codeError}
              />
            </div>
            <RightInspector
              selectedGate={selectedGate}
              onUpdateGateParam={handleUpdateGateParam}
              onDeleteSelectedGate={handleDeleteSelectedGate}
              onDeselectGate={() => setSelectedGate(null)}
              numQubits={numQubits}
              visualGates={visualGates}
              selectedBackend={selectedBackend}
              simResult={simResult}
              isStale={isStale}
            />
          </div>
        )}

        {activeMode === 'algorithms' && (
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            <AlgorithmModePanel
              selectedBackend={selectedBackend}
              onBuildAlgorithmCircuit={handleBuildAlgorithmCircuit}
              onRunAlgorithmSimulation={handleRunAlgorithmSimulation}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeMode === 'experiment' && (
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            <ExperimentModePanel
              onRunParallelSimulation={runParallelSimulation}
              parallelResults={parallelResults}
              isLoading={isLoading}
            />
          </div>
        )}

      </div>

      {/* BOTTOM COLLAPSIBLE RESULT & PROCESS WORKSPACE */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-medium)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-md)'
      }}>
        {/* Toggle Bar */}
        <div
          onClick={() => setIsResultWorkspaceOpen(prev => !prev)}
          style={{
            padding: '10px 24px',
            backgroundColor: '#F8FAFC',
            borderBottom: isResultWorkspaceOpen ? '1px solid var(--border-subtle)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            userSelect: 'none',
            transition: 'background-color 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--accent-primary)', fontSize: '0.75rem' }}>
              {isResultWorkspaceOpen ? '▼' : '▲'}
            </span>
            <span>SIMULATION RESULTS & EXECUTION TRACE</span>
            {simResult && (
              <span style={{
                color: '#15803D',
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.725rem',
                fontWeight: 700
              }}>
                Status: {simResult.status}
              </span>
            )}
            {isStale && (
              <span style={{
                color: '#B45309',
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.725rem',
                fontWeight: 700
              }}>
                ⚠ STALE
              </span>
            )}
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
            {isResultWorkspaceOpen ? 'Click to collapse' : 'Click to expand'}
          </span>
        </div>

        {/* Collapsible Panel Content */}
        {isResultWorkspaceOpen && (
          <div style={{ height: '360px', overflowY: 'auto', borderTop: '1px solid var(--border-subtle)' }}>
            <ResultsPanel simResult={simResult} isStale={isStale} />
          </div>
        )}
      </div>

      <AIContextDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        contextData={{
          page: 'lab',
          circuit: visualGates,
          selectedBackend,
          latestResult: simResult
        }}
      />

    </div>
  );
}
