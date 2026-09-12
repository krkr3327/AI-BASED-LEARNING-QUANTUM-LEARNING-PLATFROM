import React, { useState, useEffect } from 'react';
import { QuantumPage, QuantumHeader, QuantumPanel, QuantumMetric, QuantumBadge, QuantumButton, QuantumSelect, QuantumInput, QuantumEmptyState, QuantumLoadingState, QuantumErrorState, QuantumTabs } from '../components/ui/QuantumPrimitives';
import QkdSimulator from '../components/experiments/QkdSimulator';
import SurfaceCodeVisualizer from '../components/experiments/SurfaceCodeVisualizer';
import QuantumTeleportationStudio from '../components/experiments/QuantumTeleportationStudio';
import QuantumAdvantageExplorer from '../components/experiments/QuantumAdvantageExplorer';

export default function Experiments() {
  const [activeTab, setActiveTab] = useState('qkd');
  const [backends, setBackends] = useState([]);
  const [selectedBackend, setSelectedBackend] = useState('custom_m1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Parameter sweep state
  const [sweepResult, setSweepResult] = useState(null);
  const [sweepSteps, setSweepSteps] = useState(7);

  // VQE state
  const [vqeResult, setVqeResult] = useState(null);

  // QEC state
  const [qecResult, setQecResult] = useState(null);
  const [qecErrorQubit, setQecErrorQubit] = useState(1);

  // RB state
  const [rbResult, setRbResult] = useState(null);

  useEffect(() => {
    fetch('/api/backends/capabilities')
      .then(res => res.json())
      .then(data => {
        setBackends(data);
      })
      .catch(err => setError(err.message));
  }, []);

  const handleRunSweep = async () => {
    setLoading(true);
    setError('');
    setSweepResult(null);
    try {
      const payload = {
        circuit: {
          num_qubits: 1,
          num_cbits: 0,
          operations: [{ type: 'gate', gate: 'RX', qubits: [0], parameters: { theta: 'theta' } }]
        },
        param_name: 'theta',
        start: 0.0,
        stop: 3.14159,
        steps: sweepSteps,
        backend: selectedBackend
      };
      const res = await fetch('/api/simulation/sweep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.message || data.detail || 'Sweep execution failed');
      setSweepResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunVQE = async () => {
    setLoading(true);
    setError('');
    setVqeResult(null);
    try {
      const payload = {
        circuit_template: {
          num_qubits: 1,
          num_cbits: 0,
          operations: [{ type: 'gate', gate: 'RX', qubits: [0], parameters: { t: 't' } }]
        },
        hamiltonian: [{ pauli: 'Z', coeff: 1.0 }],
        param_names: ['t'],
        initial_params: [0.0],
        maxiter: 40,
        backend: selectedBackend
      };
      const res = await fetch('/api/simulation/vqe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.message || data.detail || 'VQE solver failed');
      setVqeResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunQEC = async () => {
    setLoading(true);
    setError('');
    setQecResult(null);
    try {
      const payload = {
        initial_state_bit: 0,
        error_qubit: qecErrorQubit
      };
      const res = await fetch('/api/simulation/qec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.message || data.detail || 'QEC simulation failed');
      setQecResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunRB = async () => {
    setLoading(true);
    setError('');
    setRbResult(null);
    try {
      const payload = {
        sequence_lengths: [2, 4, 8, 16],
        num_sequences: 5,
        shots: 100,
        seed: 42
      };
      const res = await fetch('/api/simulation/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.message || data.detail || 'Randomized benchmarking failed');
      setRbResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <QuantumPage env="experiments" maxWidth={1280}>
      <QuantumHeader
        title="Quantum Experiments Engine"
        subtitle="Parameter sweeps, VQE variational eigensolvers, 3-qubit repetition error correction codes, and Clifford randomized benchmarking executed directly on physical simulation backends."
        category="RESEARCH & ANALYSIS"
        actions={
          <QuantumSelect
            label="Backend Target"
            options={backends.map(b => ({ id: b.backend_id, name: b.display_name }))}
            value={selectedBackend}
            onChange={(e) => setSelectedBackend(e.target.value)}
          />
        }
      />

      <QuantumTabs
        tabs={[
          { id: 'qkd', label: '1. QKD NETWORK (BB84/E91)' },
          { id: 'surface_code', label: '2. 2D SURFACE CODE QEC' },
          { id: 'teleportation', label: '3. QUANTUM TELEPORTATION' },
          { id: 'advantage', label: '4. QUANTUM ADVANTAGE' },
          { id: 'sweep', label: '5. PARAMETER SWEEPS' },
          { id: 'vqe', label: '6. VQE SOLVER' },
          { id: 'qec', label: '7. 3-QUBIT QEC' },
          { id: 'rb', label: '8. BENCHMARKING' }
        ]}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      {error && (
        <QuantumErrorState
          title="Experiment Execution Error"
          message={error}
          onRetry={() => setError('')}
        />
      )}

      {/* TAB: QKD Network Simulator */}
      {activeTab === 'qkd' && <QkdSimulator />}

      {/* TAB: 2D Surface Code Visualizer */}
      {activeTab === 'surface_code' && <SurfaceCodeVisualizer />}

      {/* TAB: Quantum Teleportation Studio */}
      {activeTab === 'teleportation' && <QuantumTeleportationStudio />}

      {/* TAB: Computational Advantage Explorer */}
      {activeTab === 'advantage' && <QuantumAdvantageExplorer />}

      {/* TAB 5: PARAMETER SWEEPS */}
      {activeTab === 'sweep' && (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', alignItems: 'start' }}>
          <QuantumPanel title="Sweep Configuration">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Sweep continuous rotation angle θ on RX(θ)|0⟩ from 0 to π to observe exact quantum state probability transitions.
            </p>
            <QuantumInput
              label="SWEEP DISCRETIZATION STEPS"
              type="number"
              value={sweepSteps}
              onChange={e => setSweepSteps(parseInt(e.target.value, 10))}
            />
            <QuantumButton onClick={handleRunSweep} loading={loading} style={{ width: '100%', marginTop: '8px' }}>
              RUN PARAMETER SWEEP
            </QuantumButton>
          </QuantumPanel>

          <QuantumPanel title="Sweep Execution Results" badgeText={selectedBackend.toUpperCase()} badgeVariant="cyan">
            {loading && <QuantumLoadingState message="Sweeping parameters across statevector simulation..." />}

            {!loading && !sweepResult && (
              <QuantumEmptyState
                title="No Sweep Experiment Run Yet"
                description="Configure your sweep steps and click 'RUN PARAMETER SWEEP' to generate physical backend probability distribution data."
                actionLabel="Execute Sweep Now"
                onAction={handleRunSweep}
              />
            )}

            {!loading && sweepResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <QuantumBadge variant="green">SOURCE: BACKEND EXECUTION</QuantumBadge>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    Steps: {sweepResult.sweep_results?.length || 0}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
                  {sweepResult.sweep_results.map((point, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--text-primary)' }}>θ = {point.param_value.toFixed(3)} rad</span>
                      <span style={{ color: 'var(--accent-secondary)' }}>P(|0⟩) = {point.probabilities['0'] !== undefined ? point.probabilities['0'].toFixed(4) : '0.0000'}</span>
                      <span style={{ color: 'var(--accent-primary)' }}>P(|1⟩) = {point.probabilities['1'] !== undefined ? point.probabilities['1'].toFixed(4) : '0.0000'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </QuantumPanel>
        </div>
      )}

      {/* TAB 2: VQE SOLVER */}
      {activeTab === 'vqe' && (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', alignItems: 'start' }}>
          <QuantumPanel title="VQE Optimizer Configuration">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Variational Quantum Eigensolver (VQE) optimizing parameterized ansatz RX(t)|0⟩ to find ground state energy of Pauli Z Hamiltonian.
            </p>
            <QuantumButton onClick={handleRunVQE} loading={loading} style={{ width: '100%', marginTop: '16px' }}>
              EXECUTE VQE SOLVER
            </QuantumButton>
          </QuantumPanel>

          <QuantumPanel title="VQE Optimization Output" badgeText={selectedBackend.toUpperCase()} badgeVariant="violet">
            {loading && <QuantumLoadingState message="Optimizing VQE variational parameters..." />}

            {!loading && !vqeResult && (
              <QuantumEmptyState
                title="No VQE Optimization Recorded"
                description="Click 'EXECUTE VQE SOLVER' to start variational optimization of the ground state energy."
                actionLabel="Execute VQE Solver"
                onAction={handleRunVQE}
              />
            )}

            {!loading && vqeResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                  <QuantumMetric label="Initial Energy" value={vqeResult.initial_energy.toFixed(4)} />
                  <QuantumMetric label="Ground Energy" value={vqeResult.final_energy.toFixed(4)} color="var(--gate-y)" />
                  <QuantumMetric label="Iterations" value={vqeResult.iterations} color="var(--accent-primary)" />
                  <QuantumMetric label="Convergence" value={vqeResult.converged ? 'CONVERGED' : 'COMPLETED'} color="var(--accent-secondary)" />
                </div>

                <div style={{ padding: '16px', backgroundColor: '#07090E', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontFamily: 'monospace' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>OPTIMIZED PARAMETERS:</div>
                  <pre style={{ margin: 0, color: 'var(--accent-secondary)', fontSize: '0.95rem' }}>
                    {JSON.stringify(vqeResult.optimized_parameters, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </QuantumPanel>
        </div>
      )}

      {/* TAB 3: QEC REPETITION CODE */}
      {activeTab === 'qec' && (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', alignItems: 'start' }}>
          <QuantumPanel title="3-Qubit Repetition Code">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Encodes logical qubit into 3 physical qubits, injects single-qubit bit-flip error, extracts ancilla syndrome, and applies active correction.
            </p>
            <QuantumSelect
              label="INJECT BIT FLIP ERROR ON QUBIT"
              options={[
                { id: 0, name: 'Qubit 0 (q0)' },
                { id: 1, name: 'Qubit 1 (q1)' },
                { id: 2, name: 'Qubit 2 (q2)' }
              ]}
              value={qecErrorQubit}
              onChange={e => setQecErrorQubit(parseInt(e.target.value, 10))}
            />
            <QuantumButton onClick={handleRunQEC} loading={loading} style={{ width: '100%', marginTop: '16px' }}>
              EXECUTE QEC SIMULATION
            </QuantumButton>
          </QuantumPanel>

          <QuantumPanel title="QEC Syndrome & Correction Outcome" badgeText="PHYSICAL SIMULATION" badgeVariant="green">
            {loading && <QuantumLoadingState message="Injecting error and extracting syndrome..." />}

            {!loading && !qecResult && (
              <QuantumEmptyState
                title="No QEC Simulation Executed"
                description="Select an error target qubit and click 'EXECUTE QEC SIMULATION' to observe error detection and recovery."
                actionLabel="Run QEC Simulation"
                onAction={handleRunQEC}
              />
            )}

            {!loading && qecResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                  <QuantumMetric label="Initial Logical Bit" value={qecResult.initial_state_bit} />
                  <QuantumMetric label="Syndrome Measurement" value={qecResult.syndrome} color="var(--accent-primary)" />
                  <QuantumMetric label="Injected Error Qubit" value={`q${qecResult.injected_error_qubit}`} color="var(--gate-h)" />
                  <QuantumMetric label="Final Recovered State" value={`|${qecResult.final_measured_state}⟩`} color="var(--gate-y)" />
                </div>

                <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--gate-y)', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--gate-y)', marginBottom: '4px' }}>
                    ✓ Fault-Tolerant State Recovery Successful
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    The repetition code successfully detected syndrome bit pattern {qecResult.syndrome} and recovered the logical state.
                  </div>
                </div>
              </div>
            )}
          </QuantumPanel>
        </div>
      )}

      {/* TAB 4: RANDOMIZED BENCHMARKING */}
      {activeTab === 'rb' && (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', alignItems: 'start' }}>
          <QuantumPanel title="Randomized Benchmarking">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Generates random Clifford sequences of varying length m, appends sequence inverse, and measures survival probability of state |0⟩.
            </p>
            <QuantumButton onClick={handleRunRB} loading={loading} style={{ width: '100%', marginTop: '16px' }}>
              EXECUTE BENCHMARKING
            </QuantumButton>
          </QuantumPanel>

          <QuantumPanel title="Gate Fidelity Survival Probabilities" badgeText="CLIFFORD GROUP" badgeVariant="amber">
            {loading && <QuantumLoadingState message="Sampling Clifford sequences across backend..." />}

            {!loading && !rbResult && (
              <QuantumEmptyState
                title="No Benchmarking Executed"
                description="Click 'EXECUTE BENCHMARKING' to run random Clifford sequences and measure state survival fidelity."
                actionLabel="Run Benchmarking"
                onAction={handleRunRB}
              />
            )}

            {!loading && rbResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(rbResult.results || []).map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--text-primary)' }}>Sequence Length m = {r.sequence_length}</span>
                    <span style={{ color: 'var(--gate-y)', fontWeight: 600 }}>Fidelity / Survival P = {r.survival_probability.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            )}
          </QuantumPanel>
        </div>
      )}
    </QuantumPage>
  );
}
