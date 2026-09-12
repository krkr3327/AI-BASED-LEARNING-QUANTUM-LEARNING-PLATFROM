import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * GroverLandscape3D
 * Visualizes Grover's search algorithm as an interactive 3D Amplitude Landscape Cityscape.
 * Styled in the website's clean, professional light theme.
 */
export default function GroverLandscape3D() {
  const containerRef = useRef(null);
  const [numStates] = useState(8);
  const [targetState, setTargetState] = useState(5); // |101>
  const [currentStep, setCurrentStep] = useState(0); // 0: Superposition, 1: Oracle, 2: Diffusion

  const STEPS = [
    {
      title: '1. Equal Superposition |s⟩',
      desc: 'Hadamard gates create uniform amplitude 1/√8 ≈ 0.354 across all 8 computational basis states.',
      color: '#2563EB'
    },
    {
      title: '2. Oracle Phase Inversion U_w',
      desc: `The oracle flips the phase of target state |${targetState.toString(2).padStart(3, '0')}⟩ from +1 to -1 (amplitude points downward).`,
      color: '#E11D48'
    },
    {
      title: '3. Diffusion Inversion About Mean (2|s⟩⟨s| - I)',
      desc: `Reflecting all amplitudes across the mean amplifies target state probability to ~88.4% while suppressing non-target states.`,
      color: '#059669'
    }
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = 340;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4.2, 8.8);
    camera.lookAt(0, 0.2, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    // 4. Subtle Grid Floor
    const gridHelper = new THREE.GridHelper(10, 10, 0xCBD5E1, 0xF1F5F9);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // 5. Calculate Amplitudes
    const equalAmp = 1 / Math.sqrt(numStates);
    const bars = [];
    const barWidth = 0.6;
    const spacing = 0.9;
    const heightScale = 3.2;

    const baseAmplitudes = [];
    for (let i = 0; i < numStates; i++) {
      if (currentStep === 0) {
        baseAmplitudes.push(equalAmp);
      } else if (currentStep === 1) {
        baseAmplitudes.push(i === targetState ? -equalAmp : equalAmp);
      } else {
        const mean = ( (numStates - 1) * equalAmp - equalAmp ) / numStates;
        const targetAmp = 2 * mean - (-equalAmp);
        const nonTargetAmp = 2 * mean - equalAmp;
        baseAmplitudes.push(i === targetState ? targetAmp : nonTargetAmp);
      }
    }

    const meanValue = baseAmplitudes.reduce((a, b) => a + b, 0) / numStates;

    // 6. Build 3D Cityscape Bars
    for (let i = 0; i < numStates; i++) {
      const amp = baseAmplitudes[i];
      const barH = Math.max(0.08, Math.abs(amp) * heightScale);
      const isTarget = i === targetState;

      const barGeo = new THREE.BoxGeometry(barWidth, barH, barWidth);
      
      let barColor = 0x2563EB; // Royal Blue
      if (isTarget) {
        barColor = currentStep === 1 ? 0xE11D48 : (currentStep === 2 ? 0x059669 : 0xD97706);
      }

      const barMat = new THREE.MeshStandardMaterial({
        color: barColor,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
        opacity: 0.92
      });

      const barMesh = new THREE.Mesh(barGeo, barMat);
      const xPos = (i - (numStates - 1) / 2) * spacing;
      
      barMesh.position.set(xPos, amp >= 0 ? barH / 2 : -barH / 2, 0);
      scene.add(barMesh);
      bars.push(barMesh);
    }

    // 7. Luminous Mean Amplitude Plane
    if (currentStep > 0) {
      const planeGeo = new THREE.PlaneGeometry(spacing * numStates + 0.8, 2.5);
      const planeMat = new THREE.MeshBasicMaterial({
        color: 0xD97706,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide
      });
      const meanPlane = new THREE.Mesh(planeGeo, planeMat);
      meanPlane.rotation.x = Math.PI / 2;
      meanPlane.position.set(0, meanValue * heightScale, 0);
      scene.add(meanPlane);
    }

    // 8. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle camera sway
      camera.position.x = Math.sin(elapsed * 0.25) * 1.2;
      camera.position.z = 8.8 + Math.cos(elapsed * 0.25) * 0.3;
      camera.lookAt(0, 0.4, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [currentStep, targetState, numStates]);

  const targetProb = currentStep === 2 ? '88.4%' : '12.5%';

  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', padding: '16px', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏙️</span> 3D Grover Amplitude Cityscape
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Quantum Oracle Phase Inversion & Inversion About the Mean
          </div>
        </div>

        {/* Step Selector */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {STEPS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              style={{
                padding: '4px 10px',
                fontSize: '0.72rem',
                borderRadius: '6px',
                border: currentStep === idx ? `1px solid ${s.color}` : '1px solid var(--border-medium)',
                backgroundColor: currentStep === idx ? '#EFF6FF' : '#FFFFFF',
                color: currentStep === idx ? s.color : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              Step {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Target state picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target State:</span>
        <select
          value={targetState}
          onChange={(e) => setTargetState(Number(e.target.value))}
          style={{
            backgroundColor: '#FFFFFF',
            color: 'var(--accent-primary)',
            border: '1px solid var(--border-medium)',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <option key={i} value={i}>
              |{i.toString(2).padStart(3, '0')}⟩ (Item #{i})
            </option>
          ))}
        </select>
      </div>

      {/* 3D Canvas */}
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '340px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)', cursor: 'grab' }}
      />

      {/* Real-time Math & Telemetry */}
      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Operator</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: STEPS[currentStep].color }}>{STEPS[currentStep].title}</div>
        </div>

        <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Match Probability</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: currentStep === 2 ? '#059669' : 'var(--accent-primary)' }}>
            {targetProb}
          </div>
        </div>

        <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)', gridColumn: 'span 2' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Quantum Physics Intuition</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{STEPS[currentStep].desc}</div>
        </div>
      </div>
    </div>
  );
}
