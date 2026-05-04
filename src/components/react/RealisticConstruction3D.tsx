import { useRef, useMemo, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  Float,
  PerspectiveCamera,
  MeshReflectorMaterial,
  Lightformer,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { Group, Mesh, Points } from "three";

/**
 * Realistic PBR + HDR construction scene.
 *
 * - Three buildings with varied silhouettes, properly shaded with
 *   metalness + roughness PBR materials
 * - Reflective floor via MeshReflectorMaterial
 * - HDR Environment lighting (city preset) + custom Lightformer accents
 * - Soft ContactShadows beneath the scene
 * - Animated tower-crane with swinging hook cable
 * - Bloom + vignette post-processing
 * - Idle parallax driven by mouse position
 * - Floors progressively reveal on the tallest tower as the user scrolls
 */

interface BuildingProps {
  position: [number, number, number];
  height: number;
  width?: number;
  depth?: number;
  color?: string;
  /** scrubProgress 0..1 — controls top floors visibility on this tower */
  scrub?: number;
  scrubFloors?: number;
  /** windows on/off */
  windowed?: boolean;
}

function Building({
  position,
  height,
  width = 0.9,
  depth = 0.9,
  color = "#1B1B19",
  scrub = 1,
  scrubFloors = 0,
  windowed = true,
}: BuildingProps) {
  const ref = useRef<Mesh>(null);

  // Number of floors derived from height
  const floors = Math.max(2, Math.floor(height / 0.32));

  return (
    <group position={position}>
      {/* Main body */}
      <mesh ref={ref} position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={color}
          metalness={0.55}
          roughness={0.32}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Window strips on each floor */}
      {windowed &&
        Array.from({ length: floors }).map((_, i) => {
          const visible =
            scrubFloors === 0 || i < scrubFloors + scrub * (floors - scrubFloors);
          if (!visible) return null;
          const y = (i + 0.5) * (height / floors);
          return (
            <group key={i} position={[0, y, 0]}>
              {/* Front + back stripes */}
              <mesh position={[0, 0, depth / 2 + 0.001]}>
                <planeGeometry args={[width * 0.84, height / floors / 1.8]} />
                <meshStandardMaterial
                  color="#FFB78A"
                  emissive="#FF7A2A"
                  emissiveIntensity={0.55}
                  metalness={0.85}
                  roughness={0.18}
                />
              </mesh>
              <mesh position={[0, 0, -depth / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[width * 0.84, height / floors / 1.8]} />
                <meshStandardMaterial
                  color="#FFB78A"
                  emissive="#FF7A2A"
                  emissiveIntensity={0.32}
                  metalness={0.85}
                  roughness={0.18}
                />
              </mesh>
            </group>
          );
        })}

      {/* Subtle vertical seam / accent strip */}
      <mesh position={[width / 2 + 0.005, height / 2, 0]} castShadow>
        <boxGeometry args={[0.012, height, depth * 0.92]} />
        <meshStandardMaterial color="#FF5B1F" emissive="#FF5B1F" emissiveIntensity={0.4} metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

interface CraneProps {
  position: [number, number, number];
  topY: number;
}

function Crane({ position, topY }: CraneProps) {
  const jib = useRef<Group>(null);
  const hook = useRef<Group>(null);

  useFrame((state, dt) => {
    if (jib.current) jib.current.rotation.y += dt * 0.18;
    if (hook.current) {
      hook.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.9) * 0.15;
    }
  });

  return (
    <group position={position}>
      {/* Mast lattice (simplified as a textured box) */}
      <mesh position={[0, topY / 2, 0]} castShadow>
        <boxGeometry args={[0.12, topY, 0.12]} />
        <meshStandardMaterial color="#F2EDE5" metalness={0.7} roughness={0.32} />
      </mesh>
      {/* Mast rungs */}
      {Array.from({ length: Math.floor(topY / 0.25) }).map((_, i) => (
        <mesh key={i} position={[0, i * 0.25 + 0.1, 0]} castShadow>
          <boxGeometry args={[0.18, 0.012, 0.18]} />
          <meshStandardMaterial color="#888178" metalness={0.65} roughness={0.4} />
        </mesh>
      ))}
      {/* Operator cabin */}
      <mesh position={[0, topY + 0.05, 0]} castShadow>
        <boxGeometry args={[0.22, 0.18, 0.22]} />
        <meshStandardMaterial color="#FF5B1F" metalness={0.6} roughness={0.32} emissive="#FF5B1F" emissiveIntensity={0.18} />
      </mesh>

      {/* Rotating jib */}
      <group ref={jib} position={[0, topY + 0.12, 0]}>
        {/* Front jib */}
        <mesh position={[0.95, 0, 0]} castShadow>
          <boxGeometry args={[2, 0.07, 0.1]} />
          <meshStandardMaterial color="#F2EDE5" metalness={0.7} roughness={0.28} />
        </mesh>
        {/* Counter-jib */}
        <mesh position={[-0.45, 0, 0]} castShadow>
          <boxGeometry args={[0.9, 0.07, 0.1]} />
          <meshStandardMaterial color="#F2EDE5" metalness={0.7} roughness={0.28} />
        </mesh>
        {/* Cable + hook block */}
        <group ref={hook} position={[1.6, 0, 0]}>
          <mesh position={[0, -0.4, 0]}>
            <boxGeometry args={[0.014, 0.8, 0.014]} />
            <meshStandardMaterial color="#1B1B19" metalness={0.9} roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.85, 0]} castShadow>
            <boxGeometry args={[0.12, 0.12, 0.12]} />
            <meshStandardMaterial color="#FF5B1F" metalness={0.7} roughness={0.28} emissive="#FF5B1F" emissiveIntensity={0.4} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

interface ParticleField {
  count: number;
}

function ParticleField({ count }: ParticleField) {
  const ref = useRef<Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = Math.random() * 5 - 0.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
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
      arr[idx] = (arr[idx] ?? 0) + dt * 0.16;
      if ((arr[idx] ?? 0) > 5) arr[idx] = -0.5;
    }
    attr.needsUpdate = true;
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
      <pointsMaterial size={0.04} color="#FF7A2A" sizeAttenuation transparent opacity={0.6} />
    </points>
  );
}

