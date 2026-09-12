import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function BlochSphere3D({
  theta = 0,
  phi = 0,
  onStateChange,
  interactive = true,
  height = 360,
  showControls = true
}) {
  const mountRef = useRef(null);
  const stateRef = useRef({ theta, phi });
  const [currentTheta, setCurrentTheta] = useState(theta);
  const [currentPhi, setCurrentPhi] = useState(phi);
  const [isHovered, setIsHovered] = useState(false);

  // Keep stateRef synced
  useEffect(() => {
    stateRef.current = { theta, phi };
    setCurrentTheta(theta);
    setCurrentPhi(phi);
  }, [theta, phi]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 360;
    const h = height;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 1000);
    camera.position.set(3.2, 2.2, 3.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Group for entire sphere & rotations
    const blochGroup = new THREE.Group();
    scene.add(blochGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xafd8f4, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const warmLight = new THREE.PointLight(0xf4c6af, 0.8, 10);
    warmLight.position.set(-4, -2, -3);
    scene.add(warmLight);

    // 1. Translucent Bloch Sphere Mesh
    const sphereRadius = 1.35;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 36, 36);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: 0xeff6fb,
      transparent: true,
      opacity: 0.22,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
      transmission: 0.6,
      ior: 1.2
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    blochGroup.add(sphereMesh);

    // 2. Wireframe / Longitude & Latitude rings
    const wireGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(sphereRadius, 14, 10));
    const wireMat = new THREE.LineBasicMaterial({ color: 0x95aecd, transparent: true, opacity: 0.25 });
    const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
    blochGroup.add(wireMesh);

    // Equator ring
    const equatorGeo = new THREE.RingGeometry(sphereRadius - 0.008, sphereRadius + 0.008, 64);
    const equatorMat = new THREE.MeshBasicMaterial({ color: 0x5f9cd6, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const equatorMesh = new THREE.Mesh(equatorGeo, equatorMat);
    equatorMesh.rotation.x = Math.PI / 2;
    blochGroup.add(equatorMesh);

    // 3. Coordinate Axes (X, Y, Z)
    const axesLength = 1.75;
    const createAxis = (start, end, color) => {
      const points = [start, end];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color, linewidth: 2, transparent: true, opacity: 0.75 });
      return new THREE.Line(geo, mat);
    };

    // Z axis (vertical: |0> to |1>)
    const zAxis = createAxis(new THREE.Vector3(0, -axesLength, 0), new THREE.Vector3(0, axesLength, 0), 0x3a68a4);
    blochGroup.add(zAxis);

    // X axis (front/back: |+> to |->)
    const xAxis = createAxis(new THREE.Vector3(-axesLength, 0, 0), new THREE.Vector3(axesLength, 0, 0), 0xad6358);
    blochGroup.add(xAxis);

    // Y axis (left/right: |i> to |-i>)
    const yAxis = createAxis(new THREE.Vector3(0, 0, -axesLength), new THREE.Vector3(0, 0, axesLength), 0xd6b15f);
    blochGroup.add(yAxis);

    // 4. State Vector Arrow (|ψ⟩)
    const arrowLength = sphereRadius;
    const arrowDir = new THREE.Vector3(0, 1, 0);
    const arrowOrigin = new THREE.Vector3(0, 0, 0);
    const arrowHelper = new THREE.ArrowHelper(arrowDir, arrowOrigin, arrowLength, 0x3a68a4, 0.22, 0.12);
    arrowHelper.line.material.linewidth = 4;
    blochGroup.add(arrowHelper);

    // State Vector Tip Glow Sphere
    const tipGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const tipMat = new THREE.MeshStandardMaterial({
      color: 0x3a68a4,
      emissive: 0x5f9cd6,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });
    const tipMesh = new THREE.Mesh(tipGeo, tipMat);
    blochGroup.add(tipMesh);

    // 5. Orbit/Drag Interaction Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      blochGroup.rotation.y += deltaX * 0.008;
      blochGroup.rotation.x += deltaY * 0.008;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Animation Loop
    let animationId;
    let targetX = 0, targetY = sphereRadius, targetZ = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Compute state vector position from theta & phi
      // |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ) sin(θ/2)|1⟩
      // In 3D: x = R*sin(θ)*cos(φ), y = R*cos(θ), z = R*sin(θ)*sin(φ)
      const t = stateRef.current.theta;
      const p = stateRef.current.phi;

      const destX = sphereRadius * Math.sin(t) * Math.cos(p);
      const destY = sphereRadius * Math.cos(t);
      const destZ = sphereRadius * Math.sin(t) * Math.sin(p);

      // Smooth interpolation for arrow vector
      targetX += (destX - targetX) * 0.12;
      targetY += (destY - targetY) * 0.12;
      targetZ += (destZ - targetZ) * 0.12;

      const newDir = new THREE.Vector3(targetX, targetY, targetZ).normalize();
      arrowHelper.setDirection(newDir);
      arrowHelper.setLength(sphereRadius, 0.22, 0.12);
      tipMesh.position.set(targetX, targetY, targetZ);

      // Gentle idle precession rotation if not dragging
      if (!isDragging) {
        blochGroup.rotation.y += 0.002;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const newWidth = mount.clientWidth || 360;
      camera.aspect = newWidth / h;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, h);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      domElement.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [height]);

  // Gate Application helper
  const applyGate = (gate) => {
    let newTheta = currentTheta;
    let newPhi = currentPhi;

    switch (gate) {
      case "X": // Bit flip (rotate π around X)
        newTheta = Math.PI - currentTheta;
        newPhi = -currentPhi;
        break;
      case "Y": // Bit & phase flip (rotate π around Y)
        newTheta = Math.PI - currentTheta;
        newPhi = Math.PI - currentPhi;
        break;
      case "Z": // Phase flip (rotate π around Z)
        newPhi = (currentPhi + Math.PI) % (2 * Math.PI);
        break;
      case "H": // Hadamard (|0> -> |+>, |1> -> |->)
        if (Math.abs(currentTheta) < 0.1) {
          newTheta = Math.PI / 2;
          newPhi = 0;
        } else if (Math.abs(currentTheta - Math.PI) < 0.1) {
          newTheta = Math.PI / 2;
          newPhi = Math.PI;
        } else if (Math.abs(currentTheta - Math.PI / 2) < 0.1 && Math.abs(currentPhi) < 0.1) {
          newTheta = 0;
          newPhi = 0;
        } else {
          newTheta = Math.PI / 2;
          newPhi = 0;
        }
        break;
      case "S": // Phase S gate (π/2 around Z)
        newPhi = (currentPhi + Math.PI / 2) % (2 * Math.PI);
        break;
      case "T": // Phase T gate (π/4 around Z)
        newPhi = (currentPhi + Math.PI / 4) % (2 * Math.PI);
        break;
      case "RESET":
        newTheta = 0;
        newPhi = 0;
        break;
      default:
        break;
    }

    setCurrentTheta(newTheta);
    setCurrentPhi(newPhi);
    stateRef.current = { theta: newTheta, phi: newPhi };
    if (onStateChange) onStateChange({ theta: newTheta, phi: newPhi });
  };

  // Statevector amplitudes
  const alpha = Math.cos(currentTheta / 2).toFixed(3);
  const beta = Math.sin(currentTheta / 2).toFixed(3);
  const prob0 = (Math.cos(currentTheta / 2) ** 2 * 100).toFixed(1);
  const prob1 = (Math.sin(currentTheta / 2) ** 2 * 100).toFixed(1);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
        border: "1px solid #CBD5E1",
        borderRadius: "18px",
        padding: "18px",
        boxShadow: isHovered ? "0 10px 25px rgba(58, 104, 164, 0.1)" : "0 2px 10px rgba(12, 13, 18, 0.03)",
        transition: "all 0.25s ease",
        position: "relative"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Canvas Header HUD */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1.2rem" }}>🌐</span>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0C0D12" }}>
              3D Interactive Bloch Sphere
            </div>
            <div style={{ fontSize: "0.72rem", color: "#64748B" }}>
              Drag to Orbit • Real-Time Statevector $|\psi\rangle$
            </div>
          </div>
        </div>
        <span style={{ backgroundColor: "#EFF6FB", color: "#3A68A4", padding: "3px 10px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: 800, border: "1px solid #AFD8F4" }}>
          3D WebGL
        </span>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        style={{
          width: "100%",
          height: `${height}px`,
          position: "relative",
          cursor: "grab",
          background: "radial-gradient(circle at center, #F8FAFD 0%, #EEF5FB 100%)",
          borderRadius: "14px",
          overflow: "hidden"
        }}
      >
        {/* Overlay Coordinate Indicators */}
        <div style={{ position: "absolute", top: "10px", left: "12px", fontSize: "0.72rem", color: "#64748B", fontWeight: 700, pointerEvents: "none" }}>
          <span style={{ color: "#3A68A4" }}>|0⟩ (North)</span> • <span style={{ color: "#2C3F60" }}>|1⟩ (South)</span>
        </div>
        <div style={{ position: "absolute", bottom: "10px", right: "12px", fontSize: "0.72rem", color: "#64748B", fontWeight: 700, pointerEvents: "none" }}>
          θ: {(currentTheta * (180 / Math.PI)).toFixed(1)}° • φ: {(currentPhi * (180 / Math.PI)).toFixed(1)}°
        </div>
      </div>

      {/* Quantum State Amplitudes & Probabilities HUD */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px", padding: "10px 14px", backgroundColor: "#F8FAFD", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
        <div>
          <div style={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 700 }}>Statevector Equation</div>
          <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0C0D12", fontFamily: "JetBrains Mono, monospace" }}>
            |ψ⟩ = {alpha}|0⟩ + {beta}|1⟩
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 700 }}>Measurement Probabilities</div>
          <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#3A68A4", fontFamily: "JetBrains Mono, monospace" }}>
            P(|0⟩): {prob0}% • P(|1⟩): {prob1}%
          </div>
        </div>
      </div>

      {/* Interactive Gate Controls */}
      {showControls && (
        <div style={{ display: "flex", gap: "6px", marginTop: "12px", flexWrap: "wrap" }}>
          {[
            { label: "H", name: "Hadamard", color: "#D6B15F" },
            { label: "X", name: "Pauli-X", color: "#AD6358" },
            { label: "Y", name: "Pauli-Y", color: "#059669" },
            { label: "Z", name: "Pauli-Z", color: "#3A68A4" },
            { label: "S", name: "Phase S", color: "#0D9488" },
            { label: "T", name: "Phase T", color: "#2C3F60" },
            { label: "↺ Reset", name: "Ground State", color: "#64748B" }
          ].map(g => (
            <button
              key={g.label}
              onClick={() => applyGate(g.label === "↺ Reset" ? "RESET" : g.label)}
              style={{
                flex: 1,
                minWidth: "42px",
                padding: "6px 8px",
                backgroundColor: "#FFFFFF",
                border: `1.5px solid ${g.color}`,
                borderRadius: "8px",
                color: g.color,
                fontWeight: 800,
                fontSize: "0.78rem",
                cursor: "pointer",
                transition: "all 0.15s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = g.color;
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = "#FFFFFF";
                e.currentTarget.style.color = g.color;
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
