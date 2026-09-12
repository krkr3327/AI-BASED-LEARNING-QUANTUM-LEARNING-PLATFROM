import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { QuantumPanel, QuantumMetric } from '../ui/QuantumPrimitives';

export default function BlochSphere3D({ statevector, qubitIndex = 0 }) {
  const containerRef = useRef(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showGeodesic, setShowGeodesic] = useState(true);

  // Local state override for interactive gate triggers
  const [activeGate, setActiveGate] = useState(null);
  const [manualCoords, setManualCoords] = useState(null);

  // Compute Bloch coordinates (x, y, z) from single-qubit statevector [alpha, beta]
  let alpha = { real: 1, imag: 0 };
  let beta = { real: 0, imag: 0 };

  if (manualCoords) {
    // Override with manual gate trigger
  } else if (statevector && statevector.length >= 2) {
    alpha = statevector[0] || { real: 1, imag: 0 };
    beta = statevector[1] || { real: 0, imag: 0 };
  }

  const a_conj_real = alpha.real;
  const a_conj_imag = -alpha.imag;

  const ab_real = a_conj_real * beta.real - a_conj_imag * beta.imag;
  const ab_imag = a_conj_real * beta.imag + a_conj_imag * beta.real;

  const bx = manualCoords ? manualCoords.x : (2 * ab_real);
  const by = manualCoords ? manualCoords.y : (2 * ab_imag);
  const bz = manualCoords ? manualCoords.z : ((alpha.real ** 2 + alpha.imag ** 2) - (beta.real ** 2 + beta.imag ** 2));

  // Theta & Phi
  const theta = Math.acos(Math.max(-1, Math.min(1, bz)));
  const phi = Math.atan2(by, bx);

  // Quick gate preset triggers
  const applyPreset = (name, x, y, z) => {
    setActiveGate(name);
    setManualCoords({ x, y, z });
  };

  const resetToSimulation = () => {
    setActiveGate(null);
    setManualCoords(null);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = 300;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.4, 1.8, 3.2);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // 4. Bloch Sphere Group
    const sphereGroup = new THREE.Group();
    scene.add(sphereGroup);

    const radius = 1.0;

    // Translucent glass inner sphere
    const sphereGeom = new THREE.SphereGeometry(radius, 32, 32);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: 0xEFF6FF,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.8,
    });
    const sphereMesh = new THREE.Mesh(sphereGeom, sphereMat);
    sphereGroup.add(sphereMesh);

    // Wireframe grid lines
    const wireGeom = new THREE.WireframeGeometry(new THREE.SphereGeometry(radius, 16, 12));
    const wireMat = new THREE.LineBasicMaterial({ color: 0xCBD5E1, linewidth: 1 });
    const wireMesh = new THREE.LineSegments(wireGeom, wireMat);
    sphereGroup.add(wireMesh);

    // Equator ring
    const equatorGeom = new THREE.RingGeometry(radius - 0.005, radius + 0.005, 64);
    const equatorMat = new THREE.MeshBasicMaterial({ color: 0x93C5FD, side: THREE.DoubleSide });
    const equatorMesh = new THREE.Mesh(equatorGeom, equatorMat);
    equatorMesh.rotation.x = Math.PI / 2;
    sphereGroup.add(equatorMesh);

    // Coordinate Axes (Z: Green, X: Sky, Y: Purple)
    const zAxisGeom = new THREE.CylinderGeometry(0.015, 0.015, 2.5, 16);
    const zAxisMat = new THREE.MeshBasicMaterial({ color: 0x10B981 });
    sphereGroup.add(new THREE.Mesh(zAxisGeom, zAxisMat));

    const xAxisGeom = new THREE.CylinderGeometry(0.015, 0.015, 2.5, 16);
    const xAxisMat = new THREE.MeshBasicMaterial({ color: 0x0284C7 });
    const xAxisMesh = new THREE.Mesh(xAxisGeom, xAxisMat);
    xAxisMesh.rotation.z = Math.PI / 2;
    sphereGroup.add(xAxisMesh);

    const yAxisGeom = new THREE.CylinderGeometry(0.015, 0.015, 2.5, 16);
    const yAxisMat = new THREE.MeshBasicMaterial({ color: 0x7C3AED });
    const yAxisMesh = new THREE.Mesh(yAxisGeom, yAxisMat);
    yAxisMesh.rotation.x = Math.PI / 2;
    sphereGroup.add(yAxisMesh);

    // Vector Coordinates
    const vecX = bx * radius;
    const vecY = bz * radius;
    const vecZ = -by * radius;

    const origin = new THREE.Vector3(0, 0, 0);
    const targetDir = new THREE.Vector3(vecX, vecY, vecZ);
    const len = targetDir.length() || 0.001;
    targetDir.normalize();

    const arrowColor = 0x2563EB;
    const arrow = new THREE.ArrowHelper(targetDir, origin, Math.min(len, radius), arrowColor, 0.22, 0.12);
    sphereGroup.add(arrow);

    // State Vector Tip Glow
    const tipGeom = new THREE.SphereGeometry(0.06, 16, 16);
    const tipMat = new THREE.MeshBasicMaterial({ color: 0x2563EB });
    const tipMesh = new THREE.Mesh(tipGeom, tipMat);
    tipMesh.position.set(vecX, vecY, vecZ);
    sphereGroup.add(tipMesh);

    // Glowing Geodesic Trajectory Ribbon from |0> to current state
    if (showGeodesic) {
      const startPt = new THREE.Vector3(0, radius, 0); // |0> at +Z (Three.js Y)
      const endPt = new THREE.Vector3(vecX, vecY, vecZ);
      
      const arcPoints = [];
      const steps = 30;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const interp = new THREE.Vector3().lerpVectors(startPt, endPt, t);
        interp.normalize().multiplyScalar(radius * 1.01);
        arcPoints.push(interp);
      }

      const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
      const arcMat = new THREE.LineBasicMaterial({
        color: 0xF59E0B,
        linewidth: 3,
        transparent: true,
        opacity: 0.85
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      sphereGroup.add(arcLine);
    }

    // Dotted projection line to XY plane
    const projPoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(vecX, 0, vecZ),
      new THREE.Vector3(vecX, vecY, vecZ)
    ];
    const projGeom = new THREE.BufferGeometry().setFromPoints(projPoints);
    const projMat = new THREE.LineDashedMaterial({ color: 0x64748B, dashSize: 0.08, gapSize: 0.04 });
    const projLine = new THREE.Line(projGeom, projMat);
    projLine.computeLineDistances();
    sphereGroup.add(projLine);

    // Mouse Drag Controls
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMouseX;
      const deltaY = e.clientY - previousMouseY;

      targetRotationY += deltaX * 0.01;
      targetRotationX += deltaY * 0.01;

      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging) {
        targetRotationY += 0.005;
      }

      sphereGroup.rotation.y += (targetRotationY - sphereGroup.rotation.y) * 0.1;
      sphereGroup.rotation.x += (targetRotationX - sphereGroup.rotation.x) * 0.1;

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
  }, [bx, by, bz, autoRotate, showGeodesic]);

  const isMultiQubit = statevector && statevector.length > 2;

  return (
    <QuantumPanel title="3D Bloch Sphere & Geodesic Arc" badgeText={activeGate ? `Gate: ${activeGate}` : (isMultiQubit ? `Qubit q${qubitIndex}` : "Pure State |ψ⟩")}>
      {isMultiQubit && !manualCoords && (
        <div style={{ padding: '8px 12px', backgroundColor: '#EFF6FF', borderRadius: '6px', border: '1px solid #BFDBFE', fontSize: '0.8rem', color: '#1E40AF', marginBottom: '8px' }}>
          ℹ️ Multi-qubit system detected ({Math.round(Math.log2(statevector.length))} Qubits). Showing state projection for qubit q{qubitIndex}.
        </div>
      )}

      {/* Quick Gate Trigger Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quick Trajectories:</span>
        {[
          { name: '|0⟩', x: 0, y: 0, z: 1 },
          { name: '|1⟩', x: 0, y: 0, z: -1 },
          { name: '|+⟩ (H)', x: 1, y: 0, z: 0 },
          { name: '|-⟩', x: -1, y: 0, z: 0 },
          { name: '|i⟩ (S)', x: 0, y: 1, z: 0 },
          { name: '|-i⟩', x: 0, y: -1, z: 0 },
        ].map(p => (
          <button
            key={p.name}
            onClick={() => applyPreset(p.name, p.x, p.y, p.z)}
            style={{
              padding: '3px 8px',
              fontSize: '0.72rem',
              borderRadius: '4px',
              border: activeGate === p.name ? '1px solid var(--accent-primary)' : '1px solid var(--border-medium)',
              backgroundColor: activeGate === p.name ? '#EFF6FF' : '#FFFFFF',
              color: activeGate === p.name ? 'var(--accent-primary)' : 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            {p.name}
          </button>
        ))}
        {manualCoords && (
          <button
            onClick={resetToSimulation}
            style={{
              padding: '3px 8px',
              fontSize: '0.72rem',
              borderRadius: '4px',
              border: '1px solid #F59E0B',
              backgroundColor: '#FEF3C7',
              color: '#B45309',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            ↺ Reset
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{ position: 'relative', width: '100%', height: '300px', display: 'flex', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <div ref={containerRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />
          
          <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setShowGeodesic(!showGeodesic)}
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                padding: '4px 8px',
                backgroundColor: showGeodesic ? '#FEF3C7' : '#FFFFFF',
                color: showGeodesic ? '#B45309' : 'var(--text-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showGeodesic ? '🌟 ARC ON' : '⚪ ARC OFF'}
            </button>
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

          <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            <div>|0⟩ = +Z (North)</div>
            <div>|1⟩ = -Z (South)</div>
            <div>|+⟩ = +X (Front)</div>
          </div>
        </div>

        {/* Vector metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '100%', marginTop: '12px' }}>
          <QuantumMetric label="X (⟨σx⟩)" value={bx.toFixed(3)} color="#0284C7" />
          <QuantumMetric label="Y (⟨σy⟩)" value={by.toFixed(3)} color="#7C3AED" />
          <QuantumMetric label="Z (⟨σz⟩)" value={bz.toFixed(3)} color="#10B981" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', width: '100%', marginTop: '8px' }}>
          <QuantumMetric label="θ (Polar Angle)" value={(theta * (180 / Math.PI)).toFixed(1)} unit="°" />
          <QuantumMetric label="φ (Azimuthal Phase)" value={(phi * (180 / Math.PI)).toFixed(1)} unit="°" />
        </div>
      </div>
    </QuantumPanel>
  );
}
