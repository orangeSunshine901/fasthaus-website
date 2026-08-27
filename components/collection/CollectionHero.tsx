"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const DEFAULT_COLORS = ["#141114", "#FF4B1F", "#FFDBD2", "#F8F6F3"] as const;

const VERTEX_SHADER = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
// "Waves" — made with the 21st.dev Shader Builder
// Packed WebGL1 uniforms (the shader exposes readable u_* aliases as macros):
//   u_colors[8] (first 4 used)
//   vec3(0.102, 0.078, 0.137)
//   vec3(0.718, 0.365, 0.412)
//   vec3(0.918, 0.804, 0.761)
//   vec3(1.000, 0.961, 0.922)
//   u_scene = vec4(canvas width, canvas height, seconds * -0.67, 4.0)
//   u_shape = vec4(1.32, 0.49, 0.84, 0.01)
//   u_surface = vec4(1.73, 1.08, 0.07, 2.00)
//   u_finish = vec4(2.27, 0.00, 0.040, 0.35)
//   u_transform = vec4(4984.0, 3.37, 0.40, 1.0)
//   u_space = vec4(-0.13, 0.05, pointer x, pointer y)
//   u_cursor = vec4(presence, 3.0, 0.54, 0.56)

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec3 u_colors[8];
// Seven packed vectors + eight colour vectors = 15 fragment uniform vectors,
// one below WebGL1's guaranteed minimum. Macros preserve the public u_* API.
uniform vec4 u_scene;      // resolution.xy, time, colour count
uniform vec4 u_shape;      // scale, intensity, paramA, warp
uniform vec4 u_surface;    // detail, contrast, brightness, saturation
uniform vec4 u_finish;     // hue, vignette, blur, grain
uniform vec4 u_transform;  // seed, rotation, drift, OKLab toggle
uniform vec4 u_space;      // offset.xy, pointer.xy
uniform vec4 u_cursor;

#define u_resolution u_scene.xy
#define u_time u_scene.z
#define u_colorCount u_scene.w
#define u_scale u_shape.x
#define u_intensity u_shape.y
#define u_paramA u_shape.z
#define u_warp u_shape.w
#define u_detail u_surface.x
#define u_contrast u_surface.y
#define u_brightness u_surface.z
#define u_saturation u_surface.w
#define u_hue u_finish.x
#define u_vignette u_finish.y
#define u_blur u_finish.z
#define u_grain u_finish.w
#ifdef GL_FRAGMENT_PRECISION_HIGH
#define u_seed u_transform.x
#else
// Keep hash inputs inside mediump's guaranteed ±2^14 range.
#define u_seed mod(u_transform.x, 31.0)
#endif
#define u_rotate u_transform.y
#define u_drift u_transform.z
#define u_oklab u_transform.w
#define u_offset u_space.xy
#define u_mouse u_space.zw
#define u_cursorPresence u_cursor.x
#define u_cursorEffect u_cursor.y
#define u_cursorStrength u_cursor.z
#define u_cursorRadius u_cursor.w

float hash21(vec2 p) {
#ifndef GL_FRAGMENT_PRECISION_HIGH
  p = mod(p, 31.0);
#endif
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

// Even, un-structured white noise for film grain (Dave Hoskins hash12). The
// multiply hash above is fine for value noise but shows a faint axis-aligned
// mesh at integer fragment coords, which reads as a net over flat areas.
float grainHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
#ifndef GL_FRAGMENT_PRECISION_HIGH
  p = mod(p, 31.0);
#endif
  float n = sin(dot(p, vec2(41.0, 289.0)));
  return fract(vec2(15731.743, 7892.321) * n);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.0, 9.2);
    a *= 0.5;
  }
  return v;
}

// --- OKLab colour mixing (perceptual), gated by u_oklab -----------------------
vec3 srgbToLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)),
    step(0.04045, c));
}
vec3 linearToSrgb(vec3 c) {
  // max() guards the sRGB branch: out-of-gamut OKLab interpolations can send a
  // channel negative, and pow(negative, …) is NaN which mix()/step() would
  // then propagate. The linear branch clips such channels to 0 downstream.
  return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055,
    step(0.0031308, c));
}
vec3 linToOklab(vec3 c) {
  float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
  float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
  float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
  l = pow(max(l, 0.0), 1.0 / 3.0);
  m = pow(max(m, 0.0), 1.0 / 3.0);
  s = pow(max(s, 0.0), 1.0 / 3.0);
  return vec3(
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);
}
vec3 oklabToLin(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l; m = m * m * m; s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
}
vec3 mixColour(vec3 a, vec3 b, float t) {
  if (u_oklab > 0.5) {
    vec3 la = linToOklab(srgbToLinear(a));
    vec3 lb = linToOklab(srgbToLinear(b));
    return clamp(linearToSrgb(oklabToLin(mix(la, lb, t))), 0.0, 1.0);
  }
  return mix(a, b, t);
}

