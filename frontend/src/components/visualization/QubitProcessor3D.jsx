import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { QuantumPanel } from '../ui/QuantumPrimitives';

const QUBIT_SPECS = [
  { id: 0, name: 'Qubit Q0', freq: '4.912 GHz', t1: '112 μs', t2: '94 μs', fidelity: '99.95%', pos: [-1.2, 0, -1.2] },
  { id: 1, name: 'Qubit Q1', freq: '5.148 GHz', t1: '128 μs', t2: '105 μs', fidelity: '99.92%', pos: [1.2, 0, -1.2] },
  { id: 2, name: 'Qubit Q2 (Center)', freq: '5.024 GHz', t1: '145 μs', t2: '118 μs', fidelity: '99.97%', pos: [0, 0, 0] },
  { id: 3, name: 'Qubit Q3', freq: '4.885 GHz', t1: '108 μs', t2: '89 μs', fidelity: '99.89%', pos: [-1.2, 0, 1.2] },
  { id: 4, name: 'Qubit Q4', freq: '5.210 GHz', t1: '135 μs', t2: '110 μs', fidelity: '99.94%', pos: [1.2, 0, 1.2] }
];

export default function QubitProcessor3D({ height = 340 }) {
  const containerRef = useRef(null);
  const [selectedQubit, setSelectedQubit] = useState(QUBIT_SPECS[2]);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 450;
    const h = height;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF);

    const camera = new THREE.PerspectiveCamera(40, width / h, 0.1, 100);
    camera.position.set(0, 4.2, 4.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x3B82F6, 1.2);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const chipGroup = new THREE.Group();
    scene.add(chipGroup);

    // Silicon / Sapphire Substrate Wafer
    const substrateGeom = new THREE.BoxGeometry(4.2, 0.15, 4.2);
    const substrateMat = new THREE.MeshStandardMaterial({
      color: 0x1E293B,
      metalness: 0.3,
      roughness: 0.1,
    });
    const substrateMesh = new THREE.Mesh(substrateGeom, substrateMat);
    substrateMesh.position.y = -0.08;
    chipGroup.add(substrateMesh);

    // Ground Plane Niobium Film (Metallic top)
    const filmGeom = new THREE.BoxGeometry(4.0, 0.02, 4.0);
    const filmMat = new THREE.MeshStandardMaterial({
      color: 0x64748B,
      metalness: 0.85,
      roughness: 0.2,
    });
    const filmMesh = new THREE.Mesh(filmGeom, filmMat);
    filmMesh.position.y = 0.01;
    chipGroup.add(filmMesh);

    // CPW Resonator Waveguide Buses (Connecting center Q2 to outer qubits)
    const waveguideMat = new THREE.MeshBasicMaterial({ color: 0x93C5FD });
    QUBIT_SPECS.forEach((q) => {
      if (q.id === 2) return;
      const points = [
        new THREE.Vector3(0, 0.03, 0),
        new THREE.Vector3(q.pos[0] * 0.5, 0.03, q.pos[2] * 0.5 + 0.2),
        new THREE.Vector3(q.pos[0], 0.03, q.pos[2])
      ];
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeom = new THREE.TubeGeometry(curve, 32, 0.025, 8, false);
      const tubeMesh = new THREE.Mesh(tubeGeom, waveguideMat);
      chipGroup.add(tubeMesh);
    });

    // Transmon Qubit Cross-Pads & Josephson Junctions
    const qubitMeshes = [];
    QUBIT_SPECS.forEach((q) => {
      const qGroup = new THREE.Group();
      qGroup.position.set(q.pos[0], 0.04, q.pos[2]);

      // Cross pad horizontal & vertical
      const crossGeom1 = new THREE.BoxGeometry(0.5, 0.03, 0.14);
      const crossGeom2 = new THREE.BoxGeometry(0.14, 0.03, 0.5);
      const crossMat = new THREE.MeshStandardMaterial({
        color: q.id === selectedQubit.id ? 0x2563EB : 0xD97706,
        metalness: 0.9,
        roughness: 0.15,
      });

      const pad1 = new THREE.Mesh(crossGeom1, crossMat);
      const pad2 = new THREE.Mesh(crossGeom2, crossMat);
      qGroup.add(pad1);
      qGroup.add(pad2);

      // Junction glow dot
      const dotGeom = new THREE.SphereGeometry(0.06, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x06B6D4 });
      const dot = new THREE.Mesh(dotGeom, dotMat);
      dot.position.y = 0.03;
      qGroup.add(dot);

      chipGroup.add(qGroup);
      qubitMeshes.push({ mesh: qGroup, data: q });
    });

    // Interaction (Mouse orbit)
    let isDragging = false;
    let previousMouseX = 0;
    let targetRotationY = 0.2;

    const onMouseDown = (e) => {
      isDragging = true;
      previousMouseX = e.clientX;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMouseX;
      targetRotationY += deltaX * 0.008;
      previousMouseX = e.clientX;
    };

    const onMouseUp = () => { isDragging = false; };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging) {
        targetRotationY += 0.003;
      }

      chipGroup.rotation.y += (targetRotationY - chipGroup.rotation.y) * 0.08;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, [selectedQubit, autoRotate, height]);

  return (
    <QuantumPanel title="3D Superconducting Quantum Chip (QPU)" badgeText="5-Qubit Cross Topology">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'center' }}>
        {/* 3D Canvas */}
        <div style={{ position: 'relative', width: '100%', height: `${height}px`, backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <div ref={containerRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                padding: '4px 8px',
                backgroundColor: autoRotate ? '#EFF6FF' : '#FFFFFF',
                color: autoRotate ? 'var(--accent-primary)' : 'var(--text-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {autoRotate ? '⏸ PAUSE' : '▶ ROTATE'}
            </button>
          </div>
        </div>

        {/* Qubit Selector & Real Specs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            SELECT TRANSMON NODE:
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {QUBIT_SPECS.map((q) => (
              <button
                key={q.id}
                onClick={() => setSelectedQubit(q)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: selectedQubit.id === q.id ? 'var(--accent-primary)' : '#F8FAFC',
                  color: selectedQubit.id === q.id ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Q{q.id}
              </button>
            ))}
          </div>

          {/* Active Qubit Telemetry Card */}
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
              {selectedQubit.name}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Resonance:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedQubit.freq}</span>

              <span style={{ color: 'var(--text-muted)' }}>Relaxation (T₁):</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedQubit.t1}</span>

              <span style={{ color: 'var(--text-muted)' }}>Dephasing (T₂*):</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedQubit.t2}</span>

              <span style={{ color: 'var(--text-muted)' }}>1Q Gate Fidelity:</span>
              <span style={{ fontWeight: 700, color: '#15803D' }}>{selectedQubit.fidelity}</span>
            </div>
          </div>
        </div>
      </div>
    </QuantumPanel>
  );
}
