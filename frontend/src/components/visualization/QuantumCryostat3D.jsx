import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const STAGES = [
  { id: 'top', name: 'Top Plate (Vacuum Flange)', temp: '300 K (Room Temp)', desc: 'Provides vacuum seal and feeds microwave lines, wiring, and helium injection lines into the cryostat.', color: '#94A3B8' },
  { id: '50k', name: '50K Thermal Radiation Shield', temp: '50 K (-223°C)', desc: 'First stage cooled by pulse-tube cryocooler, intercepts ambient thermal radiation from room temperature.', color: '#CBD5E1' },
  { id: '4k', name: '4K Stage & Still Flange', temp: '4.2 K (-269°C)', desc: 'Evaporates Helium-3 from the dilute mixture to drive continuous cycle circulation.', color: '#FCD34D' },
  { id: 'cold', name: 'Cold Plate (100 mK)', temp: '100 mK', desc: 'Pre-cools incoming coaxial microwave control lines and thermalizes signal attenuators to minimize noise.', color: '#F59E0B' },
  { id: 'mixing', name: 'Mixing Chamber & QPU Stage', temp: '15 mK (-273.135°C)', desc: 'The quantum ground zero where phase separation between He-3 and He-4 occurs, housing the superconducting quantum processor.', color: '#D97706' }
];

