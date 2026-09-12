/**
 * QuantumTracePlayer — Generic Quantum State Evolution Visualizer
 *
 * ARCHITECTURAL CONTRACT:
 * This component receives an ExecutionTrace (List[TraceStep]) produced by
 * real backend execution and renders it as an animated visualization.
 *
 * WHAT THIS COMPONENT DOES:
 * - Reads TraceStep[currentStep].statevector_before and statevector_after
 * - Derives magnitude, phase, and probability from those complex amplitudes
 * - Generates intermediate animation frames for smooth visual transitions
 * - Renders amplitude bars, phase colors, and measurement collapse
 *
 * WHAT THIS COMPONENT DOES NOT DO:
 * - It does NOT perform quantum simulation
 * - It does NOT know the circuit name, algorithm name, or gate identity
 * - It does NOT have special cases for Bell, Grover, QFT, CNOT, H, etc.
 * - It does NOT hardcode expected amplitudes, probabilities, or outcomes
 *
 * VISUAL INTERPOLATION WARNING (documented per spec):
 * The frames between statevector_before and statevector_after are
 * GRAPHICS FRAMES ONLY. They are NOT additional quantum-mechanical states.
 * Quantum gate application is a discrete operation — there is no continuous
 * quantum evolution between gate applications in physical reality.
 * The interpolation exists purely for visual smoothness.
 * The source of truth is always the recorded before/after snapshots from the backend.
 *
 * MEASUREMENT COLLAPSE:
 * When step.is_measurement === true, the collapse animation target is
 * step.measurement_result — the actual bits returned by the backend's
 * stochastic sampler. This value is never hardcoded by this renderer.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';

// ── Math utilities ────────────────────────────────────────────────────────────

/** Linear interpolation between two scalars. */
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Interpolate between two angles (radians) via shortest angular path.
 * Handles phase wrapping at ±π boundary.
 * This is used for visual color interpolation only.
 */
const lerpAngle = (a, b, t) => {
  let diff = b - a;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return a + diff * t;
};

/**
 * Map a phase angle [-π, π] to an HSL hue [0, 360].
 * This is a pure visual mapping — not a quantum calculation.
 */
const phaseToHue = (phase) => ((phase + Math.PI) / (2 * Math.PI)) * 360;

/**
 * Derive magnitude and phase from a complex amplitude {real, imag}.
 * These are standard mathematical derivations from the actual statevector data.
 */
const getAmpInfo = (amp) => {
  const mag = Math.sqrt(amp.real * amp.real + amp.imag * amp.imag);
  const phase = Math.atan2(amp.imag, amp.real);
  return { mag, phase, prob: mag * mag };
};

// ── Canvas renderer ───────────────────────────────────────────────────────────

/**
 * Render the current interpolated state onto a 2D canvas.
 * All visual data is derived from the TraceStep statevectors — never hardcoded.
 *
 * @param ctx - Canvas 2D context
 * @param svBefore - statevector_before from current TraceStep
 * @param svAfter - statevector_after from current TraceStep
 * @param numQubits - number of qubits (determines basis state count = 2^n)
 * @param t - animation progress [0, 1]
 * @param step - current TraceStep object
 * @param isMeasCollapse - whether this is the measurement collapse phase
 * @param collapseTarget - index of surviving basis state (from actual measurement_result)
 */
