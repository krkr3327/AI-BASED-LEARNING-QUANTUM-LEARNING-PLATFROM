import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * QECSurfaceCode3D
 * 3D Quantum Error Correction (QEC) Toric & Surface Code Lattice visualizer.
 * Styled in the website's clean, professional light theme.
 */
export default function QECSurfaceCode3D() {
  const containerRef = useRef(null);
  const [injectedErrors, setInjectedErrors] = useState([2]);
  const [isCorrected, setIsCorrected] = useState(false);

  const DATA_QUBITS = [
    { id: 0, x: -1.5, z: -1.5 }, { id: 1, x: 0, z: -1.5 }, { id: 2, x: 1.5, z: -1.5 },
    { id: 3, x: -1.5, z: 0 },    { id: 4, x: 0, z: 0 },    { id: 5, x: 1.5, z: 0 },
    { id: 6, x: -1.5, z: 1.5 },  { id: 7, x: 0, z: 1.5 },  { id: 8, x: 1.5, z: 1.5 },
  ];

  const PLAQUETTES = [
    { id: 0, center: [-0.75, -0.75], type: 'Z', qubits: [0, 1, 3, 4] },
    { id: 1, center: [0.75, -0.75], type: 'X', qubits: [1, 2, 4, 5] },
    { id: 2, center: [-0.75, 0.75], type: 'X', qubits: [3, 4, 6, 7] },
    { id: 3, center: [0.75, 0.75], type: 'Z', qubits: [4, 5, 7, 8] },
  ];

  const toggleError = (qubitId) => {
    setIsCorrected(false);
    if (injectedErrors.includes(qubitId)) {
      setInjectedErrors(injectedErrors.filter(id => id !== qubitId));
    } else {
      setInjectedErrors([...injectedErrors, qubitId]);
    }
  };

  const applyCorrection = () => {
    setIsCorrected(true);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = 340;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4.8, 5.5);
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
    dirLight.position.set(4, 8, 4);
    scene.add(dirLight);

    // 4. Lattice Grid Lines
    const gridMat = new THREE.LineBasicMaterial({ color: 0xCBD5E1 });
    for (let r of [-1.5, 0, 1.5]) {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-1.5, 0, r),
        new THREE.Vector3(1.5, 0, r)
      ]);
      scene.add(new THREE.Line(geo, gridMat));
    }
    for (let c of [-1.5, 0, 1.5]) {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(c, 0, -1.5),
        new THREE.Vector3(c, 0, 1.5)
      ]);
      scene.add(new THREE.Line(geo, gridMat));
    }

    // 5. Plaquettes (Syndromes)
    const plaquetteMeshes = [];
    PLAQUETTES.forEach((p) => {
      const hasError = !isCorrected && p.qubits.some(q => injectedErrors.includes(q));

      const pGeo = new THREE.PlaneGeometry(1.4, 1.4);
      const pColor = hasError ? 0xFEE2E2 : (p.type === 'Z' ? 0xEFF6FF : 0xF3E8FF);
      const pMat = new THREE.MeshBasicMaterial({
        color: pColor,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.rotation.x = Math.PI / 2;
      pMesh.position.set(p.center[0], -0.02, p.center[1]);
      scene.add(pMesh);

      // Plaquette border
      const borderGeo = new THREE.EdgesGeometry(pGeo);
      const borderMat = new THREE.LineBasicMaterial({
        color: hasError ? 0xE11D48 : (p.type === 'Z' ? 0x93C5FD : 0xC084FC)
      });
      const borderMesh = new THREE.LineSegments(borderGeo, borderMat);
      borderMesh.rotation.x = Math.PI / 2;
      borderMesh.position.set(p.center[0], -0.01, p.center[1]);
      scene.add(borderMesh);

      plaquetteMeshes.push({ mesh: pMesh, hasError });
    });

    // 6. Data Qubits (Spheres on Vertices)
    DATA_QUBITS.forEach((q) => {
      const isError = !isCorrected && injectedErrors.includes(q.id);

      const qGeo = new THREE.SphereGeometry(0.22, 16, 16);
      const qMat = new THREE.MeshStandardMaterial({
        color: isError ? 0xE11D48 : (isCorrected ? 0x059669 : 0x2563EB),
        roughness: 0.2,
        metalness: 0.2
      });
      const qMesh = new THREE.Mesh(qGeo, qMat);
      qMesh.position.set(q.x, 0.1, q.z);
      scene.add(qMesh);
    });

    // 7. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle camera orbit
      camera.position.x = Math.sin(elapsed * 0.2) * 1.2;
      camera.position.z = 5.5 + Math.cos(elapsed * 0.2) * 0.3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [injectedErrors, isCorrected]);

  const activeSyndromes = !isCorrected ? PLAQUETTES.filter(p => p.qubits.some(q => injectedErrors.includes(q))) : [];

  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', padding: '16px', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🧱</span> 3D Quantum Error Correction (QEC) Surface Code
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Pauli Noise Injection, Stabilizer Syndrome Detection & Recovery
          </div>
        </div>

        {/* Correction Action */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={applyCorrection}
            disabled={injectedErrors.length === 0 || isCorrected}
            style={{
              padding: '5px 12px',
              fontSize: '0.75rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: isCorrected ? '#059669' : (injectedErrors.length > 0 ? 'var(--accent-primary)' : 'var(--bg-active)'),
              color: isCorrected || injectedErrors.length > 0 ? '#FFFFFF' : 'var(--text-muted)',
              cursor: injectedErrors.length > 0 && !isCorrected ? 'pointer' : 'default',
              fontWeight: 700
            }}
          >
            {isCorrected ? '✓ Syndrome Repaired' : '⚡ Run MWPM Correction'}
          </button>
        </div>
      </div>

      {/* Qubit Error Injection buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Inject Error on Qubit:</span>
        {DATA_QUBITS.map(q => {
          const hasError = injectedErrors.includes(q.id);
          return (
            <button
              key={q.id}
              onClick={() => toggleError(q.id)}
              style={{
                padding: '3px 8px',
                fontSize: '0.7rem',
                borderRadius: '4px',
                border: hasError ? '1px solid #E11D48' : '1px solid var(--border-medium)',
                backgroundColor: hasError ? '#FEE2E2' : '#FFFFFF',
                color: hasError ? '#E11D48' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600
              }}
            >
              q[{q.id}] {hasError ? '(Error!)' : ''}
            </button>
          );
        })}
      </div>

      {/* 3D Canvas */}
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '340px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)', cursor: 'grab' }}
      />

      {/* Real-time Telemetry */}
      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Syndromes Triggered</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: activeSyndromes.length > 0 ? '#E11D48' : '#059669' }}>
            {activeSyndromes.length > 0 ? `${activeSyndromes.length} Stabilizer Violations` : '0 (Clean Logical State)'}
          </div>
        </div>

        <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Logical Qubit State</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isCorrected || injectedErrors.length === 0 ? '#059669' : '#D97706' }}>
            {isCorrected || injectedErrors.length === 0 ? 'Protected |0_L⟩' : 'Degraded by Noise'}
          </div>
        </div>

        <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)', gridColumn: 'span 2' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>QEC Stabilizer Physics</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Surface codes measure products of neighboring Pauli operators ($X \otimes X \otimes X \otimes X$ and $Z \otimes Z \otimes Z \otimes Z$). Measuring the ancilla plaquettes detects and localizes bit-flip and phase-flip errors without disturbing the encoded logical quantum state!
          </div>
        </div>
      </div>
    </div>
  );
}
