import React, { Suspense, useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useMediaQuery } from "react-responsive";

import useInViewFrameloop from "../../hooks/useInViewFrameloop";

const PHOTO_URL = "/images/sujans05.webp";
const DEPTH_URL = "/images/sujans05-depth.webp";

// Camera distance that fits the 2x3 point grid with a small margin at fov 45.
const CAMERA_Z = 3.9;
const PLANE_W = 2;
const PLANE_H = 3;

// The portrait is rendered as a cloud of independent points, one per grid cell.
// Each point is displaced toward the camera by the depth map and tinted into a
// cyan hologram. Because the points are not connected, the silhouette can never
// stretch into torn "walls" the way a displaced plane does.
const vertexShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform sampler2D uDepth;
  uniform float uDepthScale;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uTime;

  attribute vec2 aUv;

  varying vec2 vUv;
  varying vec3 vColor;
  varying float vGlitch;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    vUv = aUv;
    vec4 tex = texture2D(uMap, aUv);
    vColor = tex.rgb;

    // Cull points on the transparent background by pushing them outside the
    // clip volume so they are discarded before rasterization. (A zero
    // gl_PointSize is NOT reliable: many drivers clamp point size to a 1px
    // minimum, which would render the whole background as a grid of dots.)
    if (tex.a < 0.5) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      return;
    }

    float depth = texture2D(uDepth, aUv).r;

    // Subtle per-point shimmer so the cloud feels like a live projection.
    float shimmer = sin(uTime * 2.0 + aUv.y * 40.0) * 0.008;

    // Rare horizontal glitch bursts: a handful of rows kick sideways for a
    // few frames, like an unstable holographic transmission.
    float row = floor(aUv.y * 48.0);
    vGlitch = step(0.985, hash(row + floor(uTime * 6.0)));
    float glitchShift = (hash(row * 3.1 + floor(uTime * 6.0)) - 0.5) * 0.3 * vGlitch;

    vec3 displaced = position + vec3(glitchShift, 0.0, depth * uDepthScale + shimmer);
    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Perspective-correct sizing: nearer points are larger.
    gl_PointSize = uSize * uPixelRatio * (1.0 / -mvPosition.z);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform sampler2D uMap;

  varying vec2 vUv;
  varying vec3 vColor;
  varying float vGlitch;

  // Cheap hash for flicker/grain that has no visible period.
  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  float hash2(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123); }

  void main() {
    // Round, soft-edged points for a glowing particle look. A wider bright
    // core than falloff keeps the surface reading as filled skin/fabric
    // rather than sparse dots.
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.28, d);

    // Chromatic aberration: split the colour channels sideways, more so on
    // glitching rows, for that unstable-projection look.
    float ca = 0.003 + vGlitch * 0.02;
    vec3 sample3 = vec3(
      texture2D(uMap, vUv + vec2(ca, 0.0)).r,
      vColor.g,
      texture2D(uMap, vUv - vec2(ca, 0.0)).b
    );

    // Mostly the real photo colour so the face and features stay
    // recognisable, with a light cyan hologram cast on top.
    vec3 holo = vec3(0.25, 0.95, 1.0);
    vec3 base = mix(sample3, holo, 0.28);
    // Brighten and lift shadows so darker skin/fabric tones stay visible
    // instead of crushing to black once the effects below are applied.
    base = pow(base * 1.55, vec3(0.8));

    // Tight scanlines and grain/flicker add signal texture without ever
    // fully darkening the image.
    float scan = 0.88 + 0.12 * sin(vUv.y * 320.0 - uTime * 9.0);
    float grain = 0.94 + 0.06 * hash2(vUv * 400.0 + floor(uTime * 20.0));
    float flicker = 0.92 + 0.08 * hash(floor(uTime * 14.0));
    vec3 color = base * scan * grain * flicker;

    // A bright scan-head band sweeps top to bottom on a loop, like a laser
    // re-tracing the projection.
    float scanPos = fract(uTime * 0.22);
    float band = smoothstep(0.05, 0.0, abs(vUv.y - scanPos));
    color += holo * band * 1.6;

    // Glitching rows flash brighter.
    color += holo * vGlitch * 0.5;

    // Constant baseline glow, applied after the flicker/grain so the
    // surface never dips below a visible minimum brightness.
    color += holo * 0.12;

    float alpha = soft * (0.9 + 0.1 * flicker);

    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`;

// Grid of points over the plane, with a UV attribute per point so the shaders
// can sample the photo and depth map. Memoised by resolution.
function usePointGeometry(cols, rows) {
  return useMemo(() => {
    const count = cols * rows;
    const positions = new Float32Array(count * 3);
    const uvs = new Float32Array(count * 2);

    let i = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const u = x / (cols - 1);
        const v = y / (rows - 1);

        positions[i * 3] = (u - 0.5) * PLANE_W;
        positions[i * 3 + 1] = (v - 0.5) * PLANE_H;
        positions[i * 3 + 2] = 0;

        // Bottom row (y=0) maps to the bottom of the image, matching three's
        // default texture flipY so the portrait renders the right way up.
        uvs[i * 2] = u;
        uvs[i * 2 + 1] = v;
        i++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aUv", new THREE.BufferAttribute(uvs, 2));
    return geometry;
  }, [cols, rows]);
}

const HologramPoints = ({
  cols,
  rows,
  reducedMotion,
  isMobile,
  onReady,
  lastPointerRef,
}) => {
  const groupRef = useRef(null);
  const [photo, depth] = useTexture([PHOTO_URL, DEPTH_URL]);

  const geometry = usePointGeometry(cols, rows);

  useEffect(() => {
    onReady();
  }, [onReady]);

  const material = useMemo(() => {
    photo.colorSpace = THREE.SRGBColorSpace;
    return new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: photo },
        uDepth: { value: depth },
        uDepthScale: { value: 0.55 },
        uSize: { value: isMobile ? 4.5 : 5.8 },
        uPixelRatio: { value: 1 },
        uTime: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [photo, depth, isMobile]);

  useFrame((state, delta) => {
    material.uniforms.uPixelRatio.value = state.gl.getPixelRatio();

    const group = groupRef.current;
    if (!group) return;

    // Advance the shader clock (scanlines/flicker) only when motion is allowed.
    if (reducedMotion) return;
    material.uniforms.uTime.value = state.clock.elapsedTime;

    const touchActive = performance.now() - lastPointerRef.current < 2500;

    let targetY;
    let targetX;
    if (isMobile && !touchActive) {
      // Idle sway on mobile until the user touches the hologram.
      const t = state.clock.elapsedTime;
      targetY = Math.sin(t * 0.5) * 0.14;
      targetX = Math.cos(t * 0.35) * 0.07;
    } else {
      // Points can't tear, so we can rotate more for a volumetric feel.
      targetY = state.pointer.x * 0.4;
      targetX = -state.pointer.y * 0.2;
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
      {/* raycast disabled: hovering 60k points would raycast every one of them
          on each pointer move, which is what made interaction lag. The pointer
          is tracked via the wrapper DOM element instead. */}
      <points geometry={geometry} material={material} raycast={() => null} />
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
  const [isHovering, setIsHovering] = useState(false);
  // Updated by the wrapper's DOM pointermove (no raycasting) so the mesh knows
  // when the user last interacted — drives the mobile idle-sway timeout.
  const lastPointerRef = useRef(0);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (e) => setReducedMotion(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full"
      onPointerMove={() => {
        lastPointerRef.current = performance.now();
      }}
      onPointerEnter={() => setIsHovering(true)}
      onPointerLeave={() => setIsHovering(false)}
    >
      {/* Photo shows instantly and fades out once the hologram takes over,
          then crossfades smoothly back in on hover to reveal the real you. */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          !meshReady || isHovering ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={meshReady && !isHovering}
      >
        <StaticPortrait />
      </div>

      <PortraitErrorBoundary fallback={<StaticPortrait className="absolute inset-0" />}>
        <Canvas
          flat
          dpr={[1, 1.5]}
          frameloop={reducedMotion ? "demand" : frameloop}
          camera={{ position: [0, 0, CAMERA_Z], fov: 45 }}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          onCreated={(state) => {
            // Let touch drags drive the hologram while vertical page
            // scrolling keeps working.
            state.gl.domElement.style.touchAction = "pan-y";
          }}
        >
          <Suspense fallback={null}>
            <HologramPoints
              cols={isMobile ? 120 : 200}
              rows={isMobile ? 180 : 300}
              reducedMotion={reducedMotion}
              isMobile={isMobile}
              onReady={() => setMeshReady(true)}
              lastPointerRef={lastPointerRef}
            />
          </Suspense>
        </Canvas>
      </PortraitErrorBoundary>
    </div>
  );
};

export default DepthPortrait;