function renderFrame(ctx, svBefore, svAfter, numQubits, t, step, isMeasCollapse, collapseTarget) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const numStates = svBefore.length;  // 2^numQubits — derived from actual data, not hardcoded

  ctx.clearRect(0, 0, W, H);

  // Clean light canvas background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  if (numStates === 0) return;

  const padding = { left: 60, right: 20, top: 30, bottom: 50 };
  const plotW = W - padding.left - padding.right;
  const plotH = H - padding.top - padding.bottom;

  // Y-axis grid lines & labels (drawn behind bars)
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  for (let p = 0; p <= 1; p += 0.25) {
    const gy = padding.top + plotH * (1 - p);
    ctx.beginPath();
    ctx.moveTo(padding.left, gy);
    ctx.lineTo(W - padding.right, gy);
    ctx.stroke();
    ctx.fillStyle = '#64748B';
    ctx.font = '500 10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${(p * 100).toFixed(0)}%`, padding.left - 6, gy + 3);
  }

  const barW = Math.min(plotW / numStates - 6, 80);
  const barSpacing = plotW / numStates;

  for (let i = 0; i < numStates; i++) {
    const ampB = svBefore[i] || { real: 0, imag: 0 };
    const ampA = svAfter[i] || { real: 0, imag: 0 };
    const { phase: phB, prob: probB } = getAmpInfo(ampB);
    const { phase: phA, prob: probA } = getAmpInfo(ampA);

    let displayProb, displayPhase, alpha;

    if (isMeasCollapse) {
      const isSurvivor = collapseTarget === i;
      if (isSurvivor) {
        displayProb = t < 0.4 ? probB :
                      t < 0.7 ? lerp(probB, 1.0, (t - 0.4) / 0.3) :
                      lerp(1.0, 1.0, 1.0);
        alpha = 1.0;
      } else {
        displayProb = t < 0.4 ? probB :
                      t < 0.7 ? lerp(probB, 0, (t - 0.4) / 0.3) : 0;
        alpha = t < 0.4 ? 1.0 :
                t < 0.7 ? lerp(1.0, 0.1, (t - 0.4) / 0.3) : 0.05;
      }
      displayPhase = phB;
    } else {
      displayProb = lerp(probB, probA, t);
      displayPhase = lerpAngle(phB, phA, t);
      alpha = 1.0;
    }

    const barH = displayProb * plotH;
    const x = padding.left + i * barSpacing + (barSpacing - barW) / 2;
    const y = padding.top + plotH - barH;

    // Phase-based color mapping for light theme
    const hue = phaseToHue(displayPhase);
    const saturation = 75;
    const lightness = 48;

    // Bar fill with light gradient
    const grad = ctx.createLinearGradient(x, y, x, y + barH);
    grad.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`);
    grad.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness + 12}%, ${alpha * 0.85})`);
    ctx.fillStyle = grad;
    
    // Rounded bar top
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]) : ctx.rect(x, y, barW, barH);
    ctx.fill();

    // QUANTUM AMPLITUDE WAVE FIELD: Render phase wave
    if (displayProb > 0.005) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const points = 16;
      for (let pt = 0; pt <= points; pt++) {
        const px = x + (pt / points) * barW;
        const phaseOffset = displayPhase + (pt / points) * Math.PI * 2;
        const waveAmp = (Math.sqrt(displayProb) * barH * 0.22);
        const py = (y + barH / 2) + Math.sin(phaseOffset) * waveAmp;
        if (pt === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Basis state label: dark slate font
    const basisLabel = `|${i.toString(2).padStart(numQubits, '0')}⟩`;
    ctx.fillStyle = `rgba(15, 23, 42, ${alpha})`;
    ctx.font = `600 ${Math.max(10, Math.min(13, barSpacing - 4))}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(basisLabel, x + barW / 2, padding.top + plotH + 20);

    // Probability percentage
    if (displayProb > 0.01) {
      ctx.fillStyle = `rgba(15, 23, 42, ${alpha * 0.95})`;
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`${(displayProb * 100).toFixed(1)}%`, x + barW / 2, y - 6);
    }
  }

  // Header Title for Canvas
  ctx.fillStyle = '#2563EB';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('QUANTUM AMPLITUDE WAVE FIELD — STATE EVOLUTION', padding.left, padding.top - 12);
}

// ── Main component ────────────────────────────────────────────────────────────

export default function QuantumTracePlayer({ trace, numQubits, traceCapability, traceReason }) {
  // ALL hooks must be declared before any conditional return (Rules of Hooks)
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animProgress, setAnimProgress] = useState(1.0);
  const [speed, setSpeed] = useState(1.0);
  const animState = useRef({ progress: 1.0, step: 0, playing: false, speed: 1.0 });

  const capStr = typeof traceCapability === 'object' ? traceCapability?.capability : traceCapability;
  const isUnavailable = capStr !== 'full' || !trace || trace.length === 0;
  const totalSteps = isUnavailable ? 0 : trace.length;

  // Derive step info generically from trace data (no circuit-specific logic)
  const getStepInfo = useCallback((stepIdx) => {
    if (!trace || !trace[stepIdx]) return null;
    const step = trace[stepIdx];
    return {
      step,
      svBefore: step.statevector_before || [],
      svAfter: step.statevector_after || [],
      isMeasurement: step.is_measurement || false,
      isReset: step.is_reset || false,
      isConditional: step.is_conditional || false,
      conditionalExecuted: step.conditional_executed,
      measurementResult: step.measurement_result,
      collapseTarget: step.measurement_result
        ? parseInt(step.measurement_result.join(''), 2)
        : null,
    };
  }, [trace]);

  // Sync animState ref to React state
  useEffect(() => {
    animState.current.step = currentStep;
    animState.current.progress = animProgress;
    animState.current.playing = isPlaying;
    animState.current.speed = speed;
  }, [currentStep, animProgress, isPlaying, speed]);

  // Animation loop — requestAnimationFrame driven, no setInterval
  useEffect(() => {
    if (isUnavailable) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let lastTime = null;

    const loop = (timestamp) => {
      const state = animState.current;
      const info = getStepInfo(state.step);
      if (!info) {
        animRef.current = requestAnimationFrame(loop);
        return;
      }

      if (state.playing && state.progress < 1.0) {
        if (lastTime !== null) {
          const dt = (timestamp - lastTime) / 1000;
          const newProgress = Math.min(1.0, state.progress + dt * state.speed * 0.8);
          state.progress = newProgress;
          setAnimProgress(newProgress);
        }
        lastTime = timestamp;
      } else {
        lastTime = null;
        if (state.playing && state.progress >= 1.0) {
          if (state.step < totalSteps - 1) {
            const nextStep = state.step + 1;
            state.step = nextStep;
            state.progress = 0.0;
            setCurrentStep(nextStep);
            setAnimProgress(0.0);
          } else {
            state.playing = false;
            setIsPlaying(false);
          }
        }
      }

      // Render current frame from actual trace data
      renderFrame(
        ctx,
        info.svBefore,
        info.svAfter,
        numQubits,
        state.progress,
        info.step,
        info.isMeasurement,
        info.collapseTarget
      );

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [trace, numQubits, totalSteps, isUnavailable, getStepInfo]);

  // Resize canvas on mount
  useEffect(() => {
    if (isUnavailable) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [isUnavailable]);

  // Controls
  const goToStep = (idx) => {
    const clamped = Math.max(0, Math.min(totalSteps - 1, idx));
    animState.current.step = clamped;
    animState.current.progress = 1.0;
    setCurrentStep(clamped);
    setAnimProgress(1.0);
  };

  const togglePlay = () => {
    const newPlaying = !isPlaying;
    if (newPlaying && animProgress >= 1.0 && currentStep >= totalSteps - 1) {
      // Replay from beginning
      goToStep(0);
      animState.current.progress = 0.0;
      setAnimProgress(0.0);
    } else if (newPlaying && animProgress >= 1.0 && currentStep < totalSteps - 1) {
      // Advance to next step and play
      const next = currentStep + 1;
      animState.current.step = next;
      animState.current.progress = 0.0;
      setCurrentStep(next);
      setAnimProgress(0.0);
    }
    animState.current.playing = newPlaying;
    setIsPlaying(newPlaying);
  };

  // Current step info for header display
  const info = getStepInfo(currentStep);
  const stepLabel = info ? (() => {
    const s = info.step;
    // Derive display from actual trace data — no circuit name, no algorithm name
    let label = s.operation_name.toUpperCase();
    if (s.qubits && s.qubits.length > 0) {
      label += `(q${s.qubits.join(', q')})`;
    }
    if (s.parameters) {
      const paramStr = Object.entries(s.parameters)
        .filter(([k]) => k !== 'cbits')
        .map(([k, v]) => `${k}=${typeof v === 'number' ? v.toFixed(3) : v}`)
        .join(', ');
      if (paramStr) label += ` [${paramStr}]`;
    }
    return label;
  })() : '';

  const isSkipped = info?.isConditional && info?.conditionalExecuted === false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      {/* Unavailable trace message — shown instead of player when trace is not available */}
      {isUnavailable && (
        <div style={{
          padding: '32px', textAlign: 'center', color: 'var(--text-muted)',
          border: '1px solid var(--border-subtle)', borderRadius: '12px',
          backgroundColor: 'rgba(5,5,15,0.4)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px', opacity: 0.4 }}>◎</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Process Trace Unavailable
          </div>
          <div style={{ fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
            {traceReason || 'Intermediate state snapshots were not available from this backend execution.'}
          </div>
          <div style={{
            marginTop: '16px', padding: '8px 16px', display: 'inline-block',
            backgroundColor: 'rgba(255,200,0,0.1)', border: '1px solid rgba(255,200,0,0.3)',
            borderRadius: '6px', color: 'rgba(255,200,0,0.8)', fontSize: '0.8rem', fontFamily: 'monospace'
          }}>
            trace_capability: {capStr || 'unavailable'}
          </div>
          <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', opacity: 0.7 }}>
            Run with custom_m1, qiskit_aer, or cirq for full process visualization.
          </div>
        </div>
      )}

      {/* Player — only rendered when trace is available */}
      {!isUnavailable && (<>
      {/* Step header — all data derived from trace, no circuit-specific display */}
      <div style={{
        padding: '12px 18px',
        backgroundColor: '#EFF6FF',
        border: '1px solid #BFDBFE',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            STEP {currentStep + 1} / {totalSteps}
          </div>
          <div style={{
            color: '#1E3A8A',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.95rem',
            fontWeight: 700,
          }}>
            {stepLabel}
          </div>
          {isSkipped && (
            <div style={{
              padding: '2px 8px', borderRadius: '4px',
              backgroundColor: '#FEF3C7',
              border: '1px solid #FCD34D',
              color: '#92400E',
              fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600
            }}>
              CONDITIONAL SKIPPED
            </div>
          )}
          {info?.isMeasurement && (
            <div style={{
              padding: '2px 8px', borderRadius: '4px',
              backgroundColor: '#FEE2E2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700
            }}>
              MEASUREMENT → |{info.measurementResult?.join('') || '?'}⟩
            </div>
          )}
          {info?.isReset && (
            <div style={{
              padding: '2px 8px', borderRadius: '4px',
              backgroundColor: '#E0F2FE',
              border: '1px solid #BAE6FD',
              color: '#0369A1',
              fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600
            }}>
              RESET
            </div>
          )}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          {info?.step?.backend || ''} · provenance: {info?.step?.provenance || ''}
        </div>
      </div>

      {/* Interpolation disclaimer */}
      <div style={{
        padding: '6px 12px',
        backgroundColor: '#FFFBEB',
        border: '1px solid #FDE68A',
        borderRadius: '6px',
        fontSize: '0.75rem',
        color: '#92400E',
        fontFamily: 'var(--font-mono)',
      }}>
        ⚠ Visual interpolation between gate snapshots — not quantum simulation. Source: real backend execution trace.
      </div>

      {/* Canvas — generic statevector visualization, all data from trace */}
      <canvas
        ref={canvasRef}
        style={{
          flex: 1,
          width: '100%',
          minHeight: '220px',
          borderRadius: '8px',
          border: '1px solid var(--border-medium)',
          backgroundColor: '#FFFFFF',
          boxShadow: 'var(--shadow-xs)',
          cursor: 'pointer',
        }}
        onClick={togglePlay}
      />

      {/* Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        padding: '4px 0'
      }}>
        {/* Step timeline dots */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', overflowX: 'auto', maxWidth: '280px' }}>
          {trace.map((_, i) => (
            <button
              key={i}
              onClick={() => goToStep(i)}
              title={`Step ${i + 1}: ${trace[i]?.operation_name}`}
              style={{
                width: i === currentStep ? '16px' : '8px',
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: i === currentStep
                  ? 'var(--accent-primary)'
                  : trace[i]?.is_measurement
                    ? '#EF4444'
                    : '#CBD5E1',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn" onClick={() => goToStep(0)} title="Reset to start" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>⏮</button>
          <button className="btn" onClick={() => goToStep(currentStep - 1)} title="Previous step" disabled={currentStep === 0} style={{ padding: '6px 10px', fontSize: '0.8rem' }}>⏪</button>
          <button
            className="btn btn-primary"
            onClick={togglePlay}
            style={{ minWidth: '64px', padding: '6px 14px', fontSize: '0.85rem' }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className="btn" onClick={() => goToStep(currentStep + 1)} title="Next step" disabled={currentStep >= totalSteps - 1} style={{ padding: '6px 10px', fontSize: '0.8rem' }}>⏩</button>
          <button className="btn" onClick={() => goToStep(totalSteps - 1)} title="Go to end" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>⏭</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Speed:</span>
          <input
            type="range"
            min="0.25"
            max="4.0"
            step="0.25"
            value={speed}
            onChange={e => { const v = parseFloat(e.target.value); animState.current.speed = v; setSpeed(v); }}
            style={{ width: '80px', accentColor: 'var(--accent-primary)' }}
          />
          <span style={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', minWidth: '30px', fontWeight: 600 }}>{speed}×</span>
        </div>
      </div>

      {/* Phase & Interference Matrix for Current Step */}
      {info && info.svBefore && info.svBefore.length > 0 && (
        <div style={{
          marginTop: '8px',
          padding: '16px',
          backgroundColor: '#F8FAFC',
          border: '1px solid var(--border-medium)',
          borderRadius: '8px',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-mono)',
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            AMPLITUDE & INTERFERENCE MATRIX — STEP {currentStep + 1}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {info.svBefore.map((ampB, i) => {
              const ampA = info.svAfter[i] || { real: 0, imag: 0 };
              const magB = Math.sqrt(ampB.real * ampB.real + ampB.imag * ampB.imag);
              const magA = Math.sqrt(ampA.real * ampA.real + ampA.imag * ampA.imag);
              const probB = magB * magB;
              const probA = magA * magA;
              const phB = Math.atan2(ampB.imag, ampB.real);
              const phA = Math.atan2(ampA.imag, ampA.real);
              const deltaP = probA - probB;
              const deltaPh = Math.abs(phA - phB);

              let tag = 'INVARIANT';
              let tagColor = 'var(--text-muted)';
              let tagBg = '#F1F5F9';
              if (deltaP > 0.001) { tag = 'CONSTRUCTIVE ▲'; tagColor = '#15803D'; tagBg = '#DCFCE7'; }
              else if (deltaP < -0.001) { tag = 'DESTRUCTIVE ▼'; tagColor = '#B91C1C'; tagBg = '#FEE2E2'; }
              else if (deltaPh > 0.01) { tag = 'PHASE SHIFT ↻'; tagColor = '#B45309'; tagBg = '#FEF3C7'; }

              const label = `|${i.toString(2).padStart(numQubits, '0')}⟩`;

              return (
                <div key={i} style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-xs)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{label}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: tagColor, backgroundColor: tagBg, padding: '2px 6px', borderRadius: '4px' }}>{tag}</span>
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 600 }}>
                    P: {(probA * 100).toFixed(1)}% <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({(probB * 100).toFixed(1)}% pre)</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '2px' }}>
                    Phase: {(phA * 180 / Math.PI).toFixed(0)}° / {phA.toFixed(2)}rad
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </>)}
    </div>
  );
}
