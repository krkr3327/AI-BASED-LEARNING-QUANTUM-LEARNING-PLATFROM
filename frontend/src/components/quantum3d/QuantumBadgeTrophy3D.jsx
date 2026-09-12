import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function QuantumBadgeTrophy3D({
  title = "Senior Quantum Scholar",
  tier = "Level 4 • Verified",
  height = 320
}) {
  const mountRef = useRef(null);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 340;
    const h = height;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 1000);
    camera.position.set(0, 0, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Lights for Metallic Sheen
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xd6b15f, 2.0);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xafd8f4, 1.2);
    fillLight.position.set(-4, -2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xf4c6af, 1.5, 8);
    rimLight.position.set(0, -3, 2);
    scene.add(rimLight);

    // Trophy Master Group
    const trophyGroup = new THREE.Group();
    scene.add(trophyGroup);

    // 1. Central Quantum Core (Octahedron / Diamond Crest)
    const coreGeo = new THREE.OctahedronGeometry(1.0, 0);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x3a68a4,
      metalness: 0.85,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
      emissive: 0x2c3f60,
      emissiveIntensity: 0.3
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    trophyGroup.add(coreMesh);

    // 2. Inner Golden Nucleus
    const innerGeo = new THREE.IcosahedronGeometry(0.5, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xd6b15f,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xa47c3a,
      emissiveIntensity: 0.5
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    trophyGroup.add(innerMesh);

    // 3. Orbital Metallic Quantum Rings (Toruses)
    const ring1Geo = new THREE.TorusGeometry(1.4, 0.035, 16, 64);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xd6b15f,
      metalness: 0.95,
      roughness: 0.1
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    trophyGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(1.6, 0.03, 16, 64);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0xa77b5a,
      metalness: 0.9,
      roughness: 0.15
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.z = Math.PI / 6;
    trophyGroup.add(ring2);

    // 4. Floating Quantum Sparkles / Photons
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.8 + Math.random() * 0.5;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xd6b15f,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    trophyGroup.add(particlePoints);

    // Mouse drag interaction
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouse.x;
      const deltaY = e.clientY - prevMouse.y;
      trophyGroup.rotation.y += deltaX * 0.01;
      trophyGroup.rotation.x += deltaY * 0.01;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Animation loop
    let animationId;
    let time = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.02;

      if (!isDragging) {
        trophyGroup.rotation.y += 0.008;
        trophyGroup.position.y = Math.sin(time) * 0.08;
      }

      ring1.rotation.z += 0.012;
      ring2.rotation.x += 0.009;
      innerMesh.rotation.y -= 0.015;
      particlePoints.rotation.y += 0.005;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const newWidth = mount.clientWidth || 340;
      camera.aspect = newWidth / h;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, h);
    };
    window.addEventListener("resize", handleResize);

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

  return (
    <div style={{
      backgroundColor: "#FFFFFF",
      border: "1px solid #CBD5E1",
      borderRadius: "18px",
      padding: "20px",
      boxShadow: "0 4px 18px rgba(12, 13, 18, 0.04)",
      textAlign: "center"
    }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#FFF8F2", border: "1px solid #F4C6AF", padding: "4px 12px", borderRadius: "14px", fontSize: "0.74rem", fontWeight: 800, color: "#A77B5A", marginBottom: "8px" }}>
        <span>👑</span> 3D Verified Quantum Credential Trophy
      </div>
      <h3 style={{ margin: "4px 0 0 0", fontSize: "1.1rem", fontWeight: 900, color: "#0C0D12" }}>
        {title}
      </h3>
      <p style={{ margin: "2px 0 8px 0", fontSize: "0.8rem", color: "#64748B" }}>
        {tier} • Drag to Rotate 3D Core
      </p>

      {/* 3D Canvas */}
      <div
        ref={mountRef}
        style={{
          width: "100%",
          height: `${height}px`,
          background: "radial-gradient(circle at center, #F8FAFD 0%, #EEF5FB 100%)",
          borderRadius: "14px",
          cursor: "grab",
          overflow: "hidden",
          position: "relative"
        }}
      >
        <div style={{ position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", fontSize: "0.7rem", color: "#64748B", fontWeight: 700, pointerEvents: "none" }}>
          ✦ Quantum State Invariant ✦
        </div>
      </div>
    </div>
  );
}
