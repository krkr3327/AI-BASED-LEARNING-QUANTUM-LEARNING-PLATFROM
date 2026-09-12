import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function EntanglementBridge3D({ height = 340 }) {
  const mountRef = useRef(null);
  const [entangled, setEntangled] = useState(true);
  const [measuredState, setMeasuredState] = useState(null); // null | '00' | '11'
  const isEntangledRef = useRef(entangled);
  const measuredStateRef = useRef(measuredState);

  useEffect(() => {
    isEntangledRef.current = entangled;
    measuredStateRef.current = measuredState;
  }, [entangled, measuredState]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 600;
    const h = height;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 1000);
    camera.position.set(0, 1.2, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x5f9cd6, 1.5, 10);
    pointLight.position.set(0, 3, 2);
    scene.add(pointLight);

    // Main Master Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Helper: Create a Qubit Sphere
    const sphereRadius = 0.75;
    const createQubitSphere = (xPos, label, color) => {
      const group = new THREE.Group();
      group.position.x = xPos;

      // Translucent Sphere
      const geo = new THREE.SphereGeometry(sphereRadius, 32, 32);
      const mat = new THREE.MeshPhysicalMaterial({
        color,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
        transmission: 0.5,
        clearcoat: 0.5
      });
      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh);

      // Wireframe
      const wireGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(sphereRadius, 10, 8));
      const wireMat = new THREE.LineBasicMaterial({ color: 0x95aecd, transparent: true, opacity: 0.3 });
      const wire = new THREE.LineSegments(wireGeo, wireMat);
      group.add(wire);

      // Axis
      const axisPoints = [new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0)];
      const axisGeo = new THREE.BufferGeometry().setFromPoints(axisPoints);
      const axisMat = new THREE.LineBasicMaterial({ color: 0x2c3f60, opacity: 0.6 });
      group.add(new THREE.Line(axisGeo, axisMat));

      // Arrow
      const arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), sphereRadius, 0x3a68a4, 0.18, 0.1);
      group.add(arrowHelper);

      // Halo ring
      const ringGeo = new THREE.RingGeometry(sphereRadius + 0.05, sphereRadius + 0.12, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      return { group, arrowHelper, mesh, ring };
    };

    // Qubit A (Left) & Qubit B (Right)
    const qubitA = createQubitSphere(-1.8, "Qubit 0", 0x3a68a4);
    const qubitB = createQubitSphere(1.8, "Qubit 1", 0x5f9cd6);
    mainGroup.add(qubitA.group);
    mainGroup.add(qubitB.group);

    // ── ENTANGLEMENT QUANTUM BEAM PARTICLES ──
    const particleCount = 120;
    const beamGeo = new THREE.BufferGeometry();
    const beamPositions = new Float32Array(particleCount * 3);
    const beamColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const progress = i / particleCount;
      const x = -1.8 + progress * 3.6;
      const y = Math.sin(progress * Math.PI * 4) * 0.15;
      const z = Math.cos(progress * Math.PI * 4) * 0.15;

      beamPositions[i * 3] = x;
      beamPositions[i * 3 + 1] = y;
      beamPositions[i * 3 + 2] = z;

      beamColors[i * 3] = 0.37; // R
      beamColors[i * 3 + 1] = 0.61; // G
      beamColors[i * 3 + 2] = 0.84; // B
    }

    beamGeo.setAttribute("position", new THREE.BufferAttribute(beamPositions, 3));
    beamGeo.setAttribute("color", new THREE.BufferAttribute(beamColors, 3));

    const beamMat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const beamPoints = new THREE.Points(beamGeo, beamMat);
    mainGroup.add(beamPoints);

    // Animation Loop
    let animationId;
    let time = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.03;

      const isEnt = isEntangledRef.current;
      const mState = measuredStateRef.current;

      // Update particle beam wave
      if (isEnt && !mState) {
        beamPoints.visible = true;
        const positions = beamGeo.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          const progress = i / particleCount;
          const wavePhase = time * 2 + progress * Math.PI * 6;
          positions[i * 3 + 1] = Math.sin(wavePhase) * (0.12 + Math.sin(time) * 0.05);
          positions[i * 3 + 2] = Math.cos(wavePhase) * (0.12 + Math.cos(time) * 0.05);
        }
        beamGeo.attributes.position.needsUpdate = true;

        // Synchronized superposition rotation
        const theta = Math.PI / 2;
        const phiA = time * 0.8;
        const phiB = time * 0.8; // perfectly synchronized phase

        qubitA.arrowHelper.setDirection(new THREE.Vector3(Math.sin(theta) * Math.cos(phiA), Math.cos(theta), Math.sin(theta) * Math.sin(phiA)));
        qubitB.arrowHelper.setDirection(new THREE.Vector3(Math.sin(theta) * Math.cos(phiB), Math.cos(theta), Math.sin(theta) * Math.sin(phiB)));

        qubitA.group.rotation.y = time * 0.2;
        qubitB.group.rotation.y = time * 0.2;
      } else if (mState) {
        beamPoints.visible = false;
        // Collapsed to |00⟩ or |11⟩
        const yDir = mState === "00" ? 1 : -1;
        qubitA.arrowHelper.setDirection(new THREE.Vector3(0, yDir, 0));
        qubitB.arrowHelper.setDirection(new THREE.Vector3(0, yDir, 0));
      } else {
        beamPoints.visible = false;
        // Uncorrelated random rotation
        qubitA.group.rotation.y += 0.01;
        qubitB.group.rotation.y -= 0.015;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const newWidth = mount.clientWidth || 600;
      camera.aspect = newWidth / h;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [height]);

  const handleMeasure = () => {
    // 50/50 collapse to |00> or |11>
    const outcome = Math.random() > 0.5 ? "00" : "11";
    setMeasuredState(outcome);
  };

  const handleReset = () => {
    setMeasuredState(null);
    setEntangled(true);
  };

  return (
    <div style={{
      backgroundColor: "#FFFFFF",
      border: "1px solid #CBD5E1",
      borderRadius: "18px",
      padding: "20px 24px",
      boxShadow: "0 4px 16px rgba(12, 13, 18, 0.04)"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.2rem" }}>🔗</span>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0C0D12" }}>
              3D Quantum Entanglement Bridge
            </h3>
          </div>
          <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "#64748B" }}>
            Bell State $|\\Phi^+\\rangle = (|00\\rangle + |11\\rangle)/\\sqrt{2}$ • Non-Local State Correlation
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleMeasure}
            disabled={measuredState !== null}
            style={{
              padding: "7px 14px",
              background: measuredState ? "#E2E8F0" : "linear-gradient(135deg, #3A68A4 0%, #2C3F60 100%)",
              color: measuredState ? "#94A3B8" : "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.8rem",
              cursor: measuredState ? "not-allowed" : "pointer"
            }}
          >
            ⚡ Measure Qubit A
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: "7px 12px",
              backgroundColor: "#FFF8F2",
              color: "#A77B5A",
              border: "1px solid #F4C6AF",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.8rem",
              cursor: "pointer"
            }}
          >
            ↺ Reset State
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div
        ref={mountRef}
        style={{
          width: "100%",
          height: `${height}px`,
          position: "relative",
          background: "radial-gradient(ellipse at center, #F8FAFD 0%, #EFF5FB 100%)",
          borderRadius: "14px",
          overflow: "hidden"
        }}
      >
        {/* Status Overlay */}
        <div style={{ position: "absolute", top: "12px", left: "16px", fontSize: "0.75rem", fontWeight: 800, color: "#3A68A4" }}>
          Qubit 0 (Control)
        </div>
        <div style={{ position: "absolute", top: "12px", right: "16px", fontSize: "0.75rem", fontWeight: 800, color: "#5F9CD6" }}>
          Qubit 1 (Target)
        </div>
        <div style={{ position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", padding: "4px 14px", backgroundColor: "rgba(255,255,255,0.9)", borderRadius: "20px", border: "1px solid #E2E8F0", fontSize: "0.78rem", fontWeight: 800, color: measuredState ? "#15803D" : "#7C3AED" }}>
          {measuredState ? `State Collapsed: |${measuredState}⟩ (100% Correlated)` : "Entangled Wavefunction Beam Active"}
        </div>
      </div>
    </div>
  );
}
