import { Environment, Float, PerspectiveCamera, useGLTF, View } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

// The single shared WebGL canvas that draws every tech icon <View>. It sits as
// a transparent, click-through overlay across the whole tech grid. One context
// serves all five icons — five separate contexts is what crashed mobile tabs.
export const TechIconsCanvas = ({ eventSource, frameloop, isMobile }) => (
  <Canvas
    eventSource={eventSource}
    frameloop={frameloop}
    // Cap pixel ratio hard — this is the main scroll-jank lever
    dpr={isMobile ? 1 : [1, 1.25]}
    gl={{ antialias: false, powerPreference: "low-power", alpha: true }}
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      zIndex: 20,
      pointerEvents: "none",
    }}
  >
    <View.Port />
  </Canvas>
);

const TechIconCardExperience = ({ model }) => {
  const scene = useGLTF(model.modelPath);
  const groupRef = useRef(null);
  const dragCleanup = useRef(null);

  useEffect(() => {
    if (model.name === "Interactive Developer") {
      scene.scene.traverse((child) => {
        if (child.isMesh && child.name === "Object_5") {
          child.material = new THREE.MeshStandardMaterial({ color: "white" });
        }
      });
    }
  }, [scene]);

  // Manual drag-to-rotate. Because it starts from an R3F pointer event on THIS
  // model's mesh, only the icon actually under the finger rotates (unlike
  // OrbitControls, which would grab every model from one shared canvas). Works
  // for both mouse and touch.
  const handlePointerDown = (e) => {
    e.stopPropagation();
    let lastX = e.clientX;
    let lastY = e.clientY;

    const onMove = (ev) => {
      if (!groupRef.current) return;
      groupRef.current.rotation.y += (ev.clientX - lastX) * 0.01;
      groupRef.current.rotation.x += (ev.clientY - lastY) * 0.01;
      lastX = ev.clientX;
      lastY = ev.clientY;
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      dragCleanup.current = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    dragCleanup.current = onUp;
  };

  // Drop any in-flight drag listeners if the icon unmounts mid-drag
  useEffect(() => () => dragCleanup.current?.(), []);

  return (
    <View className="w-full h-full">
      {/* Match the R3F default camera the old per-icon Canvas used so the
          model scales in the constants still look right */}
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} />
      {/* Low resolution: a full-res city HDRI re-rendered per icon per frame
          across 5 shared views was expensive enough to drop frames during
          scroll, which reads as the icons jumping/glitching relative to the
          (compositor-smooth) page scroll. */}
      <Environment preset="city" resolution={16} />

      <Float speed={4} rotationIntensity={0.4} floatIntensity={0.8}>
        <group
          ref={groupRef}
          scale={model.scale}
          rotation={model.rotation}
          onPointerDown={handlePointerDown}
        >
          <primitive object={scene.scene} />
        </group>
      </Float>
    </View>
  );
};

export default TechIconCardExperience;