interface SiteProps {
  scrub: number;
}

function Site({ scrub }: SiteProps) {
  const group = useRef<Group>(null);

  useFrame((state, dt) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const targetRotY = Math.sin(t * 0.12) * 0.18 + state.pointer.x * 0.3;
    const targetRotX = Math.cos(t * 0.16) * 0.04 - state.pointer.y * 0.12;
    group.current.rotation.y += (targetRotY - group.current.rotation.y) * Math.min(dt * 1.4, 1);
    group.current.rotation.x += (targetRotX - group.current.rotation.x) * Math.min(dt * 1.4, 1);
  });

  return (
    <group ref={group}>
      {/* Reflective ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <MeshReflectorMaterial
          blur={[300, 60]}
          resolution={1024}
          mixBlur={1}
          mixStrength={50}
          roughness={0.85}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0E0E0C"
          metalness={0.45}
          mirror={0.4}
        />
      </mesh>

      {/* Buildings */}
      <Building position={[-1.4, 0, -0.6]} height={2.0} width={0.9} depth={0.9} color="#202020" />
      <Building
        position={[0.1, 0, 0]}
        height={3.6}
        width={1.0}
        depth={1.0}
        color="#0F0F0E"
        scrub={scrub}
        scrubFloors={5}
      />
      <Building position={[1.6, 0, -0.4]} height={1.6} width={0.8} depth={0.8} color="#262626" />
      <Building position={[-2.6, 0, 0.4]} height={1.0} width={0.7} depth={0.7} color="#2A2A28" />
      <Building position={[2.6, 0, 0.6]} height={1.2} width={0.7} depth={0.7} color="#1F1F1D" />

      {/* Crane on the central building */}
      <Crane position={[0.1, 3.6, 0]} topY={1.0} />

      <ParticleField count={70} />

      {/* Soft contact shadow under everything */}
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.65}
        scale={14}
        blur={2.4}
        far={5}
        resolution={512}
      />
    </group>
  );
}

interface Props {
  /** Background tone — "light" for warm bone, "dark" for near-black */
  surface?: "light" | "dark";
  className?: string;
}

export default function RealisticConstruction3D({
  surface = "light",
  className,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [scrub, setScrub] = useState(0.4);

  useEffect(() => {
    if (typeof window === "undefined" || !wrap.current) return;
    const el = wrap.current;
    let raf = 0;
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (vh - r.top) / (vh + r.height);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() =>
        setScrub(Math.max(0, Math.min(1, p))),
      );
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
      className={`relative aspect-[4/5] w-full max-w-[680px] ${className ?? ""}`}
      aria-hidden="true"
    >
      <Canvas
        shadows
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        camera={{ position: [4.2, 2.8, 5.4], fov: 36 }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[4.2, 2.8, 5.4]} fov={36} />

          <color attach="background" args={[surface === "light" ? "#F4F1EC" : "#0B0B0A"]} />
          <fog attach="fog" args={[surface === "light" ? "#F4F1EC" : "#0B0B0A", 8, 22]} />

          {/* Studio HDR with custom lightformers for accent rim */}
          <Environment preset="city" background={false}>
            <Lightformer
              intensity={2}
              color="#FF7A2A"
              position={[-3, 4, 2]}
              rotation={[0, Math.PI / 2, 0]}
              scale={[3, 6, 1]}
            />
            <Lightformer
              intensity={1.4}
              color="#fff"
              position={[5, 4, -2]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={[3, 6, 1]}
            />
            <Lightformer
              intensity={0.6}
              color="#C8FF3E"
              position={[0, 6, -4]}
              scale={[5, 5, 1]}
            />
          </Environment>

          <ambientLight intensity={0.3} />
          <directionalLight
            position={[6, 10, 4]}
            intensity={1.4}
            color="#fff8e6"
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-far={20}
          />

          <Float speed={1.0} floatIntensity={0.18} rotationIntensity={0}>
            <Site scrub={scrub} />
          </Float>

          <EffectComposer>
            <Bloom
              intensity={0.6}
              luminanceThreshold={0.4}
              luminanceSmoothing={0.85}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.18} darkness={0.55} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