// Mix through the recipe colours; x is clamped to 0..1. WebGL1 forbids
// dynamic uniform indexing in fragment shaders, hence the constant loop.
vec3 palette(float x) {
  float n = max(u_colorCount - 1.0, 1.0);
  float f = clamp(x, 0.0, 1.0) * n;
  vec3 col = u_colors[0];
  for (int i = 0; i < 7; i++) {
    if (float(i) < n)
      col = mixColour(col, u_colors[i + 1],
        smoothstep(0.0, 1.0, clamp(f - float(i), 0.0, 1.0)));
  }
  return col;
}

vec3 hueRotate(vec3 col, float a) {
  const mat3 toYIQ = mat3(0.299, 0.596, 0.211,
                          0.587, -0.274, -0.523,
                          0.114, -0.322, 0.312);
  const mat3 toRGB = mat3(1.0, 1.0, 1.0,
                          0.956, -0.272, -1.106,
                          0.621, -0.647, 1.703);
  vec3 yiq = toYIQ * col;
  float ca = cos(a), sa = sin(a);
  yiq = vec3(yiq.x, yiq.y * ca - yiq.z * sa, yiq.y * sa + yiq.z * ca);
  return toRGB * yiq;
}

vec3 shade(vec2 uv, vec2 p, float t) {
  float y = uv.y
    + sin(uv.x * (3.0 + u_intensity * 9.0) + t * 0.8) * 0.08
    + (fbm(p * 2.0 + t * 0.1) - 0.5) * u_intensity * 0.6;
  return palette(y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 screenUv = uv;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy)
    / min(u_resolution.x, u_resolution.y);
  float cursorMask = 0.0;

  // Cursor modes 1–3 are local distortions. Push shifts the same screen-space
  // coordinates before field transforms, so Zoom/Rotate don't change its feel.
  if (u_cursorPresence > 0.001) {
    // u_mouse is normalized to -1..1 in canvas space. Convert it to the same
    // aspect-corrected screen space as p so effects stay under the cursor.
    vec2 cursor = (0.5 * u_mouse * u_resolution.xy)
      / min(u_resolution.x, u_resolution.y);
    vec2 cursorDelta = p - cursor;
    if (u_cursorEffect < 0.5) {
      p += cursor * u_cursorPresence * u_cursorStrength * 0.55;
    } else {
      float cursorDistance = length(cursorDelta);
      vec2 cursorDirection = cursorDelta / max(cursorDistance, 0.0001);
      cursorMask = u_cursorPresence
        * (1.0 - smoothstep(0.0, u_cursorRadius, cursorDistance));
      if (u_cursorEffect < 1.5) {
        p -= cursorDirection * cursorMask * u_cursorStrength * 0.24;
      } else if (u_cursorEffect < 2.5) {
        float cursorAngle = cursorMask * u_cursorStrength * 2.2;
        float cc = cos(cursorAngle), cs = sin(cursorAngle);
        p = cursor + mat2(cc, -cs, cs, cc) * cursorDelta;
      } else if (u_cursorEffect < 3.5) {
        float ripple = sin(
          cursorDistance / max(u_cursorRadius, 0.001) * 18.0 - u_time * 5.0);
        p -= cursorDirection * ripple * cursorMask * u_cursorStrength * 0.07;
      }
    }
  }

  // Keep presets that read uv (rather than p) in the same warped space.
  uv = p * min(u_resolution.x, u_resolution.y) / u_resolution.xy + 0.5;
  p *= u_scale;
  // Field transform: rotate, pan, pointer push, slow drift.
  if (abs(u_rotate) > 0.0001) {
    float cr = cos(u_rotate), sr = sin(u_rotate);
    p = mat2(cr, -sr, sr, cr) * p;
  }
  p += u_offset;
  if (u_drift > 0.0001)
    p += u_drift * vec2(sin(u_time * 0.31), cos(u_time * 0.23));
  // Organic domain warp.
  if (u_warp > 0.0) {
    p += u_warp * (vec2(
      fbm(p * u_detail + u_seed),
      fbm(p * u_detail + vec2(5.2, 1.3))) - 0.5);
  }
  // Shade, with an optional soft 5-tap blur.
  vec3 col;
  if (u_blur > 0.0) {
    float e = u_blur;
    float pe = e * u_scale;
    vec2 uvE = vec2(e) * min(u_resolution.x, u_resolution.y) / u_resolution.xy;
    col  = shade(uv, p, u_time) * 0.36;
    col += shade(uv + vec2(uvE.x, 0.0), p + vec2(pe, 0.0), u_time) * 0.16;
    col += shade(uv - vec2(uvE.x, 0.0), p - vec2(pe, 0.0), u_time) * 0.16;
    col += shade(uv + vec2(0.0, uvE.y), p + vec2(0.0, pe), u_time) * 0.16;
    col += shade(uv - vec2(0.0, uvE.y), p - vec2(0.0, pe), u_time) * 0.16;
  } else {
    col = shade(uv, p, u_time);
  }
  // Post: contrast, saturation, hue, brightness, vignette, grain.
  if (abs(u_contrast - 1.0) > 0.0001)
    col = (col - 0.5) * u_contrast + 0.5;
  if (abs(u_saturation - 1.0) > 0.0001) {
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(luma), col, u_saturation);
  }
  if (abs(u_hue) > 0.0001)
    col = hueRotate(col, u_hue);
  if (abs(u_brightness) > 0.0001)
    col += u_brightness;
  if (u_vignette > 0.0001) {
    float vd = length(screenUv - 0.5) * 1.41421356;
    col *= 1.0 - u_vignette * smoothstep(0.35, 1.0, vd);
  }
  if (u_cursorPresence > 0.001 && u_cursorEffect > 3.5)
    col += (vec3(0.18) + col * 0.12) * cursorMask * u_cursorStrength;
  if (u_grain > 0.0001)
    col += (grainHash(
      gl_FragCoord.xy + vec2(u_seed * 17.0, u_seed * 31.0)) - 0.5) * u_grain;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}


