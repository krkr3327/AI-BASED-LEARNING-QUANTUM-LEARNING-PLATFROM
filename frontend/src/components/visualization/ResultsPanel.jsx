import React, { useState } from 'react';
import ProbabilityVisualization from './ProbabilityVisualization';
import StatevectorVisualization from './StatevectorVisualization';
import QuantumTracePlayer from './QuantumTracePlayer';
import BlochSphere3D from './BlochSphere3D';
import InterferenceVisualization from './InterferenceVisualization';
import EntanglementWeb3D from './EntanglementWeb3D';
import GroverLandscape3D from './GroverLandscape3D';
import QuantumTeleportation3D from './QuantumTeleportation3D';
import QECSurfaceCode3D from './QECSurfaceCode3D';

export default function ResultsPanel({ simResult, isStale }) {
  const [activeTab, setActiveTab] = useState('Process');

  return (
    <div className="lab-main" style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#FFFFFF' }}>
      <div className="lab-tabs" style={{ padding: '0 16px', overflowX: 'auto', flexShrink: 0, whiteSpace: 'nowrap', display: 'flex', gap: '4px', backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)' }}>
        {[
          { id: 'Process', label: 'Step Trace' },
          { id: 'Bloch', label: '3D Bloch' },
          { id: 'Entanglement3D', label: '3D Entangle Web' },
          { id: 'Grover3D', label: '3D Grover City' },
          { id: 'Teleport3D', label: '3D Teleport' },
          { id: 'QEC3D', label: '3D QEC Code' },
          { id: 'Probabilities', label: 'Probabilities' },
          { id: 'Interference', label: 'Phase & Wave' },
          { id: 'Statevector', label: 'Statevector' },
          { id: 'Results', label: 'Summary' },
          { id: 'Amplitudes', label: 'Amplitudes' }
        ].map(tab => (
          <div
            key={tab.id}
            className={`lab-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)',
              backgroundColor: activeTab === tab.id ? '#FFFFFF' : 'transparent',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </div>
        ))}
      </div>

      <div className="lab-content" style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: '#FFFFFF' }}>
        {isStale && (
          <div style={{
            marginBottom: '16px',
            padding: '10px 14px',
            backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '6px',
            color: '#B45309',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span>
            <span>Circuit modified — execution results may be stale. Re-run simulation to update backend state.</span>
          </div>
        )}

        {/* Process Trace Tab */}
        {activeTab === 'Process' && (
          <div style={{ animation: 'fadeIn 0.2s ease', minHeight: '400px' }}>
            <QuantumTracePlayer
              trace={simResult?.execution_trace ?? []}
              numQubits={simResult?.num_qubits ?? 1}
              traceCapability={simResult?.trace_capability ?? 'unavailable'}
              traceReason={simResult?.trace_reason}
            />
          </div>
        )}

        {/* Results Summary Tab */}
        {activeTab === 'Results' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            {simResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>Simulation Status</h4>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 14px',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '6px',
                    color: '#15803D',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
                    {simResult.status.toUpperCase()}
                  </div>
                </div>
                
                <div>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>Sampled Measurement Outcome</h4>
                  <div style={{
                    padding: '16px 24px',
                    backgroundColor: '#F8FAFC',
                    border: '1.5px solid var(--accent-primary)',
                    borderRadius: '8px',
                    display: 'inline-block'
                  }}>
                    <h2 style={{
                      color: 'var(--accent-primary)', 
                      fontSize: '2.5rem', 
                      margin: 0,
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.05em'
                    }}>
                      |{simResult.measurement || 'None'}⟩
                    </h2>
                  </div>
                </div>
                
                <div>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>Execution Backend Engine</h4>
                  <p style={{
                    fontSize: '0.95rem', 
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    margin: 0
                  }}>{simResult.backend_name}</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '260px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>Run a circuit simulation to inspect backend outcomes.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Probabilities Tab */}
        {activeTab === 'Probabilities' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <ProbabilityVisualization probabilities={simResult?.probabilities} />
          </div>
        )}

        {/* Interference & Phase Tab */}
        {activeTab === 'Interference' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <InterferenceVisualization statevector={simResult?.statevector} probabilities={simResult?.probabilities} />
          </div>
        )}

        {/* Statevector Tab */}
        {activeTab === 'Statevector' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <StatevectorVisualization statevector={simResult?.statevector} numQubits={simResult?.num_qubits} />
          </div>
        )}

        {/* Bloch Sphere Tab */}
        {activeTab === 'Bloch' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <BlochSphere3D statevector={simResult?.statevector} />
          </div>
        )}

        {/* 3D Entanglement Web Tab */}
        {activeTab === 'Entanglement3D' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <EntanglementWeb3D simResult={simResult} numQubits={simResult?.num_qubits ?? 2} />
          </div>
        )}

        {/* 3D Grover Cityscape Tab */}
        {activeTab === 'Grover3D' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <GroverLandscape3D />
          </div>
        )}

        {/* 3D Quantum Teleportation Tab */}
        {activeTab === 'Teleport3D' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <QuantumTeleportation3D />
          </div>
        )}

        {/* 3D QEC Surface Code Tab */}
        {activeTab === 'QEC3D' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <QECSurfaceCode3D />
          </div>
        )}

        {/* Amplitudes Table Tab */}
        {activeTab === 'Amplitudes' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            {simResult?.statevector ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 {simResult.statevector.slice(0, 16).map((amp, idx) => {
                    const binaryStr = idx.toString(2).padStart(simResult.num_qubits, '0');
                    const magnitude = Math.sqrt(amp.real*amp.real + amp.imag*amp.imag);
                    const phase = Math.atan2(amp.imag, amp.real);
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-primary)', width: '60px' }}>|{binaryStr}⟩</div>
                        <div style={{ flex: 1, height: '12px', backgroundColor: '#E2E8F0', borderRadius: '6px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', 
                            width: `${magnitude * 100}%`, 
                            backgroundColor: 'var(--accent-primary)',
                            borderRadius: '4px'
                          }} />
                        </div>
                        <div style={{ width: '220px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          <div>Re: {amp.real >= 0 ? `+${amp.real.toFixed(3)}` : amp.real.toFixed(3)}, Im: {amp.imag >= 0 ? `+${amp.imag.toFixed(3)}` : amp.imag.toFixed(3)}</div>
                          <div>|α|: {magnitude.toFixed(3)}, φ: {(phase * (180/Math.PI)).toFixed(1)}°</div>
                        </div>
                      </div>
                    );
                 })}
                 {simResult.statevector.length > 16 && (
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                     Displaying top 16 of {simResult.statevector.length} total basis state amplitudes.
                   </div>
                 )}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>Run a simulation to view quantum amplitudes table.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
