import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuantumPage, QuantumHeader, QuantumPanel, QuantumCard, QuantumButton, QuantumSelect, QuantumInput, QuantumErrorState, QuantumLoadingState, QuantumMetric } from '../components/ui/QuantumPrimitives';
import CircuitCanvas from '../components/quantum/CircuitCanvas';
import ResultsPanel from '../components/visualization/ResultsPanel';
import StatevectorVisualization from '../components/visualization/StatevectorVisualization';
import ProbabilityVisualization from '../components/visualization/ProbabilityVisualization';
import BackendSelector from '../components/quantum/BackendSelector';

export default function Algorithms() {
  const navigate = useNavigate();
  const [algorithms, setAlgorithms] = useState([]);
  const [selectedAlgoId, setSelectedAlgoId] = useState('');
  const [parameters, setParameters] = useState({});
  const [selectedBackend, setSelectedBackend] = useState('custom_m1');
  const [algoResponse, setAlgoResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectAlgo = useCallback((algo) => {
    if (!algo) return;
    setSelectedAlgoId(algo.id);
    const initialParams = {};
    if (algo.id === 'vqe') {
      initialParams.num_qubits = 2;
      initialParams.ansatz_type = 'hardware_efficient';
      initialParams.max_iterations = 30;
    } else if (algo.id === 'qaoa') {
      initialParams.num_nodes = 3;
      initialParams.p_steps = 1;
      initialParams.max_iterations = 30;
    } else if (algo.id === 'qec') {
      initialParams.initial_state_bit = 0;
      initialParams.error_qubit = 'q1';
    } else if (algo.id === 'qft') {
      initialParams.num_qubits = 3;
      initialParams.is_inverse = false;
    } else if (algo.id === 'shor') {
      initialParams.N = 15;
      initialParams.a = 2;
    } else {
      (algo.required_parameters || []).forEach(p => {
        if (p === 'hidden_string' || p === 'marked_state') initialParams[p] = '101';
        if (p === 'num_qubits') initialParams[p] = 3;
        if (p === 'oracle_type') initialParams[p] = 'constant';
        if (p === 'iterations') initialParams[p] = 1;
      });
    }
    setParameters(initialParams);
    setAlgoResponse(null);
    setError('');
  }, []);

  useEffect(() => {
    fetch('/api/algorithms/')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch quantum algorithms');
        return res.json();
      })
      .then(data => {
        setAlgorithms(data);
        if (data.length > 0) {
          handleSelectAlgo(data[0]);
        }
      })
      .catch(err => setError(err.message));
  }, [handleSelectAlgo]);

  const handleParamChange = (param, value) => {
    setParameters(prev => ({ ...prev, [param]: value }));
  };

  const handleRun = async () => {
    setError('');
    setIsLoading(true);
    setAlgoResponse(null);

    const endpoint = ['vqe', 'qaoa', 'qec', 'qft', 'shor'].includes(selectedAlgoId)
      ? `/api/algorithms/${selectedAlgoId}/run`
      : `/api/algorithms/${selectedAlgoId}/run`;

    const payload = ['vqe', 'qaoa', 'qec', 'qft', 'shor'].includes(selectedAlgoId)
      ? { ...parameters, backend: selectedBackend }
      : { backend: selectedBackend, parameters };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.message || data.detail || 'Algorithm execution failed');

      setAlgoResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenInLab = () => {
    if (!algoResponse || !algoResponse.circuit) return;
    const ops = algoResponse.circuit.operations || [];
    const preset = ops.map((op, idx) => ({
      id: Math.random().toString(),
      gate: op.gate,
      qubit: op.qubits ? op.qubits[0] : 0,
      control: op.qubits && op.qubits.length > 1 ? op.qubits[0] : undefined,
      target: op.qubits && op.qubits.length > 1 ? op.qubits[1] : undefined,
      col: idx + 1,
      parameters: op.parameters
    }));
    navigate('/lab', { state: { preset } });
  };

  const selectedAlgo = algorithms.find(a => a.id === selectedAlgoId);
  const circuit = algoResponse?.circuit;
  const result = algoResponse?.result;
  const analysis = algoResponse?.analysis;

  // Convert Circuit Q-AST to visualGates for CircuitCanvas
  const visualGates = [];
  if (circuit && circuit.operations) {
    let col = 0;
    circuit.operations.forEach(op => {
      if (op.gate) {
        if (['CNOT', 'CZ', 'SWAP', 'CPHASE'].includes(op.gate)) {
          visualGates.push({
            gate: op.gate,
            control: op.qubits[0],
            target: op.qubits[1],
            col,
            parameters: op.parameters
          });
        } else if (op.gate === 'MCX') {
          visualGates.push({
            gate: op.gate,
            controls: op.qubits.slice(0, -1),
            target: op.qubits[op.qubits.length - 1],
            col
          });
        } else {
          visualGates.push({
            gate: op.gate,
            qubit: op.qubits[0],
            col,
            parameters: op.parameters
          });
        }
        col++;
      } else if (op.qubits && op.cbits) {
        op.qubits.forEach(q => {
          visualGates.push({ gate: 'M', qubit: q, col });
        });
        col++;
      }
    });
  }

  return (
    <QuantumPage env="algorithms" maxWidth={1280}>
      <QuantumHeader
        title="Advanced Quantum Algorithm Engine"
        subtitle="Execute scientifically grounded quantum algorithms: VQE, QAOA MaxCut, 3-Qubit Repetition Code QEC, QFT, and Educational Shor's Algorithm (N=15)."
        category="BUILD & COMPUTE"
      />

      {error && (
        <QuantumErrorState
          title="Algorithm Execution Error"
          message={error}
          onRetry={handleRun}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Algorithm Selection & Parameters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <QuantumPanel title="Algorithm Selection">
            <QuantumSelect
              label="Select Quantum Algorithm"
              options={algorithms.map(a => ({ id: a.id, name: a.name }))}
              value={selectedAlgoId}
              onChange={(e) => {
                const found = algorithms.find(a => a.id === e.target.value);
                if (found) handleSelectAlgo(found);
              }}
            />

            {selectedAlgo && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '8px' }}>
                {selectedAlgo.description}
              </div>
            )}
          </QuantumPanel>

          {/* Specialized Parameters Input */}
          <QuantumPanel title="Input Parameters">
            {selectedAlgoId === 'vqe' && (
              <>
                <QuantumSelect
                  label="Ansatz Type"
                  options={[
                    { id: 'hardware_efficient', name: 'Hardware Efficient (RY + CNOT)' },
                    { id: 'ry_rz', name: 'RY + RZ Rotation' }
                  ]}
                  value={parameters.ansatz_type || 'hardware_efficient'}
                  onChange={e => handleParamChange('ansatz_type', e.target.value)}
                />
                <QuantumInput
                  label="Qubits"
                  type="number"
                  value={parameters.num_qubits || 2}
                  onChange={e => handleParamChange('num_qubits', parseInt(e.target.value, 10))}
                />
                <QuantumInput
                  label="Max Iterations"
                  type="number"
                  value={parameters.max_iterations || 30}
                  onChange={e => handleParamChange('max_iterations', parseInt(e.target.value, 10))}
                />
              </>
            )}

            {selectedAlgoId === 'qaoa' && (
              <>
                <QuantumInput
                  label="Graph Nodes"
                  type="number"
                  value={parameters.num_nodes || 3}
                  onChange={e => handleParamChange('num_nodes', parseInt(e.target.value, 10))}
                />
                <QuantumInput
                  label="QAOA Layers (p)"
                  type="number"
                  value={parameters.p_steps || 1}
                  onChange={e => handleParamChange('p_steps', parseInt(e.target.value, 10))}
                />
                <QuantumInput
                  label="Max Iterations"
                  type="number"
                  value={parameters.max_iterations || 30}
                  onChange={e => handleParamChange('max_iterations', parseInt(e.target.value, 10))}
                />
              </>
            )}

            {selectedAlgoId === 'qec' && (
              <>
                <QuantumSelect
                  label="Logical Input State"
                  options={[
                    { id: '0', name: 'Logical |0⟩' },
                    { id: '1', name: 'Logical |1⟩' }
                  ]}
                  value={String(parameters.initial_state_bit || 0)}
                  onChange={e => handleParamChange('initial_state_bit', parseInt(e.target.value, 10))}
                />
                <QuantumSelect
                  label="Injected Bit-Flip Error"
                  options={[
                    { id: 'none', name: 'No Error' },
                    { id: 'q0', name: 'X error on Data Qubit 0' },
                    { id: 'q1', name: 'X error on Data Qubit 1' },
                    { id: 'q2', name: 'X error on Data Qubit 2' }
                  ]}
                  value={parameters.error_qubit || 'q1'}
                  onChange={e => handleParamChange('error_qubit', e.target.value)}
                />
              </>
            )}

            {selectedAlgoId === 'qft' && (
              <>
                <QuantumInput
                  label="Qubits (1 - 8)"
                  type="number"
                  value={parameters.num_qubits || 3}
                  onChange={e => handleParamChange('num_qubits', parseInt(e.target.value, 10))}
                />
                <QuantumSelect
                  label="QFT Direction"
                  options={[
                    { id: 'false', name: 'Forward QFT' },
                    { id: 'true', name: 'Inverse QFT (QFT†)' }
                  ]}
                  value={String(parameters.is_inverse || false)}
                  onChange={e => handleParamChange('is_inverse', e.target.value === 'true')}
                />
              </>
            )}

            {selectedAlgoId === 'shor' && (
              <>
                <QuantumInput
                  label="Number N to Factor"
                  type="number"
                  value={15}
                  disabled
                />
                <QuantumSelect
                  label="Base a (coprime to 15)"
                  options={[
                    { id: '2', name: 'a = 2' },
                    { id: '4', name: 'a = 4' },
                    { id: '7', name: 'a = 7' },
                    { id: '8', name: 'a = 8' },
                    { id: '11', name: 'a = 11' },
                    { id: '13', name: 'a = 13' }
                  ]}
                  value={String(parameters.a || 2)}
                  onChange={e => handleParamChange('a', parseInt(e.target.value, 10))}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', fontFamily: 'monospace', marginTop: '6px' }}>
                  Educational Shor implementation — N=15
                </div>
              </>
            )}

            {!['vqe', 'qaoa', 'qec', 'qft', 'shor'].includes(selectedAlgoId) && selectedAlgo?.required_parameters?.map(param => (
              <QuantumInput
                key={param}
                label={param.replace('_', ' ').toUpperCase()}
                type={param === 'num_qubits' || param === 'iterations' ? 'number' : 'text'}
                value={parameters[param] ?? ''}
                onChange={(e) => handleParamChange(param, e.target.value)}
              />
            ))}
          </QuantumPanel>

          <QuantumPanel title="Execution Target">
            <BackendSelector selected={selectedBackend} onSelect={setSelectedBackend} />
            <QuantumButton
              variant="primary"
              size="large"
              onClick={handleRun}
              loading={isLoading}
              style={{ width: '100%', marginTop: '12px' }}
            >
              GENERATE & EXECUTE
            </QuantumButton>
            {algoResponse && algoResponse.circuit && (
              <QuantumButton
                variant="secondary"
                size="large"
                onClick={handleOpenInLab}
                style={{ width: '100%', marginTop: '8px' }}
              >
                OPEN CIRCUIT IN QUANTUM LAB →
              </QuantumButton>
            )}
          </QuantumPanel>
        </div>

        {/* Right Column: Generated Circuit & Execution Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Educational Stage Overview */}
          {selectedAlgo && selectedAlgo.educational_stages && (
            <QuantumPanel title="Algorithm Execution Stages" badgeText="Algorithm Stages" badgeVariant="violet">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {selectedAlgo.educational_stages.map((stage, idx) => (
                  <QuantumCard key={idx} hoverable={false} style={{ padding: '12px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', fontWeight: 700, fontFamily: 'monospace' }}>
                      STAGE 0{idx + 1}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.4 }}>
                      {stage}
                    </div>
                  </QuantumCard>
                ))}
              </div>
            </QuantumPanel>
          )}

          {isLoading && <QuantumLoadingState message="Compiling Q-AST and executing quantum algorithm..." />}

          {/* Specialized Analysis Panels */}
          {algoResponse && !isLoading && (
            <>
              {/* VQE Analysis Panel */}
              {selectedAlgoId === 'vqe' && analysis && (
                <QuantumPanel title="VQE Variational Optimization Analysis" badgeText="VQE Results" badgeVariant="cyan">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <QuantumMetric label="Initial Energy" value={analysis.initial_energy?.toFixed(4)} color="var(--text-muted)" />
                    <QuantumMetric label="Ground State Energy" value={analysis.final_ground_state_energy?.toFixed(4)} color="var(--accent-secondary)" />
                    <QuantumMetric label="Iterations" value={analysis.iterations_count} />
                    <QuantumMetric label="Status" value={analysis.converged ? "CONVERGED" : "COMPLETED"} color={analysis.converged ? "#4ade80" : "var(--accent-primary)"} />
                  </div>
                  {analysis.convergence_history && (
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px', fontSize: '0.8rem', fontFamily: 'monospace', maxHeight: '160px', overflowY: 'auto' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>CONVERGENCE HISTORY</div>
                      {analysis.convergence_history.slice(-8).map((h, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span>Iter #{h.iteration}</span>
                          <span style={{ color: 'var(--accent-secondary)' }}>Energy: {h.energy.toFixed(6)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </QuantumPanel>
              )}

              {/* QAOA Analysis Panel */}
              {selectedAlgoId === 'qaoa' && analysis && (
                <QuantumPanel title="QAOA MaxCut Optimization Analysis" badgeText="QAOA Results" badgeVariant="cyan">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <QuantumMetric label="Best Candidate Bitstring" value={`|${analysis.best_candidate_bitstring}⟩`} color="var(--accent-secondary)" />
                    <QuantumMetric label="Max Cut Value" value={analysis.max_cut_value} color="#4ade80" />
                    <QuantumMetric label="Optimal Expected Cost" value={analysis.optimal_cost?.toFixed(4)} />
                  </div>
                </QuantumPanel>
              )}

              {/* QEC Analysis Panel */}
              {selectedAlgoId === 'qec' && analysis && (
                <QuantumPanel title="QEC Repetition Code Recovery Analysis" badgeText={analysis.success ? "RECOVERY PASSED" : "RECOVERY FAILED"} badgeVariant={analysis.success ? "green" : "violet"}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                    <QuantumMetric label="Logical Input" value={`|${analysis.logical_input}⟩`} />
                    <QuantumMetric label="Injected Error" value={analysis.injected_error} color="var(--gate-x)" />
                    <QuantumMetric label="Syndrome (q3 q4)" value={analysis.detected_syndrome} color="var(--accent-secondary)" />
                    <QuantumMetric label="Correction Applied" value={analysis.correction_applied} color="#4ade80" />
                  </div>
                </QuantumPanel>
              )}

              {/* QFT Analysis Panel */}
              {selectedAlgoId === 'qft' && analysis && (
                <QuantumPanel title="Quantum Fourier Transform Verification" badgeText={analysis.fourier_matrix_verified ? "VERIFIED" : "UNVERIFIED"} badgeVariant="green">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <QuantumMetric label="Statevector Fidelity (vs Math Definition)" value={(analysis.statevector_fidelity * 100).toFixed(2)} unit="%" color="#4ade80" />
                    <QuantumMetric label="Fourier Matrix Check" value={analysis.fourier_matrix_verified ? "PASSED" : "FAILED"} />
                  </div>
                </QuantumPanel>
              )}

              {/* Shor Analysis Panel */}
              {selectedAlgoId === 'shor' && analysis && (
                <QuantumPanel title="Educational Shor's Algorithm (N=15, a=2) Pipeline" badgeText="N=15 Factorization" badgeVariant="cyan">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <QuantumMetric label="Target N" value={15} />
                    <QuantumMetric label="Base a" value={parameters.a || 2} />
                    <QuantumMetric label="Order r Found" value={analysis.stage_4_phase_estimation?.order_r} color="var(--accent-secondary)" />
                    <QuantumMetric label="Extracted Factors" value={`${analysis.stage_5_factorization?.factor_1} × ${analysis.stage_5_factorization?.factor_2}`} color="#4ade80" />
                  </div>
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '6px', fontSize: '0.85rem', lineHeight: '1.6', fontFamily: 'monospace' }}>
                    <div style={{ color: 'var(--accent-secondary)', fontWeight: 600, marginBottom: '4px' }}>STAGE-BY-STAGE PIPELINE:</div>
                    1. Coprimality check: gcd({parameters.a || 2}, 15) = {analysis.stage_1_coprimality?.gcd} (Coprime: YES)<br />
                    2. Quantum order-finding circuit: {analysis.stage_2_order_finding_circuit?.total_qubits} Qubits ({analysis.stage_2_order_finding_circuit?.num_counting_qubits} counting, {analysis.stage_2_order_finding_circuit?.num_target_qubits} target)<br />
                    3. Genuine Quantum Measurement outcome: |{analysis.stage_3_measurement?.measured_bitstring}⟩ (decimal k = {analysis.stage_3_measurement?.measured_decimal})<br />
                    4. Phase estimation: phi = {analysis.stage_3_measurement?.measured_decimal}/8 = {analysis.stage_4_phase_estimation?.estimated_phase} =&gt; order r = {analysis.stage_4_phase_estimation?.order_r}<br />
                    5. Factorization: gcd(a^(r/2) ± 1, 15) = gcd({parameters.a || 2}^2 - 1, 15) and gcd({parameters.a || 2}^2 + 1, 15) =&gt; Factors: {analysis.stage_5_factorization?.factor_1} and {analysis.stage_5_factorization?.factor_2}
                  </div>
                </QuantumPanel>
              )}
            </>
          )}

          {/* Circuit View */}
          {circuit && !isLoading && (
            <QuantumPanel title="Compiled Q-AST Circuit Canvas" badgeText={`${circuit.num_qubits} Qubits`} badgeVariant="cyan">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <QuantumButton
                  variant="secondary"
                  size="small"
                  onClick={() => navigate('/lab', { state: { preset: visualGates } })}
                >
                  ⚡ LOAD CIRCUIT IN QUANTUM LAB
                </QuantumButton>
              </div>
              <div style={{ overflowX: 'auto', padding: '16px', backgroundColor: '#07090E', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <CircuitCanvas
                  visualGates={visualGates}
                  interactionState="idle"
                  onDrop={() => {}}
                  onDragOver={() => {}}
                  onTargetClick={() => {}}
                  numQubits={circuit.num_qubits}
                />
              </div>
            </QuantumPanel>
          )}

          {/* Results View */}
          {result && !isLoading && (
            <QuantumPanel title="Backend Execution Results" badgeText={selectedBackend.toUpperCase()} badgeVariant="green">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {result.probabilities && <ProbabilityVisualization probabilities={result.probabilities} />}
                {result.statevector && <StatevectorVisualization statevector={result.statevector} />}
              </div>
              <div style={{ marginTop: '20px' }}>
                <ResultsPanel simResult={result} />
              </div>
            </QuantumPanel>
          )}
        </div>
      </div>
    </QuantumPage>
  );
}
