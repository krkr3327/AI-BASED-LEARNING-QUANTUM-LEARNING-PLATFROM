import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * QuantumTeleportation3D
 * Cinematic 3D interactive pipeline for Quantum Teleportation.
 * Styled in the website's clean, professional light theme.
 */
export default function QuantumTeleportation3D() {
  const containerRef = useRef(null);
  const [stage, setStage] = useState(0);

  const STAGES = [
    {
      title: '1. Prepare Input State |ψ⟩',
      desc: 'Alice holds an unknown quantum state |ψ⟩ = α|0⟩ + β|1⟩ to teleport to Bob without transmitting the physical qubit.',
      color: '#2563EB'
    },
    {
      title: '2. Generate Shared Bell Pair |Φ⁺⟩',
      desc: 'An EPR source creates entangled pair (|00⟩+|11⟩)/√2. Qubit A goes to Alice; Qubit B goes to Bob.',
      color: '#7C3AED'
    },
    {
      title: '3. Alice Performs Bell-State Measurement',
      desc: 'Alice applies CNOT and Hadamard on (|ψ⟩, A) and measures both qubits, collapsing |ψ⟩ into 2 classical bits (m₀, m₁).',
      color: '#E11D48'
    },
    {
      title: '4. Classical Transmission (m₀, m₁)',
      desc: 'Alice transmits the two classical bits through a standard fiber channel to Bob (No Faster-Than-Light signaling).',
      color: '#D97706'
    },
    {
      title: '5. Bob Applies Corrective Gates (Xᵐ¹ Zᵐ⁰)',
      desc: 'Bob applies unitary X and/or Z rotations based on (m₀, m₁). Bob’s qubit transforms identically into |ψ⟩ with 100% fidelity!',
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
    camera.position.set(0, 3.2, 9.2);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    // 4. Stations (Alice on Left, Bob on Right)
    const createStation = (x, color, label) => {
      const group = new THREE.Group();
      group.position.set(x, 0, 0);

      // Clean Slate/White Pedestal
      const baseGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.25, 32);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0xF1F5F9, metalness: 0.1, roughness: 0.3 });
      group.add(new THREE.Mesh(baseGeo, baseMat));

      // Glow Ring
      const ringGeo = new THREE.TorusGeometry(1.25, 0.03, 16, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.13;
      group.add(ring);

      scene.add(group);
      return group;
    };

    createStation(-3.5, 0x2563EB, 'Alice');
    createStation(3.5, 0x059669, 'Bob');

    // 5. Qubit Spheres
    const psiGeo = new THREE.SphereGeometry(0.5, 24, 24);
    const psiMat = new THREE.MeshStandardMaterial({
      color: 0x2563EB,
      metalness: 0.2,
      roughness: 0.2,
      transparent: true,
      opacity: stage >= 3 ? 0.3 : 1.0
    });
    const psiQubit = new THREE.Mesh(psiGeo, psiMat);
    psiQubit.position.set(-3.5, 1.1, 0);
    scene.add(psiQubit);

    // Bob's Target Qubit
    const bobQubitMat = new THREE.MeshStandardMaterial({
      color: stage === 4 ? 0x059669 : 0x94A3B8,
      metalness: 0.2,
      roughness: 0.2,
      transparent: true,
      opacity: 0.95
    });
    const bobQubit = new THREE.Mesh(psiGeo, bobQubitMat);
    bobQubit.position.set(3.5, 1.1, 0);
    scene.add(bobQubit);

    // 6. Connecting Fiber Curves
    // Entangled Channel (Bottom)
    const eprCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-3.5, 0.2, 0),
      new THREE.Vector3(0, -1.0, 0.8),
      new THREE.Vector3(3.5, 0.2, 0)
    );
    const eprTubeGeo = new THREE.TubeGeometry(eprCurve, 32, 0.03, 8, false);
    const eprTubeMat = new THREE.MeshBasicMaterial({
      color: stage >= 1 ? 0x7C3AED : 0xE2E8F0,
      transparent: true,
      opacity: stage >= 1 ? 0.85 : 0.4
    });
    scene.add(new THREE.Mesh(eprTubeGeo, eprTubeMat));

    // Classical Channel (Top)
    const classicalCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-3.5, 2.0, 0),
      new THREE.Vector3(0, 3.0, -0.4),
      new THREE.Vector3(3.5, 2.0, 0)
    );
    const classicalTubeGeo = new THREE.TubeGeometry(classicalCurve, 32, 0.03, 8, false);
    const classicalTubeMat = new THREE.MeshBasicMaterial({
      color: stage >= 3 ? 0xD97706 : 0xE2E8F0,
      transparent: true,
      opacity: stage >= 3 ? 0.85 : 0.4
    });
    scene.add(new THREE.Mesh(classicalTubeGeo, classicalTubeMat));

    // 7. Animated Classical Packet
    const packetGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const packetMat = new THREE.MeshBasicMaterial({ color: 0xD97706 });
    const packet = new THREE.Mesh(packetGeo, packetMat);
    packet.visible = stage === 3;
    scene.add(packet);

    // 8. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Qubit hover
      psiQubit.position.y = 1.1 + Math.sin(elapsed * 2) * 0.06;
      bobQubit.position.y = 1.1 + Math.cos(elapsed * 2) * 0.06;

      // Particle packet movement during stage 3
      if (stage === 3) {
        const t = (elapsed * 0.7) % 1.0;
        const pt = classicalCurve.getPoint(t);
        packet.position.copy(pt);
      }

      if (stage === 4) {
        bobQubit.rotation.y += 0.03;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [stage]);

  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', padding: '16px', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📡</span> 3D Quantum Teleportation Pipeline
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            EPR Quantum Channel Transmission & Exact State Reconstruction
          </div>
        </div>

        {/* Stage Timeline */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {STAGES.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setStage(idx)}
              style={{
                padding: '4px 9px',
                fontSize: '0.72rem',
                borderRadius: '6px',
                border: stage === idx ? `1px solid ${s.color}` : '1px solid var(--border-medium)',
                backgroundColor: stage === idx ? '#EFF6FF' : '#FFFFFF',
                color: stage === idx ? s.color : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              Step {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Canvas */}
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '340px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)', cursor: 'grab' }}
      />

      {/* Real-time Telemetry */}
      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Protocol Phase</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: STAGES[stage].color }}>{STAGES[stage].title}</div>
        </div>

        <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fidelity on Bob's Station</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: stage === 4 ? '#059669' : 'var(--text-muted)' }}>
            {stage === 4 ? '100.0% (|ψ⟩ Reconstituted)' : 'Awaiting Transmission'}
          </div>
        </div>

        <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)', gridColumn: 'span 2' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Quantum Physics Intuition</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{STAGES[stage].desc}</div>
        </div>
      </div>
    </div>
  );
}
