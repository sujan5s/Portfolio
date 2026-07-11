import React, { Suspense, useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useMediaQuery } from "react-responsive";

import useInViewFrameloop from "../../hooks/useInViewFrameloop";

const PHOTO_URL = "/images/sujans05.webp";
const DEPTH_URL = "/images/sujans05-depth.webp";

// Camera distance that fits the 2x3 plane with a small margin at fov 45.
const CAMERA_Z = 3.9;

// The photo already contains its own lighting, so the plane is rendered
// unlit: vertices are pushed toward the camera by the depth map and the
// fragment shader just samples the photo, discarding transparent pixels.
const vertexShader = /* glsl */ `
  uniform sampler2D uDepth;
  uniform float uDepthScale;
  uniform sampler2D uMap;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    float depth = texture2D(uDepth, uv).r;
    // Fade displacement to zero at the alpha edge so boundary vertices stay
    // flat instead of stretching into torn "walls" when the head rotates.
    float edge = smoothstep(0.4, 0.85, texture2D(uMap, uv).a);
    vec3 displaced = position + vec3(0.0, 0.0, depth * uDepthScale * edge);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform sampler2D uDepth;
  uniform vec2 uTexel;
  varying vec2 vUv;

  void main() {
    vec4 color = texture2D(uMap, vUv);
    if (color.a < 0.5) discard;

    // Reconstruct a surface normal from the depth gradient and use it for
    // a purple rim light, so the displaced photo reads as a lit volume.
    float d = texture2D(uDepth, vUv).r;
    float dx = texture2D(uDepth, vUv + vec2(uTexel.x, 0.0)).r - d;
    float dy = texture2D(uDepth, vUv + vec2(0.0, uTexel.y)).r - d;

    vec3 normal = normalize(vec3(-dx * 8.0, -dy * 8.0, 1.0));

    float rim = pow(1.0 - abs(normal.z), 1.4);
    vec3 rimColor = vec3(0.55, 0.35, 1.0);
    color.rgb += rimColor * rim * 0.45;

    // Gentle depth-based shading adds roundness to the face and shoulders.
    color.rgb *= 0.92 + normal.z * 0.08;

    gl_FragColor = color;
    #include <colorspace_fragment>
  }
`;

const PortraitMesh = ({ segments, reducedMotion, isMobile, onReady }) => {
  const groupRef = useRef(null);
  const lastTouchRef = useRef(0);
  const [photo, depth] = useTexture([PHOTO_URL, DEPTH_URL]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  const material = useMemo(() => {
    photo.colorSpace = THREE.SRGBColorSpace;
    return new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: photo },
        uDepth: { value: depth },
        uDepthScale: { value: 0.5 },
        uTexel: {
          value: new THREE.Vector2(
            1 / (depth.image?.width || 512),
            1 / (depth.image?.height || 768)
          ),
        },
      },
      vertexShader,
      fragmentShader,
    });
  }, [photo, depth]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group || reducedMotion) return;

    const touchActive =
      performance.now() - lastTouchRef.current < 2500;

    let targetY;
    let targetX;
    if (isMobile && !touchActive) {
      // Idle sway on mobile until the user touches the portrait.
      const t = state.clock.elapsedTime;
      targetY = Math.sin(t * 0.5) * 0.12;
      targetX = Math.cos(t * 0.35) * 0.06;
    } else {
      targetY = state.pointer.x * 0.3;
      targetX = -state.pointer.y * 0.15;
    }

    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, targetY, 4, delta);
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, targetX, 4, delta);

    // An opposing camera shift deepens the parallax.
    if (!isMobile || touchActive) {
      state.camera.position.x = THREE.MathUtils.damp(
        state.camera.position.x,
        state.pointer.x * 0.15,
        4,
        delta
      );
      state.camera.lookAt(0, 0, 0);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        material={material}
        onPointerMove={() => {
          lastTouchRef.current = performance.now();
        }}
      >
        <planeGeometry args={[2, 3, segments, segments]} />
      </mesh>
    </group>
  );
};

// If the WebGL canvas or a texture fails, fall back to the plain photo so
// the hero never loses the portrait.
class PortraitErrorBoundary extends React.Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

const StaticPortrait = ({ className = "" }) => (
  <img
    src={PHOTO_URL}
    alt="Sujan"
    className={`w-full h-full object-contain ${className}`}
    draggable={false}
  />
);

const DepthPortrait = () => {
  const [wrapperRef, frameloop] = useInViewFrameloop();
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [meshReady, setMeshReady] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (e) => setReducedMotion(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full h-full">
      {/* Photo shows instantly and fades out once the 3D mesh takes over. */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          meshReady ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden={meshReady}
      >
        <StaticPortrait />
      </div>

      <PortraitErrorBoundary fallback={<StaticPortrait className="absolute inset-0" />}>
        <Canvas
          flat
          dpr={isMobile ? [1, 1.5] : [1, 2]}
          frameloop={reducedMotion ? "demand" : frameloop}
          camera={{ position: [0, 0, CAMERA_Z], fov: 45 }}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          onCreated={(state) => {
            // Let touch drags drive the portrait while vertical page
            // scrolling keeps working.
            state.gl.domElement.style.touchAction = "pan-y";
          }}
        >
          <Suspense fallback={null}>
            <PortraitMesh
              segments={isMobile ? 128 : 256}
              reducedMotion={reducedMotion}
              isMobile={isMobile}
              onReady={() => setMeshReady(true)}
            />
          </Suspense>
        </Canvas>
      </PortraitErrorBoundary>
    </div>
  );
};

export default DepthPortrait;
