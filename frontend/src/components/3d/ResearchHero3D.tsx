'use client';

import * as React from 'react';
import * as THREE from 'three';

export function ResearchHero3D() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = React.useState(true);
  const [isReducedMotion, setIsReducedMotion] = React.useState(false);

  React.useEffect(() => {
    // Check prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    motionQuery.addEventListener('change', handleMotionChange);

    const container = containerRef.current;
    if (!container) return;

    // Verify WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.08);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 7.5);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const violetPointLight = new THREE.PointLight(0x7c3aed, 6, 25);
    violetPointLight.position.set(4, 3, 4);
    scene.add(violetPointLight);

    const cyanPointLight = new THREE.PointLight(0x06b6d4, 5, 25);
    cyanPointLight.position.set(-4, -3, 3);
    scene.add(cyanPointLight);

    // 4. Central Intelligence Core (Icosahedron + Glowing Core)
    const coreGroup = new THREE.Group();

    // Outer lattice wireframe
    const outerGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
      roughness: 0.2,
      metalness: 0.8,
    });
    const outerCore = new THREE.Mesh(outerGeo, outerMat);
    coreGroup.add(outerCore);

    // Inner glowing core
    const innerGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.85,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerCore);

    // Orbital ring
    const ringGeo = new THREE.TorusGeometry(2.2, 0.015, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.6,
    });
    const orbitalRing = new THREE.Mesh(ringGeo, ringMat);
    orbitalRing.rotation.x = Math.PI / 3;
    coreGroup.add(orbitalRing);

    scene.add(coreGroup);

    // 5. Stylized Floating Research Document Meshes
    function createDocumentTexture(titleText: string, tagText: string) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 700;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.Texture();

      // Card surface
      ctx.fillStyle = '#0f172a';
      ctx.roundRect(0, 0, 512, 700, 32);
      ctx.fill();

      // Border glow
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 6;
      ctx.roundRect(0, 0, 512, 700, 32);
      ctx.stroke();

      // Top Tag pill
      ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
      ctx.roundRect(40, 50, 180, 44, 22);
      ctx.fill();
      ctx.fillStyle = '#a78bfa';
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.fillText(tagText, 60, 80);

      // Paper Title
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 32px Inter, sans-serif';
      ctx.fillText(titleText, 40, 150);

      // Abstract lines
      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
      for (let y = 200; y < 450; y += 28) {
        const lineWidth = y % 56 === 0 ? 360 : 430;
        ctx.fillRect(40, y, lineWidth, 10);
      }

      // Mathematical matrix box
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.roundRect(40, 480, 432, 140, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 2;
      ctx.roundRect(40, 480, 432, 140, 16);
      ctx.stroke();

      ctx.fillStyle = '#22d3ee';
      ctx.font = '22px "JetBrains Mono", monospace';
      ctx.fillText('Attention(Q, K, V) =', 65, 540);
      ctx.fillText('softmax(QK^T / sqrt(d))V', 65, 580);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    }

    const papersGroup = new THREE.Group();
    const paperSpecs = [
      {
        title: 'Attention Is All You Need',
        tag: 'Vaswani et al.',
        pos: new THREE.Vector3(-2.8, 0.8, 0.5),
        rot: new THREE.Euler(0.1, 0.35, -0.05),
      },
      {
        title: 'Deep Residual Learning',
        tag: 'He et al. (CVPR)',
        pos: new THREE.Vector3(2.9, -0.6, 0.2),
        rot: new THREE.Euler(-0.15, -0.4, 0.08),
      },
      {
        title: 'FlashAttention: IO-Aware',
        tag: 'Dao et al. (NeurIPS)',
        pos: new THREE.Vector3(0.1, -2.1, 1.2),
        rot: new THREE.Euler(0.35, 0.05, -0.05),
      },
    ];

    const paperMeshes: THREE.Mesh[] = [];

    paperSpecs.forEach((spec) => {
      const texture = createDocumentTexture(spec.title, spec.tag);
      const paperGeo = new THREE.PlaneGeometry(1.6, 2.2, 16, 16);
      const paperMat = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        roughness: 0.3,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });

      const paperMesh = new THREE.Mesh(paperGeo, paperMat);
      paperMesh.position.copy(spec.pos);
      paperMesh.rotation.copy(spec.rot);
      papersGroup.add(paperMesh);
      paperMeshes.push(paperMesh);
    });

    scene.add(papersGroup);

    // 6. Neural Particle Constellation
    const particleCount = 1200;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorViolet = new THREE.Color(0x8b5cf6);
    const colorCyan = new THREE.Color(0x06b6d4);
    const colorWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount; i++) {
      // Distribute in a spherical cloud around center
      const radius = 2.5 + Math.random() * 5.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const chosenColor =
        i % 3 === 0 ? colorViolet : i % 3 === 1 ? colorCyan : colorWhite;
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // 7. Mouse Parallax & Smooth Lerp
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 8. Resize Observer
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // 9. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Camera parallax interpolation
      targetX = mouseX * 0.8;
      targetY = mouseY * 0.6;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Core rotation
      outerCore.rotation.x = elapsedTime * 0.25;
      outerCore.rotation.y = elapsedTime * 0.35;
      orbitalRing.rotation.z = elapsedTime * 0.4;

      // Pulsing inner core scale
      const pulse = 1 + Math.sin(elapsedTime * 2.5) * 0.08;
      innerCore.scale.set(pulse, pulse, pulse);

      // Particle system gentle orbit
      particleSystem.rotation.y = elapsedTime * 0.05;
      particleSystem.rotation.x = elapsedTime * 0.02;

      // Floating harmonic motion for document meshes
      paperMeshes.forEach((mesh, index) => {
        mesh.position.y =
          paperSpecs[index].pos.y + Math.sin(elapsedTime * 1.5 + index * 2) * 0.12;
        mesh.rotation.z =
          paperSpecs[index].rot.z + Math.cos(elapsedTime * 1.2 + index) * 0.03;
      });

      renderer.render(scene, camera);
    };

    animate();

    // 10. Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      motionQuery.removeEventListener('change', handleMotionChange);
      cancelAnimationFrame(animationFrameId);

      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      outerGeo.dispose();
      outerMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (!hasWebGL || isReducedMotion) {
    return <FallbackHero />;
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden"
      aria-label="3D Scientific Knowledge Simulation"
    />
  );
}

export function FallbackHero() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden bg-grid-pattern">
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy-950/40 to-navy-950" />
    </div>
  );
}
