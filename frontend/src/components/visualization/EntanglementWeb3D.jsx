import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * EntanglementWeb3D
 * Visualizes multi-qubit entanglement as interconnected 3D Bloch spheres 
 * Styled in the website's clean, professional light theme.
 */
export default function EntanglementWeb3D({ simResult, numQubits = 2 }) {
  const containerRef = useRef(null);
  const [selectedState, setSelectedState] = useState('bell_phi_plus');
  const [activeQubit, setActiveQubit] = useState(0);

  // Preset entangled states for interactive exploration
  const PRESETS = {
    bell_phi_plus: {
      name: 'Bell State |Φ⁺⟩',
      formula: '(|00⟩ + |11⟩) / √2',
      entanglement: 1.0,
      description: 'Maximally entangled Bell pair with perfectly correlated measurement outcomes (00 or 11).'
    },
    bell_psi_plus: {
      name: 'Bell State |Ψ⁺⟩',
      formula: '(|01⟩ + |10⟩) / √2',
      entanglement: 1.0,
      description: 'Maximally entangled anti-correlated pair with opposite measurement outcomes (01 or 10).'
    },
    ghz_3: {
      name: '3-Qubit GHZ State',
      formula: '(|000⟩ + |111⟩) / √2',
      entanglement: 1.0,
      description: 'Tripartite Greenberger–Horne–Zeilinger state demonstrating non-local 3-qubit correlation.'
    },
    w_state: {
      name: '3-Qubit W State',
      formula: '(|001⟩ + |010⟩ + |100⟩) / √3',
      entanglement: 0.89,
      description: 'Robust entanglement that survives the measurement or loss of any single qubit.'
    },
    separable: {
      name: 'Separable |++⟩',
      formula: '(|0⟩+|1⟩) ⊗ (|0⟩+|1⟩) / 2',
      entanglement: 0.0,
      description: 'Zero entanglement (independent product state). Measuring qubit 0 gives no info on qubit 1.'
    }
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
    camera.position.set(0, 3.2, 7.5);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lights (Crisp, High-Legibility)
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x2563EB, 1.5, 15);
    blueLight.position.set(0, 3, 3);
    scene.add(blueLight);

    // 4. Multi-Bloch Spheres
    const count = selectedState.startsWith('ghz') || selectedState === 'w_state' ? 3 : 2;
    const spheres = [];
    const sphereRadius = 1.0;
    const spacing = 2.8;

    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();
      const xPos = (i - (count - 1) / 2) * spacing;
      group.position.set(xPos, 0, 0);

      // Glassy Translucent Sphere
      const sphereGeo = new THREE.SphereGeometry(sphereRadius, 24, 24);
      const sphereMat = new THREE.MeshPhysicalMaterial({
        color: 0xEFF6FF,
        transparent: true,
        opacity: 0.45,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.8
      });
      group.add(new THREE.Mesh(sphereGeo, sphereMat));

      // Wireframe Grid
      const wireGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(sphereRadius, 14, 10));
      const wireMat = new THREE.LineBasicMaterial({ color: 0xCBD5E1 });
      group.add(new THREE.LineSegments(wireGeo, wireMat));

      // Equator Ring
      const ringGeo = new THREE.RingGeometry(sphereRadius * 0.99, sphereRadius * 1.01, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x93C5FD, side: THREE.DoubleSide });
      const equator = new THREE.Mesh(ringGeo, ringMat);
      equator.rotation.x = Math.PI / 2;
      group.add(equator);

      // State Vector Arrow
      const arrowDir = new THREE.Vector3(
        selectedState === 'separable' ? 1 : (i === 0 ? 0 : 0),
        selectedState === 'separable' ? 0 : (selectedState === 'bell_psi_plus' && i === 1 ? -1 : 1),
        0
      ).normalize();

      const arrowColor = i === 0 ? 0x2563EB : (i === 1 ? 0x7C3AED : 0x059669);
      const arrow = new THREE.ArrowHelper(
        arrowDir,
        new THREE.Vector3(0, 0, 0),
        sphereRadius,
        arrowColor,
        0.22,
        0.12
      );
      group.add(arrow);

      // Tip Glow
      const tipGeo = new THREE.SphereGeometry(0.06, 16, 16);
      const tipMat = new THREE.MeshBasicMaterial({ color: arrowColor });
      const tipMesh = new THREE.Mesh(tipGeo, tipMat);
      tipMesh.position.copy(arrowDir.clone().multiplyScalar(sphereRadius));
      group.add(tipMesh);

      // Axis Ring Label
      const labelGeo = new THREE.TorusGeometry(sphereRadius * 1.08, 0.015, 8, 32);
      const labelMat = new THREE.MeshBasicMaterial({ color: i === activeQubit ? 0x2563EB : 0x94A3B8 });
      group.add(new THREE.Mesh(labelGeo, labelMat));

      scene.add(group);
      spheres.push({ group, arrow, xPos });
    }

    // 5. Plasma Entanglement Energy Beams
    const beamMeshes = [];
    const isEntangled = PRESETS[selectedState].entanglement > 0;

    if (isEntangled) {
      for (let i = 0; i < count - 1; i++) {
        const p1 = spheres[i].group.position;
        const p2 = spheres[i + 1].group.position;
        const midY = 0.8;

        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(p1.x + sphereRadius, 0, 0),
          new THREE.Vector3((p1.x + p2.x) / 2, midY, 0.3),
          new THREE.Vector3(p2.x - sphereRadius, 0, 0)
        );

        const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.035, 8, false);
        const tubeMat = new THREE.MeshBasicMaterial({
          color: 0x2563EB,
          transparent: true,
          opacity: 0.85
        });
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        scene.add(tubeMesh);
        beamMeshes.push(tubeMesh);

        // Particle stream along the beam
        const particleCount = 20;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        for (let p = 0; p < particleCount; p++) {
          const t = p / particleCount;
          const pt = curve.getPoint(t);
          positions[p * 3] = pt.x;
          positions[p * 3 + 1] = pt.y;
          positions[p * 3 + 2] = pt.z;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({
          color: 0x0284C7,
          size: 0.1,
          transparent: true,
          opacity: 0.9
        });
        const particleSystem = new THREE.Points(particleGeo, particleMat);
        scene.add(particleSystem);
        beamMeshes.push(particleSystem);
      }
    }

    // 6. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle sphere rotation
      spheres.forEach((s, idx) => {
        s.group.rotation.y = elapsed * 0.3 + idx;
        if (isEntangled) {
          s.group.position.y = Math.sin(elapsed * 2.5 + idx * Math.PI) * 0.05;
        } else {
          s.group.position.y = 0;
        }
      });

      // Pulse beam opacity
      beamMeshes.forEach((mesh, idx) => {
        if (mesh.material && mesh.material.opacity !== undefined) {
          mesh.material.opacity = 0.5 + 0.35 * Math.sin(elapsed * 4 + idx);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [selectedState, activeQubit]);

  const curr = PRESETS[selectedState] || PRESETS.bell_phi_plus;

  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', padding: '16px', color: 'var(--text-primary)' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🌐</span> Multi-Qubit 3D Entanglement Web
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Interactive EPR Correlation & Bell-GHZ Non-Locality Visualization
          </div>
        </div>

        {/* State Presets */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {Object.entries(PRESETS).map(([key, item]) => (
            <button
              key={key}
              onClick={() => setSelectedState(key)}
              style={{
                padding: '4px 10px',
                fontSize: '0.72rem',
                borderRadius: '6px',
                border: selectedState === key ? '1px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                backgroundColor: selectedState === key ? '#EFF6FF' : '#FFFFFF',
                color: selectedState === key ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
            >
              {item.name}
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
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantum State</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>{curr.formula}</div>
        </div>

        <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Concurrence (Entanglement)</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: curr.entanglement > 0 ? '#059669' : '#DC2626' }}>
            {curr.entanglement === 1.0 ? '100% (Maximal)' : `${(curr.entanglement * 100).toFixed(0)}%`}
          </div>
        </div>

        <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)', gridColumn: 'span 2' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>EPR Non-Locality Principle</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{curr.description}</div>
        </div>
      </div>
    </div>
  );
}