export default function QuantumCryostat3D({ height = 440, showDetails = true }) {
  const containerRef = useRef(null);
  const [activeStage, setActiveStage] = useState(STAGES[4]); // default to QPU stage
  const [autoRotate, setAutoRotate] = useState(true);
  const [showShield, setShowShield] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const h = height;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF8FAFC);

    const camera = new THREE.PerspectiveCamera(36, width / h, 0.1, 1000);
    camera.position.set(0, 0, 11.2);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting (Studio Lighting for Golden Cryostat)
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xFFFFFF, 1.8);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xFDE68A, 1.2);
    dirLight2.position.set(-6, -4, -5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x3B82F6, 1.0, 10);
    pointLight.position.set(0, -2.8, 2);
    scene.add(pointLight);

    // Materials
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xE5A93C,
      metalness: 0.88,
      roughness: 0.22,
    });

    const copperMaterial = new THREE.MeshStandardMaterial({
      color: 0xC86D3B,
      metalness: 0.82,
      roughness: 0.3,
    });

    const silverMaterial = new THREE.MeshStandardMaterial({
      color: 0xD1D5DB,
      metalness: 0.9,
      roughness: 0.18,
    });

    const qpuCaseMaterial = new THREE.MeshStandardMaterial({
      color: 0x1E293B,
      metalness: 0.7,
      roughness: 0.35,
    });

    const chipGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x06B6D4,
    });

    const shieldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x93C5FD,
      transparent: true,
      opacity: 0.2,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.4,
    });

    // 4. Construct Cryostat Hierarchy
    const cryostatGroup = new THREE.Group();
    scene.add(cryostatGroup);

    // Plate levels mapping with camera focus heights and zoom distances
    const plateLevels = [
      { id: 'top', y: 2.8, r: 2.2, h: 0.14, mat: silverMaterial, camY: 2.8, camZ: 6.2, desc: 'Vacuum Flange 300K' },
      { id: '50k', y: 1.6, r: 1.9, h: 0.12, mat: goldMaterial, camY: 1.6, camZ: 5.5, desc: '50K Thermal Shield' },
      { id: '4k', y: 0.4, r: 1.6, h: 0.12, mat: goldMaterial, camY: 0.4, camZ: 5.0, desc: '4K Still Flange' },
      { id: 'cold', y: -0.8, r: 1.3, h: 0.10, mat: copperMaterial, camY: -0.8, camZ: 4.5, desc: '100mK Cold Plate' },
      { id: 'mixing', y: -2.0, r: 1.0, h: 0.10, mat: goldMaterial, camY: -2.4, camZ: 4.2, desc: '15mK Mixing QPU' },
    ];

    // Stage meshes registry for dynamic highlights
    const stageMeshes = {};

    // Add plates
    plateLevels.forEach((pl) => {
      const stageGroup = new THREE.Group();
      stageGroup.userData = { stageId: pl.id };

      const geom = new THREE.CylinderGeometry(pl.r, pl.r, pl.h, 48);
      const mesh = new THREE.Mesh(geom, pl.mat.clone());
      mesh.position.y = pl.y;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { stageId: pl.id };
      stageGroup.add(mesh);

      // Plate rim bevel ring
      const ringGeom = new THREE.TorusGeometry(pl.r, 0.035, 16, 48);
      const ringMesh = new THREE.Mesh(ringGeom, pl.mat.clone());
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = pl.y;
      stageGroup.add(ringMesh);

      // Selection Glow Halo (visible when active)
      const haloGeom = new THREE.TorusGeometry(pl.r + 0.08, 0.03, 16, 48);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.9 });
      const haloMesh = new THREE.Mesh(haloGeom, haloMat);
      haloMesh.rotation.x = Math.PI / 2;
      haloMesh.position.y = pl.y;
      haloMesh.visible = (activeStage?.id === pl.id);
      stageGroup.add(haloMesh);

      cryostatGroup.add(stageGroup);
      stageMeshes[pl.id] = { group: stageGroup, halo: haloMesh, mesh, ringMesh };
    });

    // Structural Titanium Support Rods (between consecutive plates)
    for (let i = 0; i < plateLevels.length - 1; i++) {
      const topP = plateLevels[i];
      const botP = plateLevels[i + 1];
      const rodCount = 3;
      const rodRadius = 0.045;
      const heightBetween = topP.y - botP.y - (topP.h + botP.h) / 2;
      const midY = (topP.y + botP.y) / 2;
      const orbitR = (topP.r + botP.r) * 0.38;

      for (let r = 0; r < rodCount; r++) {
        const angle = (r / rodCount) * Math.PI * 2 + (i * 0.4);
        const rodGeom = new THREE.CylinderGeometry(rodRadius, rodRadius, heightBetween, 16);
        const rodMesh = new THREE.Mesh(rodGeom, silverMaterial);
        rodMesh.position.set(Math.cos(angle) * orbitR, midY, Math.sin(angle) * orbitR);
        cryostatGroup.add(rodMesh);
      }
    }

    // Coaxial Spiral Pulse Lines (Helical RF / Microwave Lines)
    const lineCount = 8;
    for (let l = 0; l < lineCount; l++) {
      const baseAngle = (l / lineCount) * Math.PI * 2;
      const points = [];
      const totalSteps = 60;
      const startY = plateLevels[0].y;
      const endY = plateLevels[4].y;

      for (let s = 0; s <= totalSteps; s++) {
        const t = s / totalSteps;
        const currY = startY + (endY - startY) * t;
        const currR = 1.7 * (1 - t * 0.5) + Math.sin(t * Math.PI * 5) * 0.08;
        const currAngle = baseAngle + t * Math.PI * 2.5;
        points.push(new THREE.Vector3(Math.cos(currAngle) * currR, currY, Math.sin(currAngle) * currR));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeom = new THREE.TubeGeometry(curve, 64, 0.022, 8, false);
      const tubeMat = (l % 2 === 0) ? goldMaterial : copperMaterial;
      const tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
      cryostatGroup.add(tubeMesh);
    }

    // Attenuator Blocks on 4K and Cold Plate stages
    const attGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.22, 16);
    for (let a = 0; a < 6; a++) {
      const angle = (a / 6) * Math.PI * 2;
      const attMesh1 = new THREE.Mesh(attGeom, silverMaterial);
      attMesh1.position.set(Math.cos(angle) * 1.1, 0.4 - 0.15, Math.sin(angle) * 1.1);
      cryostatGroup.add(attMesh1);

      const attMesh2 = new THREE.Mesh(attGeom, silverMaterial);
      attMesh2.position.set(Math.cos(angle) * 0.8, -0.8 - 0.15, Math.sin(angle) * 0.8);
      cryostatGroup.add(attMesh2);
    }

    // QPU Shield Can & Base Quantum Stage (Mixing chamber bottom)
    const qpuCanGeom = new THREE.CylinderGeometry(0.55, 0.45, 0.9, 32);
    const qpuCanMesh = new THREE.Mesh(qpuCanGeom, qpuCaseMaterial);
    qpuCanMesh.position.y = -2.6;
    qpuCanMesh.userData = { stageId: 'mixing' };
    cryostatGroup.add(qpuCanMesh);

    // QPU Quantum Core Window (Glowing quantum chip)
    const chipCoreGeom = new THREE.BoxGeometry(0.35, 0.08, 0.35);
    const chipCoreMesh = new THREE.Mesh(chipCoreGeom, chipGlowMaterial);
    chipCoreMesh.position.y = -2.6;
    chipCoreMesh.userData = { stageId: 'mixing' };
    cryostatGroup.add(chipCoreMesh);

    // Outer Vacuum Shield (optional toggle)
    const shieldGeom = new THREE.CylinderGeometry(2.35, 1.4, 5.8, 32, 1, true);
    const shieldMesh = new THREE.Mesh(shieldGeom, shieldMaterial);
    shieldMesh.position.y = 0.3;
    shieldMesh.visible = showShield;
    cryostatGroup.add(shieldMesh);

    // Target Camera Coordinates based on active stage
    const activeLevel = plateLevels.find(p => p.id === activeStage.id) || plateLevels[4];
    const targetCamY = activeLevel.camY;
    const targetCamZ = activeLevel.camZ;

    // 5. Interactive Drag to Orbit & Raycast Selection
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    let targetRotationY = 0.4;
    let targetRotationX = 0.15;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e) => {
      isDragging = true;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMouseX;
      const deltaY = e.clientY - previousMouseY;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.005;
      targetRotationX = Math.max(-0.6, Math.min(0.8, targetRotationX));

      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = (e) => {
      const rect = domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cryostatGroup.children, true);

      if (intersects.length > 0) {
        let hit = intersects[0].object;
        while (hit && !hit.userData?.stageId && hit.parent !== cryostatGroup) {
          hit = hit.parent;
        }
        const stageId = hit?.userData?.stageId;
        if (stageId) {
          const found = STAGES.find(s => s.id === stageId);
          if (found) setActiveStage(found);
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    domElement.addEventListener('click', onClick);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 6. Animation Loop with Smooth Camera Focusing
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging) {
        targetRotationY += 0.003;
      }

      // Smooth camera interpolation towards active stage height and zoom
      camera.position.y += (targetCamY - camera.position.y) * 0.06;
      camera.position.z += (targetCamZ - camera.position.z) * 0.06;
      camera.lookAt(0, camera.position.y, 0);

      // Smooth damping for rotations
      cryostatGroup.rotation.y += (targetRotationY - cryostatGroup.rotation.y) * 0.08;
      cryostatGroup.rotation.x += (targetRotationX - cryostatGroup.rotation.x) * 0.08;

      // Update Halos & Emissive highlights based on active stage
      Object.entries(stageMeshes).forEach(([id, obj]) => {
        const isCurrent = (id === activeStage.id);
        obj.halo.visible = isCurrent;
        if (isCurrent) {
          obj.halo.rotation.z += 0.02; // Rotate glow halo
          obj.mesh.material.emissive = new THREE.Color(0x0284C7);
          obj.mesh.material.emissiveIntensity = 0.35 + Math.sin(Date.now() * 0.005) * 0.15;
        } else {
          obj.mesh.material.emissive = new THREE.Color(0x000000);
          obj.mesh.material.emissiveIntensity = 0;
        }
      });

      // Pulse the quantum chip core
      const time = Date.now() * 0.003;
      pointLight.intensity = (activeStage.id === 'mixing') ? (1.5 + Math.sin(time) * 0.5) : (0.8 + Math.sin(time) * 0.2);

      shieldMesh.visible = showShield;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      camera.aspect = newW / h;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      domElement.removeEventListener('mousedown', onMouseDown);
      domElement.removeEventListener('click', onClick);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, [height, showShield, autoRotate, activeStage]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* 3D Canvas Container */}
      <div style={{ position: 'relative', width: '100%', height: `${height}px`, backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--border-subtle)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

        {/* 3D Controls Overlay */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              backgroundColor: autoRotate ? '#EFF6FF' : '#FFFFFF',
              color: autoRotate ? 'var(--accent-primary)' : 'var(--text-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            {autoRotate ? '⏸ PAUSE ROTATION' : '▶ AUTO ROTATE'}
          </button>
          <button
            onClick={() => setShowShield(!showShield)}
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              backgroundColor: showShield ? '#EFF6FF' : '#FFFFFF',
              color: showShield ? 'var(--accent-primary)' : 'var(--text-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            {showShield ? 'HIDE VACUUM CAN' : 'SHOW VACUUM CAN'}
          </button>
        </div>

        {/* Status Pill */}
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255, 255, 255, 0.92)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
          <span>BASE TEMP: <strong style={{ color: 'var(--accent-primary)' }}>12.4 mK</strong> (ACTIVE DILUTION)</span>
        </div>
      </div>

      {/* Cryostat Stage Interactive Breakdown */}
      {showDetails && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {STAGES.map((stg) => {
            const isSelected = activeStage.id === stg.id;
            return (
              <div
                key={stg.id}
                onClick={() => setActiveStage(stg)}
                style={{
                  padding: '12px 14px',
                  backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                  border: isSelected ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? 'var(--shadow-sm)' : 'var(--shadow-xs)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                    {stg.name}
                  </span>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {stg.temp}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {stg.desc.slice(0, 75)}...
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
