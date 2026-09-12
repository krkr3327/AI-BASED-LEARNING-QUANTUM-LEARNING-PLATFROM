import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function SuperconductingQpu3D({ height = 220 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 800;
    const h = height;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / h, 0.1, 1000);
    camera.position.set(0, 3.8, 4.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x5f9cd6, 1.5);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const chipGroup = new THREE.Group();
    scene.add(chipGroup);

    // 1. Silicon Die Base Substrate
    const dieGeo = new THREE.BoxGeometry(6.5, 0.1, 4.5);
    const dieMat = new THREE.MeshPhysicalMaterial({
      color: 0x2c3f60,
      roughness: 0.2,
      metalness: 0.8,
      clearcoat: 0.8
    });
    const dieMesh = new THREE.Mesh(dieGeo, dieMat);
    chipGroup.add(dieMesh);

    // 2. Transmon Qubit Crosses (Heavy-Hex Lattice layout)
    const qubitPositions = [
      [-2.0, 0.08, -1.2],
      [-0.7, 0.08, -1.2],
      [0.7, 0.08, -1.2],
      [2.0, 0.08, -1.2],
      [-1.35, 0.08, 0],
      [0, 0.08, 0],
      [1.35, 0.08, 0],
      [-2.0, 0.08, 1.2],
      [-0.7, 0.08, 1.2],
      [0.7, 0.08, 1.2],
      [2.0, 0.08, 1.2]
    ];

    const transmonMeshes = [];
    const crossMat = new THREE.MeshStandardMaterial({
      color: 0xd6b15f,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0xa47c3a,
      emissiveIntensity: 0.4
    });

    qubitPositions.forEach(pos => {
      const qGroup = new THREE.Group();
      qGroup.position.set(pos[0], pos[1], pos[2]);

      // Cross arms
      const arm1 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.12), crossMat);
      const arm2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.42), crossMat);
      qGroup.add(arm1);
      qGroup.add(arm2);

      // Center Josephson junction dot
      const jj = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.08), new THREE.MeshBasicMaterial({ color: 0xad6358 }));
      qGroup.add(jj);

      chipGroup.add(qGroup);
      transmonMeshes.push(qGroup);
    });

    // 3. Coplanar Waveguide Couplers (Meandering Lines)
    const lineMat = new THREE.LineBasicMaterial({ color: 0xafd8f4, transparent: true, opacity: 0.65 });
    for (let i = 0; i < qubitPositions.length - 1; i++) {
      if (Math.random() > 0.3) {
        const p1 = qubitPositions[i];
        const p2 = qubitPositions[i + 1];
        const midX = (p1[0] + p2[0]) / 2;
        const midZ = (p1[2] + p2[2]) / 2 + 0.15;

        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(p1[0], 0.09, p1[2]),
          new THREE.Vector3(midX, 0.09, midZ),
          new THREE.Vector3(p2[0], 0.09, p2[2])
        );
        const points = curve.getPoints(20);
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeo, lineMat);
        chipGroup.add(line);
      }
    }

    // 4. Microwave Energy Wave Packets
    const pulseCount = 35;
    const pulseGeo = new THREE.BufferGeometry();
    const pulsePos = new Float32Array(pulseCount * 3);
    for (let i = 0; i < pulseCount; i++) {
      pulsePos[i * 3] = (Math.random() - 0.5) * 5.5;
      pulsePos[i * 3 + 1] = 0.15;
      pulsePos[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
    }
    pulseGeo.setAttribute("position", new THREE.BufferAttribute(pulsePos, 3));
    const pulseMat = new THREE.PointsMaterial({
      size: 0.06,
      color: 0x5f9cd6,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const pulsePoints = new THREE.Points(pulseGeo, pulseMat);
    chipGroup.add(pulsePoints);

    // Mouse parallax
    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e) => {
      const rect = mount.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.4;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.4;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animation Loop
    let animationId;
    let time = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.02;

      // Smooth parallax tilt
      chipGroup.rotation.y += (mouseX - chipGroup.rotation.y) * 0.05;
      chipGroup.rotation.x = -0.3 + mouseY * 0.3;

      // Qubit glowing resonance pulses
      transmonMeshes.forEach((mesh, idx) => {
        mesh.position.y = 0.08 + Math.sin(time * 2 + idx * 0.6) * 0.02;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const newWidth = mount.clientWidth || 800;
      camera.aspect = newWidth / h;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [height]);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: `${height}px`,
        position: "relative",
        overflow: "hidden",
        pointerEvents: "none"
      }}
    />
  );
}