`;

const COLOR_TRANSITION_DURATION = 900;
const SHADER_ANIMATION_DURATION = 10_000;
const SLIDE_TRANSITION = {
  duration: 0.9,
  ease: [0.65, 0, 0.35, 1],
} as const;
const REDUCED_TRANSITION = { duration: 0.15 } as const;

const LAMP_VARIANTS = {
  enter: (direction: number) => ({
    opacity: 0,
    scale: 0.975,
    y: direction * 12,
  }),
  center: { opacity: 1, scale: 1, y: 0 },
  exit: (direction: number) => ({
    opacity: 0,
    scale: 1.015,
    y: direction * -8,
  }),
};

const TITLE_VARIANTS = {
  enter: (direction: number) => ({ opacity: 0, y: direction * 18 }),
  center: { opacity: 0.9, y: 0 },
  exit: (direction: number) => ({ opacity: 0, y: direction * -14 }),
};

const LABEL_VARIANTS = {
  enter: (direction: number) => ({ opacity: 0, y: direction * 6 }),
  center: { opacity: 1, y: 0 },
  exit: (direction: number) => ({ opacity: 0, y: direction * -4 }),
};

const REDUCED_VARIANTS = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

const REDUCED_TITLE_VARIANTS = {
  enter: { opacity: 0 },
  center: { opacity: 0.9 },
  exit: { opacity: 0 },
};

export type CollectionHeroSlide = {
  id: string;
  lampName: string;
  colorName: string;
  image: string;
  colors: readonly [string, string, string, string];
};

export type CollectionHeroProps = {
  slides: readonly [CollectionHeroSlide, ...CollectionHeroSlide[]];
};

function hexToRgb(hex: string) {
  const normalized = hex.trim().replace(/^#/, "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => character + character)
          .join("")
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return null;

  const value = Number.parseInt(expanded, 16);
  return [(value >> 16) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

function createColorBuffer(colors: CollectionHeroSlide["colors"]) {
  const colorBuffer = new Float32Array(24);

  colors.forEach((color, index) => {
    const rgb = hexToRgb(color) ?? hexToRgb(DEFAULT_COLORS[index])!;
    colorBuffer.set(rgb, index * 3);
  });

  return colorBuffer;
}

function smootherstep(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function formatCounter(value: number) {
  return String(value).padStart(2, "0");
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;

  console.error("Collection waves shader failed to compile:", gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

export default function CollectionHero({ slides }: CollectionHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPointerInsideRef = useRef(false);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [transitionSequence, setTransitionSequence] = useState(0);
  const shouldReduceMotion = Boolean(useReducedMotion());

  const palettes = useMemo(() => slides.map((slide) => createColorBuffer(slide.colors)), [slides]);
  const currentPaletteRef = useRef(palettes[0].slice());
  const fromPaletteRef = useRef(palettes[0].slice());
  const toPaletteRef = useRef(palettes[0].slice());
  const transitionStartedAtRef = useRef<number | null>(null);
  const animationTimeRef = useRef(0);
  const shaderTimeRef = useRef(0);
  const shaderAnimationElapsedRef = useRef(0);
  const reducedMotionRef = useRef(shouldReduceMotion);
  const activeSlide = slides[selectedIndex] ?? slides[0];
  const activePalette = palettes[selectedIndex] ?? palettes[0];
  const slideCount = slides.length;

  const scrollPrevious = useCallback(() => {
    setDirection(-1);
    setSelectedIndex((index) => (index - 1 + slideCount) % slideCount);
    setTransitionSequence((sequence) => sequence + 1);
  }, [slideCount]);

  const scrollNext = useCallback(() => {
    setDirection(1);
    setSelectedIndex((index) => (index + 1) % slideCount);
    setTransitionSequence((sequence) => sequence + 1);
  }, [slideCount]);

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    const touch = event.touches[0];
    if (touch) swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    const start = swipeStartRef.current;
    const touch = event.changedTouches[0];
    swipeStartRef.current = null;
    if (!start || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

    if (deltaX < 0) scrollNext();
    else scrollPrevious();
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const section = sectionRef.current;
      const hasFocusWithin = section?.contains(document.activeElement) ?? false;

      if (!isPointerInsideRef.current && !hasFocusWithin) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollNext, scrollPrevious]);

  useEffect(() => {
    reducedMotionRef.current = shouldReduceMotion;

    if (shouldReduceMotion) {
      currentPaletteRef.current.set(toPaletteRef.current);
      fromPaletteRef.current.set(toPaletteRef.current);
      transitionStartedAtRef.current = null;
    }
  }, [shouldReduceMotion]);

  useEffect(() => {
    fromPaletteRef.current.set(currentPaletteRef.current);
    toPaletteRef.current.set(activePalette);
    shaderAnimationElapsedRef.current = 0;

    if (reducedMotionRef.current) {
      currentPaletteRef.current.set(activePalette);
      transitionStartedAtRef.current = null;
    } else {
      transitionStartedAtRef.current = animationTimeRef.current;
    }
  }, [activePalette]);

  useEffect(() => {
    const adjacentIndexes = [
      (selectedIndex - 1 + slideCount) % slideCount,
      (selectedIndex + 1) % slideCount,
    ];

    adjacentIndexes.forEach((index) => {
      const image = new window.Image();
      image.src = slides[index].image;
    });
  }, [selectedIndex, slideCount, slides]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Collection waves shader failed to link:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return;
    }

    const positions = gl.createBuffer();
    if (!positions) {
      gl.deleteProgram(program);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positions);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      colors: gl.getUniformLocation(program, "u_colors[0]"),
      scene: gl.getUniformLocation(program, "u_scene"),
      shape: gl.getUniformLocation(program, "u_shape"),
      surface: gl.getUniformLocation(program, "u_surface"),
      finish: gl.getUniformLocation(program, "u_finish"),
      transform: gl.getUniformLocation(program, "u_transform"),
      space: gl.getUniformLocation(program, "u_space"),
      cursor: gl.getUniformLocation(program, "u_cursor"),
    };

    let frame = 0;
    let documentVisible = !document.hidden;
    let sectionVisible = true;
    let lastFrameAt = performance.now();

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(bounds.width * dpr));
      const height = Math.max(1, Math.round(bounds.height * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      gl.viewport(0, 0, width, height);
    };

    const draw = (now: number) => {
      frame = 0;
      if (!documentVisible || !sectionVisible) return;

      const elapsed = now - lastFrameAt;
      animationTimeRef.current += elapsed;
      lastFrameAt = now;

      const shaderTimeRemaining = SHADER_ANIMATION_DURATION - shaderAnimationElapsedRef.current;
      if (!reducedMotionRef.current && shaderTimeRemaining > 0) {
        const shaderElapsed = Math.min(elapsed, shaderTimeRemaining);
        shaderTimeRef.current += shaderElapsed;
        shaderAnimationElapsedRef.current += shaderElapsed;
      }

      resize();
      gl.useProgram(program);

      const transitionStartedAt = transitionStartedAtRef.current;
      if (transitionStartedAt !== null) {
        const progress = Math.min(
          1,
          (animationTimeRef.current - transitionStartedAt) / COLOR_TRANSITION_DURATION
        );
        const easedProgress = smootherstep(progress);

        for (let channel = 0; channel < 12; channel += 1) {
          currentPaletteRef.current[channel] =
            fromPaletteRef.current[channel] +
            (toPaletteRef.current[channel] - fromPaletteRef.current[channel]) * easedProgress;
        }

        if (progress >= 1) {
          currentPaletteRef.current.set(toPaletteRef.current);
          transitionStartedAtRef.current = null;
        }
      }

      gl.uniform3fv(uniforms.colors, currentPaletteRef.current);
      gl.uniform4f(
        uniforms.scene,
        canvas.width,
        canvas.height,
        reducedMotionRef.current ? 0 : (shaderTimeRef.current / 1000) * -0.67,
        4
      );
      gl.uniform4f(uniforms.shape, 1.32, 0.49, 0.84, 0.01);
      gl.uniform4f(uniforms.surface, 1.73, 1.08, 0.07, 2);
      gl.uniform4f(uniforms.finish, 0, 0, 0.04, 0.35);
      gl.uniform4f(uniforms.transform, 4984, 3.37, 0.4, 1);
      gl.uniform4f(uniforms.space, -0.13, 0.05, 0, 0);
      gl.uniform4f(uniforms.cursor, 0, 3, 0.54, 0.56);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frame = window.requestAnimationFrame(draw);
    };

    const syncAnimation = () => {
      if (documentVisible && sectionVisible) {
        if (!frame) {
          lastFrameAt = performance.now();
          frame = window.requestAnimationFrame(draw);
        }
      } else if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const handleVisibilityChange = () => {
      documentVisible = !document.hidden;
      syncAnimation();
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        sectionVisible = entry.intersectionRatio >= 0.5;
        syncAnimation();
      },
      { threshold: [0, 0.5, 1] }
    );

    resizeObserver.observe(canvas);
    intersectionObserver.observe(sectionRef.current ?? canvas);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    syncAnimation();

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      gl.deleteBuffer(positions);
      gl.deleteProgram(program);
    };
  }, []);

  const contentTransition = shouldReduceMotion ? REDUCED_TRANSITION : SLIDE_TRANSITION;
  const labelTransition = shouldReduceMotion
    ? REDUCED_TRANSITION
    : { ...SLIDE_TRANSITION, delay: 0.08 };

  return (
    <section
      ref={sectionRef}
      className="collection-hero relative h-[calc(100svh-100px)] w-full touch-pan-y overflow-hidden outline-none md:h-[840px]"
      style={{ backgroundColor: activeSlide.colors[0], outline: "none" }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Fasthaus lamp collection"
      tabIndex={0}
      onPointerEnter={() => {
        isPointerInsideRef.current = true;
      }}
      onPointerLeave={() => {
        isPointerInsideRef.current = false;
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => {
        swipeStartRef.current = null;
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full" aria-hidden="true" />

      <div
        className="absolute inset-y-0 left-0 z-30 hidden w-1/2 md:block"
        style={{ cursor: "w-resize" }}
        onClick={scrollPrevious}
        aria-hidden="true"
      />
      <div
        className="absolute inset-y-0 right-0 z-30 hidden w-1/2 md:block"
        style={{ cursor: "e-resize" }}
        onClick={scrollNext}
        aria-hidden="true"
      />

      <AnimatePresence initial={false} mode="sync" custom={direction}>
        <motion.div
          key={activeSlide.id + "-" + transitionSequence}
          className="pointer-events-none absolute inset-0"
          initial="enter"
          animate="center"
          exit="exit"
          custom={direction}
        >
          <div className="absolute inset-0 -translate-y-[10%] md:translate-y-0">
            <div className="absolute left-1/2 top-[46%] z-10 -translate-x-1/2 -translate-y-1/2">
              <motion.h2
                className="font-golften-stamp whitespace-nowrap text-center text-[122px] font-light leading-none tracking-[0.004em] text-[#F8F6F3] [text-shadow:2px_2px_22px_rgba(20,17,20,0.9),0_0_10px_rgba(248,246,243,0.5)] md:text-[clamp(54.08px,calc(11.44vw+8.32px),195.52px)] md:[text-shadow:2px_2px_16px_rgb(184,185,186)]"
                variants={shouldReduceMotion ? REDUCED_TITLE_VARIANTS : TITLE_VARIANTS}
                transition={contentTransition}
              >
                {activeSlide.lampName}
              </motion.h2>
            </div>

            <div className="absolute inset-0 z-0 flex items-center translate-x-[-6px] justify-center pb-[3%]">
              <motion.div
                className="relative aspect-square shrink-0"
                variants={shouldReduceMotion ? REDUCED_VARIANTS : LAMP_VARIANTS}
                transition={contentTransition}
                style={{ width: "var(--collection-hero-artwork-width)" }}
              >
                <Image
                  src={activeSlide.image}
                  alt={activeSlide.lampName + " lamp in " + activeSlide.colorName}
                  fill
                  sizes="(min-width: 768px) 48vw, 132vw"
                  className="object-contain"
                  priority={selectedIndex === 0}
                  draggable={false}
                />
              </motion.div>
            </div>

            <div className="absolute bottom-[15%] left-[50.5%] z-30 -translate-x-1/2 md:bottom-[12%]">
              <motion.p
                className="font-golften-stamp whitespace-nowrap font-semibold uppercase tracking-[0.004em] text-white"
                variants={shouldReduceMotion ? REDUCED_VARIANTS : LABEL_VARIANTS}
                transition={labelTransition}
                style={{ fontSize: "32px" }}
              >
                {activeSlide.colorName}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-x-0 top-1/2 z-40 flex -translate-y-1/2 justify-between px-4 text-white md:hidden">
        <button
          type="button"
          onClick={scrollPrevious}
          aria-label="Show previous lamp"
          className="grid h-11 w-11 place-items-center rounded-full outline-none transition-opacity hover:opacity-60 focus-visible:ring-2 focus-visible:ring-[#141114] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        >
          <ArrowLeft size={32} strokeWidth={1.5} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          aria-label="Show next lamp"
          className="grid h-11 w-11 place-items-center rounded-full outline-none transition-opacity hover:opacity-60 focus-visible:ring-2 focus-visible:ring-[#141114] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        >
          <ArrowRight size={32} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      <div
        className="absolute left-1/2 z-40 flex -translate-x-1/2 items-center text-white md:left-auto md:right-10 md:translate-x-0 md:gap-3"
        style={{ bottom: "calc(20px + env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={scrollPrevious}
          aria-label="Show previous lamp"
          className="order-2 hidden h-11 w-11 place-items-center rounded-full text-white outline-none transition-opacity hover:opacity-60 focus-visible:ring-2 focus-visible:ring-[#141114] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent md:grid"
        >
          <ArrowLeft size={32} strokeWidth={1.5} aria-hidden="true" />
        </button>
        <span className="order-1 min-w-[58px] text-center text-xs font-medium tabular-nums tracking-[0.08em] md:mr-2">
          {formatCounter(selectedIndex + 1)} / {formatCounter(slideCount)}
        </span>
        <button
          type="button"
          onClick={scrollNext}
          aria-label="Show next lamp"
          className="order-3 hidden h-11 w-11 place-items-center rounded-full text-white outline-none transition-opacity hover:opacity-60 focus-visible:ring-2 focus-visible:ring-[#141114] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent md:grid"
        >
          <ArrowRight size={32} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {activeSlide.lampName} lamp, {activeSlide.colorName}, slide {selectedIndex + 1} of{" "}
        {slideCount}
      </p>
    </section>
  );
}
