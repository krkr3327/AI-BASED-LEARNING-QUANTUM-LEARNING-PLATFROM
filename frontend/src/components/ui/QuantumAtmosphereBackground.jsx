import React, { useEffect, useRef } from "react";

/**
 * QuantumAtmosphereBackground
 * 
 * An illuminated, responsive quantum atmospheric background in a modern light theme
 * (and complementary role themes: Trainer Faculty Copper/Indigo and Learner Quantum Blue/Cyan)
 * featuring small, elegant 3D floating visual models of iconic quantum hardware:
 * 1. 3D Golden Quantum Dilution Refrigerator (Cryostat Chandelier with coaxial lines & mixing chamber)
 * 2. 3D Superconducting Transmon QPU Processor Chip (Silicon die with transmon crosses & CPW meander lines)
 * 3. 3D Trapped-Ion Vacuum Chamber & Laser Lattice (Hexagonal Paul trap with glowing trapped ions)
 * 4. Subtle ambient floating Dirac badges and entangled particle wave filaments.
 */
export default function QuantumAtmosphereBackground({ theme = "light", role = "trainer" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Mouse tracking for subtle field responsiveness
    let mouse = { x: -2000, y: -2000, active: false };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // ── 3D COMPACT QUANTUM MACHINES FLOATING OBJECTS ──
    const isTrainer = role === "trainer";
    const quantumMachines = {
      // 1. Golden Dilution Refrigerator Cryostat Chandelier (Top-Right)
      cryostat: {
        baseX: width * 0.85,
        baseY: height * 0.26,
        scale: 0.58, // Small, elegant size
        floatPhase: 0,
        tiltAngle: 0.05
      },
      // 2. Superconducting Transmon QPU Chip (Mid-Left)
      qpuChip: {
        baseX: width * 0.12,
        baseY: height * 0.45,
        scale: 0.62, // Small, elegant size
        floatPhase: 1.8,
        rotAngle: 0.35
      },
      // 3. Trapped Ion Laser Chamber (Bottom-Right / Center)
      ionTrap: {
        baseX: width * 0.80,
        baseY: height * 0.82,
        scale: 0.56, // Small, elegant size
        floatPhase: 3.5,
        pulsePhase: 0
      }
    };

    // ── FLOATING QUANTUM GATE & STATE BADGES ──
    const glyphs = [
      { text: "[ H ]", x: width * 0.07, y: height * 0.14, vx: 0.1, vy: -0.12, phase: 0, color: "#0284C7", bg: "rgba(255, 255, 255, 0.85)", border: "#BAE6FD" },
      { text: "|0⟩ + |1⟩", x: width * 0.48, y: height * 0.10, vx: -0.12, vy: 0.08, phase: 1.2, color: "#6366F1", bg: "rgba(255, 255, 255, 0.85)", border: "#C7D2FE" },
      { text: "⊕ CNOT", x: width * 0.05, y: height * 0.78, vx: 0.09, vy: 0.1, phase: 2.5, color: isTrainer ? "#B45309" : "#0D9488", bg: "rgba(255, 255, 255, 0.85)", border: isTrainer ? "#FDE68A" : "#99F6E4" },
      { text: "[ X ]", x: width * 0.94, y: height * 0.58, vx: -0.1, vy: -0.12, phase: 3.8, color: "#DB2777", bg: "rgba(255, 255, 255, 0.85)", border: "#FBCFE8" },
      { text: "⟨ψ|φ⟩ = 1", x: width * 0.36, y: height * 0.90, vx: 0.08, vy: -0.09, phase: 4.6, color: "#059669", bg: "rgba(255, 255, 255, 0.85)", border: "#A7F3D0" },
      { text: "[ RZ(π/4) ]", x: width * 0.58, y: height * 0.94, vx: -0.09, vy: -0.08, phase: 5.4, color: "#2563EB", bg: "rgba(255, 255, 255, 0.85)", border: "#BFDBFE" }
    ];

    // ── ENTANGLED PARTICLES ──
    const particleCount = 28;
    const particles = Array.from({ length: particleCount }, (_, idx) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 2 + 1.2,
      phase: Math.random() * Math.PI * 2,
      color: idx % 4 === 0 ? "#0284C7" : idx % 4 === 1 ? "#6366F1" : idx % 4 === 2 ? (isTrainer ? "#D97706" : "#0D9488") : "#10B981"
    }));

    let time = 0;

    // ── 3D GOLDEN DILUTION REFRIGERATOR CRYOSTAT CHANDELIER ──
    const draw3DCryostat = (cx, cy, scale, t) => {
      ctx.save();
      const bobY = cy + Math.sin(t * 0.8) * 10;
      const tilt = Math.sin(t * 0.5) * 0.03;
      ctx.translate(cx, bobY);
      ctx.rotate(tilt);
      ctx.scale(scale, scale);

      // Soft ambient golden/cyan halo
      const glowGrad = ctx.createRadialGradient(0, 70, 10, 0, 70, 140);
      glowGrad.addColorStop(0, "rgba(245, 158, 11, 0.18)");
      glowGrad.addColorStop(0.6, "rgba(14, 165, 233, 0.1)");
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(-150, -60, 300, 300);

      // Central Support Column
      ctx.fillStyle = "#92400E";
      ctx.fillRect(-5, -40, 10, 220);

      // Gold Metallic Plates Helper
      const drawPlate = (y, w, h, goldLight, goldDark) => {
        const grad = ctx.createLinearGradient(-w, y, w, y);
        grad.addColorStop(0, goldDark);
        grad.addColorStop(0.3, goldLight);
        grad.addColorStop(0.7, "#FFFBEB");
        grad.addColorStop(1, goldDark);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, y, w, h, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // 3D Rim Thickness
        ctx.fillStyle = goldDark;
        ctx.beginPath();
        ctx.ellipse(0, y + 4, w, h, 0, 0, Math.PI);
        ctx.fill();
      };

      // TIER 1: 50K Top Flange
      drawPlate(-20, 90, 16, "#F59E0B", "#B45309");

      // Coaxial Cables Tier 1 -> Tier 2
      ctx.strokeStyle = "#D97706";
      ctx.lineWidth = 1.6;
      for (let i = -65; i <= 65; i += 22) {
        ctx.beginPath();
        ctx.moveTo(i, -20);
        ctx.bezierCurveTo(i + 8, 5, i - 8, 20, i * 0.8, 35);
        ctx.stroke();
      }

      // TIER 2: 4K Thermal Plate
      drawPlate(35, 74, 14, "#FBBF24", "#92400E");

      // Coaxial Cables Tier 2 -> Tier 3
      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 1.5;
      for (let i = -52; i <= 52; i += 18) {
        ctx.beginPath();
        ctx.moveTo(i, 35);
        ctx.bezierCurveTo(i + 6, 55, i - 6, 70, i * 0.75, 85);
        ctx.stroke();
      }

      // TIER 3: Still Stage Plate
      drawPlate(85, 58, 12, "#FCD34D", "#B45309");

      // Copper Heat Straps & Mixing Lines
      ctx.strokeStyle = "#CBD5E1";
      ctx.lineWidth = 1.3;
      for (let i = -40; i <= 40; i += 16) {
        ctx.beginPath();
        ctx.moveTo(i, 85);
        ctx.bezierCurveTo(i + 5, 105, i - 5, 120, i * 0.7, 135);
        ctx.stroke();
      }

      // TIER 4: Cold Plate
      drawPlate(135, 45, 10, "#FEF08A", "#D97706");

      // TIER 5: Mixing Chamber (15 mK Base)
      drawPlate(175, 32, 7, "#FFFFFF", "#F59E0B");

      // Bottom Superconducting Quantum Chip Enclosure Canister
      ctx.fillStyle = "rgba(14, 165, 233, 0.9)";
      ctx.shadowColor = "#38BDF8";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(-14, 180, 28, 34, 6);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Glowing Pulse at bottom QPU Canister
      const qpuPulse = 0.5 + Math.sin(t * 3) * 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${qpuPulse * 0.9})`;
      ctx.beginPath();
      ctx.arc(0, 197, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Holographic Temperature Tag
      ctx.font = "700 9px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#0284C7";
      ctx.textAlign = "center";
      ctx.fillText("15 mK CRYOSTAT", 0, 226);

      ctx.restore();
    };

    // ── 3D SUPERCONDUCTING TRANSMON QPU PROCESSOR CHIP ──
    const draw3DQPUChip = (cx, cy, scale, t) => {
      ctx.save();
      const bobY = cy + Math.sin(t * 0.9 + 1) * 9;
      const rot = 0.35 + Math.sin(t * 0.4) * 0.06;
      ctx.translate(cx, bobY);
      ctx.rotate(rot);
      ctx.scale(scale, scale);

      // Ambient Chip Glow
      const chipGlow = ctx.createRadialGradient(0, 0, 15, 0, 0, 120);
      chipGlow.addColorStop(0, "rgba(56, 189, 248, 0.22)");
      chipGlow.addColorStop(0.5, "rgba(99, 102, 241, 0.1)");
      chipGlow.addColorStop(1, "transparent");
      ctx.fillStyle = chipGlow;
      ctx.fillRect(-130, -130, 260, 260);

      // Sapphire Silicon Substrate Die (Polished Glass Blue)
      ctx.fillStyle = "rgba(240, 249, 255, 0.95)";
      ctx.strokeStyle = "#0284C7";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-75, -75, 150, 150, 12);
      ctx.fill();
      ctx.stroke();

      // Gold Wirebond Pads Around Perimeter
      ctx.fillStyle = "#D97706";
      const padSize = 7;
      for (let p = -60; p <= 60; p += 15) {
        ctx.fillRect(p, -73, padSize, 5);
        ctx.fillRect(p, 68, padSize, 5);
        ctx.fillRect(-73, p, 5, padSize);
        ctx.fillRect(68, p, 5, padSize);
      }

      // Microwave Waveguide Meander Lines
      ctx.strokeStyle = "rgba(2, 132, 199, 0.4)";
      ctx.lineWidth = 1.2;
      const drawMeander = (sx, sy, ex, ey) => {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + 8, sy + 5);
        ctx.lineTo(sx - 8, sy + 12);
        ctx.lineTo(sx + 8, sy + 19);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      };
      drawMeander(-30, -30, 30, -30);
      drawMeander(-30, 30, 30, 30);
      drawMeander(-30, -30, -30, 30);
      drawMeander(30, -30, 30, 30);

      // Transmon Qubit Crosses
      const transmonCoords = [
        { x: -30, y: -30, label: "q0" },
        { x: 30, y: -30, label: "q1" },
        { x: -30, y: 30, label: "q2" },
        { x: 30, y: 30, label: "q3" }
      ];

      transmonCoords.forEach((q, idx) => {
        const pulse = 0.5 + Math.sin(t * 2.5 + idx * 1.2) * 0.5;

        // Cross arms
        ctx.fillStyle = "#0284C7";
        ctx.shadowColor = "#38BDF8";
        ctx.shadowBlur = 8 * pulse;
        ctx.fillRect(q.x - 10, q.y - 2.5, 20, 5);
        ctx.fillRect(q.x - 2.5, q.y - 10, 5, 20);
        ctx.shadowBlur = 0;

        // Josephson Junction Center Dot
        ctx.fillStyle = "#D97706";
        ctx.beginPath();
        ctx.arc(q.x, q.y, 2, 0, Math.PI * 2);
        ctx.fill();

        // Qubit Label
        ctx.font = "800 8.5px 'JetBrains Mono', monospace";
        ctx.fillStyle = "#1E293B";
        ctx.textAlign = "center";
        ctx.fillText(q.label, q.x, q.y - 12);
      });

      // Central Chip Label
      ctx.font = "800 9px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#4F46E5";
      ctx.textAlign = "center";
      ctx.fillText("4-QUBIT TRANSMON QPU", 0, 56);

      ctx.restore();
    };

    // ── 3D TRAPPED-ION LASER VACUUM CHAMBER ──
    const draw3DIonTrap = (cx, cy, scale, t) => {
      ctx.save();
      const bobY = cy + Math.sin(t * 0.7 + 2) * 8;
      ctx.translate(cx, bobY);
      ctx.scale(scale, scale);

      // Chamber Glow
      const trapGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, 110);
      trapGlow.addColorStop(0, "rgba(16, 185, 129, 0.18)");
      trapGlow.addColorStop(0.6, "rgba(56, 189, 248, 0.1)");
      trapGlow.addColorStop(1, "transparent");
      ctx.fillStyle = trapGlow;
      ctx.fillRect(-110, -110, 220, 220);

      // Hexagonal Titanium Vacuum Chamber
      ctx.strokeStyle = "#94A3B8";
      ctx.lineWidth = 2;
      ctx.fillStyle = "rgba(248, 250, 252, 0.95)";
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = Math.cos(angle) * 70;
        const y = Math.sin(angle) * 70;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Optical Viewport Windows
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = Math.cos(angle) * 50;
        const y = Math.sin(angle) * 50;
        ctx.fillStyle = "rgba(186, 230, 253, 0.6)";
        ctx.strokeStyle = "#0284C7";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Linear Paul Trap Electrodes
      ctx.fillStyle = "#D97706";
      ctx.fillRect(-40, -14, 80, 3.5);
      ctx.fillRect(-40, 10.5, 80, 3.5);

      // Blue Laser Beam
      ctx.strokeStyle = "rgba(2, 132, 199, 0.8)";
      ctx.lineWidth = 1.4;
      ctx.shadowColor = "#38BDF8";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(-80, 0);
      ctx.lineTo(80, 0);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Trapped Fluorescent Ion Chain
      const ions = [-20, -10, 0, 10, 20];
      ions.forEach((ix, i) => {
        const ionPulse = 0.6 + Math.sin(t * 4 + i) * 0.4;
        ctx.fillStyle = "#059669";
        ctx.shadowColor = "#10B981";
        ctx.shadowBlur = 10 * ionPulse;
        ctx.beginPath();
        ctx.arc(ix, 0, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Holographic Chamber Label
      ctx.font = "800 9px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#059669";
      ctx.textAlign = "center";
      ctx.fillText("TRAPPED-ION CAVITY", 0, 44);

      ctx.restore();
    };

    // ── MAIN RAF ANIMATION LOOP ──
    const render = () => {
      time += 0.016;

      ctx.clearRect(0, 0, width, height);

      // ── LIGHT THEME BASE QUANTUM SKY CANVAS ──
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      if (isTrainer) {
        bgGrad.addColorStop(0, "#F4F8FC");   // Soft Luminous Cloud
        bgGrad.addColorStop(0.5, "#EBF3FA"); // Warm Faculty Sky
        bgGrad.addColorStop(1, "#F8FAFC");   // Crisp Celestial Pearl
      } else {
        bgGrad.addColorStop(0, "#F0F6FC");   // Electric Azure Sky
        bgGrad.addColorStop(0.5, "#E8F2FA"); // Luminous Cyan Indigo
        bgGrad.addColorStop(1, "#F5F9FF");   // Ultra-light Cyan Canvas
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle Holographic Nebulae
      const drawNebula = (cx, cy, radius, colorStop) => {
        const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        radGrad.addColorStop(0, colorStop);
        radGrad.addColorStop(1, "transparent");
        ctx.fillStyle = radGrad;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      };

      if (isTrainer) {
        drawNebula(width * 0.85, height * 0.22, width * 0.40, "rgba(245, 158, 11, 0.10)");
        drawNebula(width * 0.12, height * 0.45, width * 0.35, "rgba(58, 104, 164, 0.10)");
        drawNebula(width * 0.80, height * 0.80, width * 0.35, "rgba(16, 185, 129, 0.08)");
      } else {
        drawNebula(width * 0.85, height * 0.22, width * 0.40, "rgba(14, 165, 233, 0.12)");
        drawNebula(width * 0.12, height * 0.45, width * 0.35, "rgba(99, 102, 241, 0.10)");
        drawNebula(width * 0.80, height * 0.80, width * 0.35, "rgba(20, 184, 166, 0.09)");
      }

      // Crisp Light Quantum Matrix Grid
      ctx.strokeStyle = "rgba(58, 104, 164, 0.05)";
      ctx.lineWidth = 1;
      const gridSize = 64;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // ── DRAW 3D FLOATING QUANTUM MACHINES (Small, refined & elegant) ──
      draw3DCryostat(quantumMachines.cryostat.baseX, quantumMachines.cryostat.baseY, quantumMachines.cryostat.scale, time);
      draw3DQPUChip(quantumMachines.qpuChip.baseX, quantumMachines.qpuChip.baseY, quantumMachines.qpuChip.scale, time);
      draw3DIonTrap(quantumMachines.ionTrap.baseX, quantumMachines.ionTrap.baseY, quantumMachines.ionTrap.scale, time);

      // ── DRAW FLOATING PARTICLES & ENERGY LINKS ──
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100 && dist > 0) {
            p.x -= (dx / dist) * 0.6;
            p.y -= (dy / dist) * 0.6;
          }
        }

        const pulse = 1 + Math.sin(time * 2 + p.phase) * 0.25;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dX = p.x - p2.x;
          const dY = p.y - p2.y;
          const dist = Math.sqrt(dX * dX + dY * dY);

          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.22;
            ctx.strokeStyle = `rgba(58, 104, 164, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      // ── DRAW FLOATING QUANTUM GATE BADGES ──
      glyphs.forEach((glyph) => {
        glyph.x += glyph.vx;
        glyph.y += glyph.vy;

        if (glyph.x < -60) glyph.x = width + 60;
        if (glyph.x > width + 60) glyph.x = -60;
        if (glyph.y < -40) glyph.y = height + 40;
        if (glyph.y > height + 40) glyph.y = -40;

        const bobY = glyph.y + Math.sin(time * 1.2 + glyph.phase) * 10;
        const bobRotate = Math.sin(time * 0.8 + glyph.phase) * 0.05;

        ctx.save();
        ctx.translate(glyph.x, bobY);
        ctx.rotate(bobRotate);

        ctx.font = `700 10.5px 'JetBrains Mono', monospace`;
        const textWidth = ctx.measureText(glyph.text).width;
        const paddingX = 9;
        const pillWidth = textWidth + paddingX * 2;
        const pillHeight = 20;

        ctx.fillStyle = glyph.bg;
        ctx.strokeStyle = glyph.border;
        ctx.lineWidth = 1;
        ctx.shadowColor = "rgba(0, 0, 0, 0.05)";
        ctx.shadowBlur = 4;

        ctx.beginPath();
        ctx.roundRect(-pillWidth / 2, -pillHeight / 2, pillWidth, pillHeight, 6);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.stroke();

        ctx.fillStyle = glyph.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(glyph.text, 0, 0);

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [theme, role]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none"
      }}
    />
  );
}
