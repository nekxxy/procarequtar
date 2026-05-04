import { useRef, useMemo, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  PerspectiveCamera,
  OrbitControls,
  Edges,
} from "@react-three/drei";
import type { Group, Mesh } from "three";
import * as THREE from "three";

interface FloorProps {
  index: number;
  total: number;
  /** Scrub progress 0..1 — controls how many floors are visible */
  progress: number;
}

function Floor({ index, total, progress }: FloorProps) {
  const ref = useRef<Mesh>(null);
  // Floors enter from below as scroll progresses through their threshold
  const threshold = index / Math.max(total - 1, 1);
  const visible = progress >= threshold * 0.6;

  useFrame((_, delta) => {
    if (!ref.current) return;
    const targetY = visible ? index * 0.32 : index * 0.32 - 1.2;
    const targetOpacity = visible ? 1 : 0;
    ref.current.position.y += (targetY - ref.current.position.y) * Math.min(delta * 6, 1);
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    if (mat) {
      mat.opacity += (targetOpacity - mat.opacity) * Math.min(delta * 6, 1);
      mat.transparent = true;
    }
  });

  // Slight footprint taper toward the top
  const taper = 1 - (index / total) * 0.18;

  return (
    <mesh ref={ref} position={[0, index * 0.32 - 1.2, 0]}>
      <boxGeometry args={[1.6 * taper, 0.28, 1.6 * taper]} />
      <meshStandardMaterial
        color="#0E0E0C"
        metalness={0.2}
        roughness={0.55}
        transparent
        opacity={0}
      />
      <Edges color="#FF5B1F" lineWidth={1} threshold={15} />
    </mesh>
  );
}

interface CraneProps {
  topY: number;
}

function Crane({ topY }: CraneProps) {
  const jib = useRef<Group>(null);
  useFrame((_, dt) => {
    if (jib.current) jib.current.rotation.y += dt * 0.25;
  });

  return (
    <group position={[0, topY, 0]}>
      {/* Mast */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.12, 1, 0.12]} />
        <meshStandardMaterial color="#0E0E0C" />
        <Edges color="#FF5B1F" lineWidth={1} />
      </mesh>
      {/* Rotating jib */}
      <group ref={jib} position={[0, 1, 0]}>
        <mesh position={[0.9, 0, 0]}>
          <boxGeometry args={[2.2, 0.06, 0.1]} />
          <meshStandardMaterial color="#0E0E0C" />
          <Edges color="#FF5B1F" lineWidth={1} />
        </mesh>
        {/* Counter-jib */}
        <mesh position={[-0.5, 0, 0]}>
          <boxGeometry args={[1, 0.06, 0.1]} />
          <meshStandardMaterial color="#0E0E0C" />
          <Edges color="#FF5B1F" lineWidth={1} />
        </mesh>
        {/* Hook line */}
        <mesh position={[1.6, -0.4, 0]}>
          <boxGeometry args={[0.02, 0.8, 0.02]} />
          <meshStandardMaterial color="#FF5B1F" />
        </mesh>
        {/* Hook */}
        <mesh position={[1.6, -0.85, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#FF5B1F" emissive="#FF5B1F" emissiveIntensity={0.35} />
        </mesh>
      </group>
    </group>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.45, 0]}>
      <planeGeometry args={[12, 12, 12, 12]} />
      <meshStandardMaterial color="#F4F1EC" wireframe wireframeLinewidth={1} />
    </mesh>
  );
}

interface ParticlesProps {
  count?: number;
}

function Particles({ count = 80 }: ParticlesProps) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 1] = Math.random() * 5 - 1;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const attr = ref.current.geometry.attributes.position;
    if (!attr) return;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3 + 1;
      arr[idx] = (arr[idx] ?? 0) + dt * 0.18;
      if ((arr[idx] ?? 0) > 4) arr[idx] = -1.5;
    }
    attr.needsUpdate = true;
    ref.current.rotation.y += dt * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#FF5B1F" sizeAttenuation transparent opacity={0.65} />
    </points>
  );
}

interface SceneProps {
  progress: number;
  floors: number;
}

function Scene({ progress, floors }: SceneProps) {
  const group = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, dt) => {
    if (!group.current) return;
    // Idle tilt + mouse-driven rotate
    const t = state.clock.elapsedTime;
    const targetRotY = Math.sin(t * 0.15) * 0.2 + state.mouse.x * 0.4;
    const targetRotX = Math.cos(t * 0.18) * 0.05 + state.mouse.y * -0.15;
    group.current.rotation.y += (targetRotY - group.current.rotation.y) * Math.min(dt * 1.5, 1);
    group.current.rotation.x += (targetRotX - group.current.rotation.x) * Math.min(dt * 1.5, 1);
  });

  const topY = floors * 0.32 - 1.2;

  return (
    <group
      ref={group}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Ground />
      {Array.from({ length: floors }).map((_, i) => (
        <Floor key={i} index={i} total={floors} progress={progress} />
      ))}
      <Crane topY={topY} />
      <Particles count={hovered ? 140 : 80} />
    </group>
  );
}

interface HeroSceneProps {
  /** Number of floors to build */
  floors?: number;
}

/**
 * Real 3D hero scene. A box-tower stack with rotating tower-crane,
 * floating ember particles, wireframe ground plane and idle parallax.
 * Floors fade in from below as the user scrolls down the hero.
 *
 * Wrapped in Suspense + Canvas so it's safe to mount via client:visible.
 */
export default function HeroScene3D({ floors = 14 }: HeroSceneProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0.5);

  useEffect(() => {
    if (typeof window === "undefined" || !wrap.current) return;
    const el = wrap.current;
    let raf = 0;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const seen = (vh - rect.top) / (vh + rect.height);
      const next = Math.min(Math.max(seen, 0), 1);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setProgress(next));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={wrap}
      className="relative aspect-[4/5] w-full max-w-[640px]"
      aria-hidden="true"
    >
      <Canvas
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.6]}
        camera={{ position: [3.8, 2.6, 4.6], fov: 38 }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[3.8, 2.6, 4.6]} fov={38} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[6, 10, 4]} intensity={1.1} color="#fff" />
          <pointLight position={[-3, 2, 4]} intensity={0.6} color="#FF5B1F" />
          <Float speed={1.2} floatIntensity={0.3} rotationIntensity={0}>
            <Scene progress={progress} floors={floors} />
          </Float>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
          />
          <fog attach="fog" args={["#F4F1EC", 8, 22]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
