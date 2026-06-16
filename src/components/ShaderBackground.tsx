"use client";

import { useEffect, useRef } from "react";
import { Renderer, Triangle, Program, Mesh, Vec2 } from "ogl";

const vertex = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Original shader: warm flow field, amber accent over warm-black.
// Subtle by design — a quiet glow behind the kinetic type.
const fragment = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uRes;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / max(uRes.y, 1.0);
  vec2 p = uv;
  p.x *= aspect;

  // domain warp driven by time + mouse
  vec2 m = uMouse;
  m.x *= aspect;
  float t = uTime * 0.05;
  vec2 q = vec2(fbm(p * 1.6 + t), fbm(p * 1.6 - t + 4.0));
  float flow = fbm(p * 2.2 + q * 1.8 + vec2(0.0, t * 2.0));

  // faint glow gravitates toward the cursor
  float d = distance(p, m);
  float halo = smoothstep(1.0, 0.0, d) * 0.14;

  // keep it a quiet whisper of light, not a wash
  float intensity = pow(flow, 3.2) * 0.20 + halo;

  // warm-black base -> amber-copper accent
  vec3 base = vec3(0.055, 0.046, 0.041);
  vec3 amber = vec3(0.95, 0.62, 0.28);
  vec3 col = mix(base, amber, clamp(intensity, 0.0, 0.45));

  // strong vignette keeps the center calm for the type
  float vig = smoothstep(1.45, 0.1, distance(uv, vec2(0.5)));
  col *= 0.35 + 0.65 * vig;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function ShaderBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // On touch / low-core devices, render one static frame instead of a 60fps
    // FBM loop — avoids thermal pressure and dropped frames on mobile.
    const lowPower =
      window.matchMedia("(pointer: coarse)").matches ||
      (navigator.hardwareConcurrency ?? 8) <= 4;
    const staticOnly = reduce || lowPower;

    const renderer = new Renderer({
      alpha: false,
      // cap dpr: fragment work scales with pixel count; 1.5 is plenty for a soft bg
      dpr: Math.min(window.devicePixelRatio || 1, 1.5),
    });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new Vec2(0.5, 0.5) },
        uRes: { value: new Vec2(1, 1) },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      renderer.setSize(w, h);
      program.uniforms.uRes.value.set(w, h);
    };
    window.addEventListener("resize", resize);
    resize();

    const target = new Vec2(0.5, 0.5);
    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      target.set(
        (e.clientX - rect.left) / rect.width,
        1.0 - (e.clientY - rect.top) / rect.height,
      );
    };
    window.addEventListener("pointermove", onMove);

    let frame = 0;
    let running = false;
    const start = performance.now();
    const loop = () => {
      const time = (performance.now() - start) / 1000;
      program.uniforms.uTime.value = time;
      // ease mouse toward target
      const mu = program.uniforms.uMouse.value as Vec2;
      mu.x += (target.x - mu.x) * 0.05;
      mu.y += (target.y - mu.y) * 0.05;
      renderer.render({ scene: mesh });
      if (!staticOnly && running) frame = requestAnimationFrame(loop);
    };

    // Only animate while the hero is on screen — no GPU churn once scrolled past.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          if (staticOnly) renderer.render({ scene: mesh });
          else frame = requestAnimationFrame(loop);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(frame);
        }
      },
      { threshold: 0 },
    );
    io.observe(container);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
    };
  }, []);

  return <div ref={ref} className="shader-bg" aria-hidden="true" />;
}
