import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function AIAvatar3D({ size = 140, state = "idle" }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = size;
    const h = size;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0x5f9cd6, 1.5);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const peachLight = new THREE.PointLight(0xf4c6af, 1.2, 5);
    peachLight.position.set(-2, -1, 2);
    scene.add(peachLight);

    const botGroup = new THREE.Group();
    scene.add(botGroup);

    // 1. Sleek Head Sphere
    const headGeo = new THREE.SphereGeometry(0.65, 32, 32);
    const headMat = new THREE.MeshPhysicalMaterial({
      color: 0x2c3f60,
      metalness: 0.7,
      roughness: 0.2,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1
    });
    const head = new THREE.Mesh(headGeo, headMat);
    botGroup.add(head);

    // 2. Glowing Cyan Visor Screen
    const visorGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.2, 32, 1, false, 0, Math.PI);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x0c0d12,
      emissive: 0x5f9cd6,
      emissiveIntensity: 0.6,
      roughness: 0.1
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.rotation.x = Math.PI / 2;
    visor.position.set(0, 0.05, 0.45);
    botGroup.add(visor);

    // 3. Expressive Glowing Eyes
    const eyeGeo = new THREE.CapsuleGeometry(0.06, 0.08, 8, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xafd8f4 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.16, 0.06, 0.62);
    leftEye.rotation.z = Math.PI / 2;
    botGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.16, 0.06, 0.62);
    rightEye.rotation.z = Math.PI / 2;
    botGroup.add(rightEye);

    // 4. Soft Peach Cheeks
    const cheekGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const cheekMat = new THREE.MeshBasicMaterial({ color: 0xf4c6af, transparent: true, opacity: 0.85 });
    const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
    leftCheek.position.set(-0.32, -0.1, 0.52);
    botGroup.add(leftCheek);

    const rightCheek = new THREE.Mesh(cheekGeo, cheekMat);
    rightCheek.position.set(0.32, -0.1, 0.52);
    botGroup.add(rightCheek);

    // 5. Magnetic Levitation Ring
    const ringGeo = new THREE.TorusGeometry(0.85, 0.028, 16, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd6b15f,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xa47c3a,
      emissiveIntensity: 0.3
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.3;
    botGroup.add(ring);

    // 6. Antenna / Qubit Core on Top
    const antPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25), new THREE.MeshBasicMaterial({ color: 0xa77b5a }));
    antPole.position.set(0, 0.75, 0);
    botGroup.add(antPole);

    const antTip = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), new THREE.MeshStandardMaterial({ color: 0xd6b15f, emissive: 0xd6b15f, emissiveIntensity: 0.8 }));
    antTip.position.set(0, 0.88, 0);
    botGroup.add(antTip);

    // Mouse Tracking
    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e) => {
      const rect = mount.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.8;
      mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 0.8;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animation Loop
    let animationId;
    let time = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.035;

      // Smooth floating bobbing
      botGroup.position.y = Math.sin(time) * 0.08;

      // Smooth look-at tracking
      botGroup.rotation.y += (mouseX * 0.7 - botGroup.rotation.y) * 0.1;
      botGroup.rotation.x += (-mouseY * 0.5 - botGroup.rotation.x) * 0.1;

      // Spin orbital ring
      ring.rotation.z += 0.02;

      // Pulse antenna
      antTip.scale.setScalar(1 + Math.sin(time * 3) * 0.15);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [size]);

  return (
    <div
      ref={mountRef}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: "relative",
        cursor: "pointer"
      }}
    />
  );
}
