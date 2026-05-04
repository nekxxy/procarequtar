import { useRef, useMemo, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, PerspectiveCamera, Edges } from "@react-three/drei";
import type { Group } from "three";

const GLYPHS = [
  // construction — stacked cubes
  () => (
    <group>
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[0.55, 0.18, 0.55]} />
        <meshStandardMaterial color="#0E0E0C" />
        <Edges color="#FF5B1F" lineWidth={1} />
      </mesh>
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[0.5, 0.18, 0.5]} />
        <meshStandardMaterial color="#0E0E0C" />
        <Edges color="#FF5B1F" lineWidth={1} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.42, 0.18, 0.42]} />
        <meshStandardMaterial color="#0E0E0C" />
        <Edges color="#FF5B1F" lineWidth={1} />
      </mesh>
    </group>
  ),
  // post-construction-cleaning — floating sphere with rings
  () => (
    <group>
      <mesh>
        <sphereGeometry args={[0.36, 32, 32]} />
        <meshStandardMaterial color="#0E0E0C" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.012, 12, 64]} />
        <meshStandardMaterial color="#FF5B1F" emissive="#FF5B1F" emissiveIntensity={0.4} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 3]}>
        <torusGeometry args={[0.65, 0.012, 12, 64]} />
        <meshStandardMaterial color="#FF5B1F" emissive="#FF5B1F" emissiveIntensity={0.4} />
      </mesh>
    </group>
  ),
  // building-materials — cluster of small cubes
  () => (
    <group>
      {[
        [-0.2, -0.2, 0],
        [0.2, -0.2, 0],
        [0, 0, 0.2],
        [-0.2, 0.2, 0],
        [0.2, 0.2, 0],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <boxGeometry args={[0.28, 0.28, 0.28]} />
          <meshStandardMaterial color="#0E0E0C" />
          <Edges color="#FF5B1F" lineWidth={1} />
        </mesh>
      ))}
    </group>
  ),
  // facility-maintenance — torus + sphere
  () => (
    <group>
      <mesh>
        <torusKnotGeometry args={[0.4, 0.13, 100, 16]} />
        <meshStandardMaterial color="#0E0E0C" metalness={0.4} roughness={0.3} wireframe />
      </mesh>
      <mesh>
        <torusKnotGeometry args={[0.4, 0.05, 80, 12]} />
        <meshStandardMaterial color="#FF5B1F" emissive="#FF5B1F" emissiveIntensity={0.6} />
      </mesh>
    </group>
  ),
  // pest-control — octahedron shield
  () => (
    <group>
      <mesh>
        <octahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color="#0E0E0C" />
        <Edges color="#FF5B1F" lineWidth={1} />
      </mesh>
      <mesh>
        <octahedronGeometry args={[0.7, 0]} />
        <meshBasicMaterial color="#FF5B1F" wireframe transparent opacity={0.35} />
      </mesh>
    </group>
  ),
];

function Cluster() {
  const group = useRef<Group>(null);
  useFrame((state, dt) => {
    if (!group.current) return;
    group.current.rotation.y += dt * 0.18;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.18;
  });

  // Position glyphs around an orbit
  const positions = useMemo(() => {
    return GLYPHS.map((_, i) => {
      const a = (i / GLYPHS.length) * Math.PI * 2;
      const r = 1.6;
      return [Math.cos(a) * r, Math.sin(a * 1.3) * 0.6, Math.sin(a) * r] as [
        number,
        number,
        number,
      ];
    });
  }, []);

  return (
    <group ref={group}>
      {/* Central core */}
      <mesh>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial color="#0E0E0C" metalness={0.6} roughness={0.2} />
        <Edges color="#FF5B1F" lineWidth={1} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshBasicMaterial color="#FF5B1F" wireframe transparent opacity={0.18} />
      </mesh>

      {GLYPHS.map((Glyph, i) => (
        <Float key={i} speed={1.2 + i * 0.15} floatIntensity={0.6} rotationIntensity={0.6}>
          <group position={positions[i]}>
            <Glyph />
          </group>
        </Float>
      ))}
    </group>
  );
}

interface Props {
  className?: string;
  height?: string;
}

export default function ServicesOrb3D({
  className,
  height = "h-[460px] md:h-[520px]",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current) return;
    const el = ref.current;
    let raf = 0;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (vh - rect.top) / (vh + rect.height);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setProgress(Math.max(0, Math.min(1, p))));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={`relative w-full ${height} ${className ?? ""}`} aria-hidden="true">
      <Canvas dpr={[1, 1.6]} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 5.4]} fov={42} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[4, 6, 3]} intensity={1} />
          <pointLight position={[-3, -2, 3]} intensity={0.9} color="#FF5B1F" />
          <pointLight position={[3, 4, -3]} intensity={0.6} color="#C8FF3E" />
          <group rotation={[0, progress * Math.PI * 0.6, 0]}>
            <Cluster />
          </group>
          <fog attach="fog" args={["#0B0B0A", 8, 16]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
