/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Radio, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Zap, 
  ShieldAlert, 
  Cpu, 
  Award,
  ArrowRight,
  Sparkles
} from "lucide-react";

// ==========================================
// 1. WEB AUDIO API SYNTHESIZER ENGINE
// ==========================================
class AudioEngine {
  private ctx: AudioContext | null = null;
  private humOsc: OscillatorNode | null = null;
  private humGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private isMuted: boolean = false;

  constructor() {}

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      this.ctx = new AudioContextClass();
      
      // Master mechanical pull hum
      this.humOsc = this.ctx.createOscillator();
      this.humOsc.type = "triangle";
      this.humOsc.frequency.setValueAtTime(60, this.ctx.currentTime); // Deep low bass

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.frequency.setValueAtTime(130, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(4, this.ctx.currentTime);

      this.humGain = this.ctx.createGain();
      this.humGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.humOsc.connect(this.filter);
      this.filter.connect(this.humGain);
      this.humGain.connect(this.ctx.destination);
      this.humOsc.start();
    } catch (e) {
      console.warn("Web Audio Context initialization blocked/failed: ", e);
    }
  }

  setMuted(mute: boolean) {
    this.isMuted = mute;
    if (this.humGain && this.ctx) {
      this.humGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  setHum(intensity: number) {
    if (this.isMuted || !this.ctx || !this.humGain || !this.humOsc || !this.filter) return;
    
    const now = this.ctx.currentTime;
    // Frequency ramps up based on pulling strain
    this.humOsc.frequency.setTargetAtTime(60 + intensity * 65, now, 0.1);
    this.filter.frequency.setTargetAtTime(130 + intensity * 240, now, 0.12);
    this.humGain.gain.setTargetAtTime(intensity * 0.38, now, 0.05);
  }

  playLaunch() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.18);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.2);
  }

  playLatch() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    
    // High-tech sound when probe makes connection
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.setValueAtTime(659.25, now + 0.05); // E5

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1046.5, now); // C6
    osc2.frequency.setValueAtTime(1318.51, now + 0.05); // E6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  }

  playClink() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.07);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + 0.1);
  }

  playSurge() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 1.2);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(150, now);
    filter.frequency.exponentialRampToValueAtTime(2000, now + 1.0);
    filter.Q.setValueAtTime(6, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + 1.3);
  }

  playExplosion() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const randGain = this.ctx.createGain();
    const masterGain = this.ctx.createGain();

    // Heavy direct rumble pulse
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(10, now + 1.5);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(280, now);
    filter.frequency.exponentialRampToValueAtTime(10, now + 1.5);
    filter.Q.setValueAtTime(10, now);

    // Dynamic noise buffers (explosion debris hiss)
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(70, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(15, now + 1.2);

    randGain.gain.setValueAtTime(0.45, now);
    randGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    masterGain.gain.setValueAtTime(0.55, now);
    masterGain.gain.exponentialRampToValueAtTime(0.005, now + 1.7);

    noise.connect(noiseFilter);
    noiseFilter.connect(randGain);
    randGain.connect(masterGain);

    osc.connect(filter);
    filter.connect(masterGain);

    masterGain.connect(this.ctx.destination);

    osc.start();
    noise.start();
    osc.stop(now + 1.8);
    noise.stop(now + 1.8);
  }
}

// Instantiate engine globally to share states across renders safely
const audioEngine = new AudioEngine();

// ==========================================
// 2. DATA STRUCTURE DEFINITIONS
// ==========================================
interface Point {
  x: number;
  y: number;
}

interface Cavern {
  leftWall: Point[];
  rightWall: Point[];
}

interface RotatorBar {
  cx: number;
  cy: number;
  len: number;
  angle: number;
  speed: number;
}

interface Disruptor {
  cx: number;
  cy: number;
  radius: number;
  strength: number;
}

interface Barrel {
  cx: number;
  cy: number;
  radius: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  type: "spark" | "dust" | "fire" | "ring";
  gScale?: number;
}

// ==========================================
// 3. CAVERN & HAZARDS PROCEDURAL MAP BUILDER
// ==========================================
function generateCavern(index: number): Cavern {
  const leftWall: Point[] = [];
  const rightWall: Point[] = [];
  const slices = 16;
  const heightStep = 720 / slices;

  const leftStart = 230;
  const rightStart = 1050;
  const leftEnd = 310;
  const rightEnd = 970;

  // Level winding factor
  const windAmount = Math.min(130, index * 22);
  const freq = 1.0;
  const phase = index * 2.15;

  for (let i = 0; i <= slices; i++) {
    const y = i * heightStep;
    const t = i / slices; // Normalized depth slice (0.0 to 1.0)

    const sinWave = Math.sin(t * Math.PI * freq + phase);
    const envelope = Math.sin(t * Math.PI); // Pin top and bottom edges (0 at t=0, t=1)
    const offset = sinWave * envelope * windAmount;

    // Minimum cavern spacing gets tighter as player descends deeper
    const corridorWidth = Math.max(190, 290 - index * 12);

    let leftX = leftStart + (leftEnd - leftStart) * t + offset - corridorWidth / 2;
    let rightX = rightStart + (rightEnd - rightStart) * t + offset + corridorWidth / 2;

    // Rigid physical clamps to keep maps inside render bounds
    leftX = Math.max(50, Math.min(480, leftX));
    rightX = Math.min(1230, Math.max(800, rightX));

    // Wide entrance at the top region near the electromagnet
    if (y < 120) {
      const blend = y / 120;
      leftX = Math.max(40, leftX * blend + 40 * (1 - blend));
      rightX = Math.min(1240, rightX * blend + 1240 * (1 - blend));
    }

    leftWall.push({ x: leftX, y });
    rightWall.push({ x: rightX, y });
  }

  return { leftWall, rightWall };
}

function generateHazards(index: number, cavern: Cavern) {
  const rotators: RotatorBar[] = [];
  const disruptors: Disruptor[] = [];
  const barrels: Barrel[] = [];

  const centerSlices = cavern.leftWall.map((v, i) => ({
    x: (v.x + cavern.rightWall[i].x) / 2,
    y: v.y
  }));

  if (index === 0) {
    // Tutorial: Just 1 explosive safety barrel to teach visual threat
    barrels.push({
      cx: cavern.rightWall[10].x - 65,
      cy: cavern.rightWall[10].y,
      radius: 20
    });
  } else if (index === 1) {
    // Level 2: 1 central rotating steel bar
    const mid = centerSlices[8];
    rotators.push({
      cx: mid.x,
      cy: mid.y,
      len: 210,
      angle: 0.0,
      speed: 0.016
    });
  } else if (index === 2) {
    // Level 3: 1 Side Repulsory Disruptor and 1 barrel
    const dis = centerSlices[7];
    disruptors.push({
      cx: dis.x - 70,
      cy: dis.y,
      radius: 140,
      strength: 0.38
    });

    const bar = centerSlices[11];
    barrels.push({
      cx: bar.x + 80,
      cy: bar.y,
      radius: 20
    });
  } else if (index === 3) {
    // Level 4: Complex blockades with barrels on ledge side, spinning bar in center
    const upper = centerSlices[4];
    const lower = centerSlices[12];
    
    barrels.push({
      cx: cavern.leftWall[4].x + 55,
      cy: upper.y,
      radius: 20
    });
    barrels.push({
      cx: cavern.rightWall[12].x - 55,
      cy: lower.y,
      radius: 20
    });

    const mid = centerSlices[8];
    rotators.push({
      cx: mid.x,
      cy: mid.y,
      len: 170,
      angle: Math.PI / 4,
      speed: -0.014
    });
  } else if (index === 4) {
    // Level 5: High stakes narrow corridor. Dual explosive barrels surrounding core swing.
    const mid = centerSlices[8];
    disruptors.push({
      cx: mid.x,
      cy: mid.y - 70,
      radius: 160,
      strength: 0.45
    });

    barrels.push({
      cx: cavern.leftWall[10].x + 60,
      cy: cavern.leftWall[10].y,
      radius: 20
    });
    barrels.push({
      cx: cavern.rightWall[10].x - 60,
      cy: cavern.rightWall[10].y,
      radius: 20
    });
  } else {
    // Endless procedural scaling
    const hasRotator = index % 2 !== 0;
    const hasDisruptor = index % 3 !== 0;
    const barrelCount = Math.min(3, 1 + (index % 3));

    if (hasRotator) {
      const mid = centerSlices[8];
      rotators.push({
        cx: mid.x + (index % 2 === 0 ? -50 : 50),
        cy: mid.y,
        len: 160 + (index % 4) * 12,
        angle: (index * 15) * Math.PI / 180,
        speed: 0.01 * (1.1 + (index % 3) * 0.22) * (index % 2 === 0 ? 1 : -1)
      });
    }

    if (hasDisruptor) {
      const targetSlice = centerSlices[6];
      disruptors.push({
        cx: targetSlice.x + (index % 3 === 0 ? -70 : 70),
        cy: targetSlice.y,
        radius: 155,
        strength: 0.35 + (index % 4) * 0.06
      });
    }

    for (let b = 0; b < barrelCount; b++) {
      const sliceIdx = 4 + b * 4;
      const bY = centerSlices[sliceIdx].y;
      const placeLeft = (b + index) % 2 === 0;
      const bX = placeLeft 
        ? cavern.leftWall[sliceIdx].x + 55 
        : cavern.rightWall[sliceIdx].x - 55;

      barrels.push({
        cx: bX,
        cy: bY,
        radius: 20
      });
    }
  }

  return { rotators, disruptors, barrels };
}

// ==========================================
// 4. MAIN INTERACTIVE REACT COMPONENT
// ==========================================
export default function App() {
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<"TITLE" | "PLAYING" | "SUCCESS_TRANSITION" | "SCROLLING" | "GAMEOVER">("TITLE");
  const [score, setScore] = useState<number>(0);
  const [depth, setDepth] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem("magnapull_highscore") || "0");
  });
  const [highDepth, setHighDepth] = useState<number>(() => {
    return Number(localStorage.getItem("magnapull_highdepth") || "0");
  });
  const [musicMuted, setMusicMuted] = useState<boolean>(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // References to keep 60FPS math synchronized and unblocked by React renders
  const gameModeRef = useRef<string>("TITLE");
  const currentLevelIndexRef = useRef<number>(0);
  
  // Custom Slingshot physics state
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<Point | null>(null);
  const dragCurrentRef = useRef<Point | null>(null);

  // Active Phase: 'SLING' -> 'LAUNCHED' -> 'PULL'
  const phaseRef = useRef<"SLING" | "LAUNCHED" | "PULL">("SLING");

  // Physics Objects
  const pulseRef = useRef<{ x: number; y: number; vx: number; vy: number; radius: number } | null>(null);
  const coreRef = useRef<{ x: number; y: number; vx: number; vy: number; radius: number } | null>(null);

  // Level maps
  const currentCaveRef = useRef<Cavern>(generateCavern(0));
  const currentHazardsRef = useRef(generateHazards(0, currentCaveRef.current));

  // Secondary scroll visual backup level
  const nextCaveRef = useRef<Cavern | null>(null);
  const nextHazardsRef = useRef<any>(null);

  // Visual offsets
  const scrollProgressRef = useRef<number>(0.0);
  const cameraShakeRef = useRef<number>(0);
  const coreCapturedTimerRef = useRef<number>(0);

  // Holding pulling triggers
  const isHoldingPullRef = useRef<boolean>(false);

  // Particles
  const particlesRef = useRef<Particle[]>([]);
  const particleIdCounterRef = useRef<number>(0);

  // Sync state variables with refs
  useEffect(() => {
    gameModeRef.current = gameMode;
  }, [gameMode]);

  // Load High Score
  useEffect(() => {
    const s = localStorage.getItem("magnapull_highscore");
    const d = localStorage.getItem("magnapull_highdepth");
    if (s) setHighScore(Number(s));
    if (d) setHighDepth(Number(d));
  }, []);



  // Update mute status
  const toggleMute = () => {
    const target = !musicMuted;
    setMusicMuted(target);
    audioEngine.setMuted(target);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    audioEngine.init();
    audioEngine.setMuted(musicMuted);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = 1280 / rect.width;
    const scaleY = 720 / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

    if (gameModeRef.current !== "PLAYING") return;

    if (phaseRef.current === "SLING") {
      isDraggingRef.current = true;
      dragStartRef.current = { x: px, y: py };
      dragCurrentRef.current = { x: px, y: py };
      canvas.setPointerCapture(e.pointerId);
    } else if (phaseRef.current === "PULL") {
      isHoldingPullRef.current = true;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (gameModeRef.current !== "PLAYING") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1280 / rect.width;
    const scaleY = 720 / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

    if (isDraggingRef.current && dragStartRef.current) {
      dragCurrentRef.current = { x: px, y: py };
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (isDraggingRef.current && dragStartRef.current && dragCurrentRef.current) {
      // Calculate slingshot angle delta
      const dx = dragStartRef.current.x - dragCurrentRef.current.x;
      const dy = dragStartRef.current.y - dragCurrentRef.current.y;

      const launchMultiplier = 0.088; // Physics scaling force code
      let vx = dx * launchMultiplier;
      let vy = dy * launchMultiplier;

      // Impose realistic orbital launch velocity limits
      const maxSpeed = 19;
      const currentSpeed = Math.sqrt(vx * vx + vy * vy);
      if (currentSpeed > maxSpeed) {
        vx = (vx / currentSpeed) * maxSpeed;
        vy = (vy / currentSpeed) * maxSpeed;
      }

      // Fire magnetic pulse ball from Core Electromagnet at top center
      pulseRef.current = {
        x: 640,
        y: 65,
        vx,
        vy,
        radius: 10
      };

      isDraggingRef.current = false;
      dragStartRef.current = null;
      dragCurrentRef.current = null;
      phaseRef.current = "LAUNCHED";

      audioEngine.playLaunch();
      canvasRef.current?.releasePointerCapture(e.pointerId);
    }

    isHoldingPullRef.current = false;
  };

  // Safe manual restart trigger
  const startGame = () => {
    audioEngine.init();
    audioEngine.setMuted(musicMuted);

    // Setup perfect start state
    currentLevelIndexRef.current = 0;
    setScore(0);
    setDepth(0);

    const initCavern = generateCavern(0);
    currentCaveRef.current = initCavern;
    currentHazardsRef.current = generateHazards(0, initCavern);

    // Center starting cradle calculations
    const botIdx = initCavern.leftWall.length - 1;
    const startX = (initCavern.leftWall[botIdx].x + initCavern.rightWall[botIdx].x) / 2;
    
    // Core details
    coreRef.current = {
      x: startX,
      y: 635,
      vx: 0,
      vy: 0,
      radius: 22
    };

    pulseRef.current = null;
    phaseRef.current = "SLING";
    scrollbarAndResetState();

    setGameStarted(true);
    setGameMode("PLAYING");
  };

  const scrollbarAndResetState = () => {
    isDraggingRef.current = false;
    dragStartRef.current = null;
    dragCurrentRef.current = null;
    isHoldingPullRef.current = false;
    particlesRef.current = [];
    audioEngine.setHum(0.0);
  };

  const triggerDeath = (abyss: boolean) => {
    setGameMode("GAMEOVER");
    audioEngine.setHum(0);
    audioEngine.playExplosion();
    cameraShakeRef.current = 45;

    // Save records
    const finalScore = score;
    const finalDepth = (score * 12.5); // 12.5 meters depth step representation
    
    if (finalScore > highScore) {
      localStorage.setItem("magnapull_highscore", String(finalScore));
      setHighScore(finalScore);
    }
    if (finalDepth > highDepth) {
      localStorage.setItem("magnapull_highdepth", String(finalDepth));
      setHighDepth(finalDepth);
    }

    // Spawn massive fiery particle cluster at point of death
    const blastX = coreRef.current ? coreRef.current.x : 640;
    const blastY = coreRef.current ? (abyss ? 700 : coreRef.current.y) : 360;

    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 11;
      particlesRef.current.push({
        id: particleIdCounterRef.current++,
        x: blastX,
        y: blastY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 16,
        color: i % 3 === 0 ? "#ef4444" : i % 3 === 1 ? "#f97316" : "#eab308",
        alpha: 1.0,
        decay: 0.015 + Math.random() * 0.02,
        type: "fire",
        gScale: -0.05
      });
    }

    // Add immediate high impact core sparks
    for (let i = 0; i < 30; i++) {
       const angle = Math.random() * Math.PI * 2;
       const speed = 4 + Math.random() * 8;
       particlesRef.current.push({
         id: particleIdCounterRef.current++,
         x: blastX,
         y: blastY,
         vx: Math.cos(angle) * speed,
         vy: Math.sin(angle) * speed,
         size: 2 + Math.random() * 4,
         color: "#22c55e", // Core chemical particles
         alpha: 1.0,
         decay: 0.02 + Math.random() * 0.03,
         type: "spark",
         gScale: 0.1
       });
    }

    // Shockwave expansion ring
    particlesRef.current.push({
      id: particleIdCounterRef.current++,
      x: blastX,
      y: blastY,
      vx: 0,
      vy: 0,
      size: 15,
      color: "rgba(239, 68, 68, 0.8)",
      alpha: 1.0,
      decay: 0.04,
      type: "ring"
    });
  };

  // Custom collision solver (Circle on Segment)
  const collideCircleWithSegment = (
    cx: number, 
    cy: number, 
    vx: number, 
    vy: number, 
    radius: number,
    p1: Point, 
    p2: Point,
    restitution: number,
    isCore: boolean,
    segmentVelY: number = 0 // For transfer of velocity from sliding platforms
  ) => {
    const abX = p2.x - p1.x;
    const abY = p2.y - p1.y;
    const acX = cx - p1.x;
    const acY = cy - p1.y;

    const abSq = abX * abX + abY * abY;
    if (abSq === 0) return null;

    let t = (acX * abX + acY * abY) / abSq;
    t = Math.max(0, Math.min(1, t)); // Constrain strictly onto segment bounds

    // Closest point coordinates
    const px = p1.x + t * abX;
    const py = p1.y + t * abY;

    const distVecX = cx - px;
    const distVecY = cy - py;
    const d = Math.sqrt(distVecX * distVecX + distVecY * distVecY);

    if (d < radius && d > 0.0001) {
      const nx = distVecX / d;
      const ny = distVecY / d;

      // Adjust positioning away from segment immediately to prevent sticking
      const penetration = radius - d;
      const newCx = cx + nx * penetration;
      const newCy = cy + ny * penetration;

      // Target velocity translation
      const relVelX = vx;
      const relVelY = vy - segmentVelY;

      // Vector reflection math
      const dot = relVelX * nx + relVelY * ny;
      if (dot < 0) {
        const impulse = -(1 + restitution) * dot;
        const newVx = vx + nx * impulse;
        const newVy = vy + ny * impulse + segmentVelY;

        // Perform wall impact spark spawn
        const contactX = px;
        const contactY = py;

        if (Math.abs(dot) > 1.4) {
          audioEngine.playClink();
          // Generate aesthetic sparks
          for (let s = 0; s < 4; s++) {
            const angle = Math.atan2(ny, nx) + (Math.random() - 0.5) * 1.5;
            const speed = 1.5 + Math.random() * 4.5;
            particlesRef.current.push({
              id: particleIdCounterRef.current++,
              x: contactX,
              y: contactY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed + (isCore ? 0.3 : 0),
              size: 2 + Math.random() * 3,
              color: isCore ? "#22c55e" : "#f97316",
              alpha: 0.9,
              decay: 0.03 + Math.random() * 0.03,
              type: "spark",
              gScale: 0.15
            });
          }
        }

        return { x: newCx, y: newCy, vx: newVx, vy: newVy, collided: true };
      }
    }
    return null;
  };

  // Animation frame loop handling physics and graphics updates
  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId = requestAnimationFrame(tick);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animationFrameId = requestAnimationFrame(tick);
        return;
      }

      // Ensure stable canvas sizes
      if (canvas.width !== 1280 || canvas.height !== 720) {
        canvas.width = 1280;
        canvas.height = 720;
      }

      // Handle screen-shaking degradation
      if (cameraShakeRef.current > 0) {
        cameraShakeRef.current *= 0.92;
        if (cameraShakeRef.current < 0.2) cameraShakeRef.current = 0;
      }

      // ==========================================
      // A. GAME STATE UPDATE: "PLAYING" MODEL
      // ==========================================
      if (gameModeRef.current === "PLAYING") {
        const levelIdx = currentLevelIndexRef.current;
        const cave = currentCaveRef.current;
        const hazards = currentHazardsRef.current;

        // 1. Update Hazardous Obstacle rotators
        hazards.rotators.forEach((rot) => {
          rot.angle += rot.speed;
        });

        // 2. Physics Model: Slingshot probe launched
        if (phaseRef.current === "LAUNCHED" && pulseRef.current) {
          const p = pulseRef.current;
          // Apply light downward gravity on energy probe
          p.vy += 0.09;

          p.x += p.vx;
          p.y += p.vy;

          // Wall interactions
          for (let s = 0; s < cave.leftWall.length - 1; s++) {
            const res = collideCircleWithSegment(p.x, p.y, p.vx, p.vy, p.radius, cave.leftWall[s], cave.leftWall[s+1], 0.6, false);
            if (res) {
              p.x = res.x; p.y = res.y; p.vx = res.vx; p.vy = res.vy;
            }
          }
          for (let s = 0; s < cave.rightWall.length - 1; s++) {
            const res = collideCircleWithSegment(p.x, p.y, p.vx, p.vy, p.radius, cave.rightWall[s], cave.rightWall[s+1], 0.6, false);
            if (res) {
              p.x = res.x; p.y = res.y; p.vx = res.vx; p.vy = res.vy;
            }
          }

          // Rotating metal bars interactions
          hazards.rotators.forEach((rot) => {
            const halfL = rot.len / 2;
            const cos = Math.cos(rot.angle);
            const sin = Math.sin(rot.angle);

            const p1 = {
              x: rot.cx - cos * halfL,
              y: rot.cy - sin * halfL
            };
            const p2 = {
              x: rot.cx + cos * halfL,
              y: rot.cy + sin * halfL
            };

            // Estimate surface sliding speed at contact point
            const res = collideCircleWithSegment(p.x, p.y, p.vx, p.vy, p.radius, p1, p2, 0.7, false);
            if (res) {
              p.x = res.x; p.y = res.y; p.vx = res.vx; p.vy = res.vy;
            }
          });

          // Check if pulse triggers and latches onto the heavy core
          if (coreRef.current) {
            const c = coreRef.current;
            const dx = p.x - c.x;
            const dy = p.y - c.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < p.radius + c.radius) {
              // Pulse latch success triggers the electro-magnetic connection phase!
              phaseRef.current = "PULL";
              pulseRef.current = null;
              audioEngine.playLatch();

              // Spawn tiny celebratory green dust cloud around connection impact
              for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1.0 + Math.random() * 4.0;
                particlesRef.current.push({
                  id: particleIdCounterRef.current++,
                  x: c.x,
                  y: c.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  size: 2 + Math.random() * 3,
                  color: "#22c55e",
                  alpha: 1.0,
                  decay: 0.03 + Math.random() * 0.02,
                  type: "spark"
                });
              }
            }
          }

          // Lost in abyss checks
          if (p.y > 750 || p.x < -100 || p.x > 1380) {
            phaseRef.current = "SLING";
            pulseRef.current = null;
          }
        }

        // 3. Physics Model: Main Heavy Core
        if (coreRef.current) {
          const c = coreRef.current;

          if (phaseRef.current === "PULL") {
            // Apply standard environmental gravity
            c.vy += 0.17; // Heavy core weight factor

            // Apply constant fluid air damping resistance to control velocity builds
            c.vx *= 0.992;
            c.vy *= 0.992;

            // Apply user electro-magnetic pull force targeting magnet coordinates (640, 65)
            if (isHoldingPullRef.current) {
              const magX = 640;
              const magY = 65;
              const dx = magX - c.x;
              const dy = magY - c.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist > 15) {
                const ux = dx / dist;
                const uy = dy / dist;

                // Solid attraction force
                const pullPower = 0.38;
                c.vx += ux * pullPower;
                c.vy += uy * pullPower;
              }

              // Set energetic pull vibration levels
              audioEngine.setHum(Math.min(1.0, (180 / Math.max(100, Math.sqrt(c.vx*c.vx + c.vy*c.vy)*50))));
              
              // Spark particle trails
              if (Math.random() < 0.2) {
                particlesRef.current.push({
                  id: particleIdCounterRef.current++,
                  x: c.x + (Math.random() - 0.5) * 16,
                  y: c.y + (Math.random() - 0.5) * 16,
                  vx: -c.vx * 0.4 + (Math.random() - 0.5) * 1.5,
                  vy: -c.vy * 0.4 + (Math.random() - 0.5) * 1.5,
                  size: 1 + Math.random() * 2,
                  color: "#22c55e",
                  alpha: 0.8,
                  decay: 0.02 + Math.random() * 0.03,
                  type: "dust"
                });
              }
            } else {
              audioEngine.setHum(0.08); // Silent passive connection tick
            }

            // Repulsing field force of active Blue Disruptors
            hazards.disruptors.forEach((dis) => {
              const dx = c.x - dis.cx;
              const dy = c.y - dis.cy;
              const d = Math.sqrt(dx * dx + dy * dy);

              if (d < dis.radius) {
                const nx = dx / d;
                const ny = dy / d;

                // Force ramps higher when closer (Inverse linear)
                const influenceRatio = 1.0 - d / dis.radius;
                const pushAmt = dis.strength * influenceRatio * 0.52;
                c.vx += nx * pushAmt;
                c.vy += ny * pushAmt;

                // Push visual discharge particles
                if (Math.random() < 0.15) {
                  particlesRef.current.push({
                    id: particleIdCounterRef.current++,
                    x: dis.cx + nx * 22,
                    y: dis.cy + ny * 22,
                    vx: nx * (2 + Math.random() * 4) + (Math.random() - 0.5) * 1.5,
                    vy: ny * (2 + Math.random() * 4) + (Math.random() - 0.5) * 1.5,
                    size: 2 + Math.random() * 3,
                    color: "rgba(6, 182, 212, 0.9)",
                    alpha: 1.0,
                    decay: 0.04,
                    type: "spark"
                  });
                }
              }
            });

            // Perform final coordinates movement step
            c.x += c.vx;
            c.y += c.vy;

            // Resolve Jagged Rock Cave Walls collisions
            for (let s = 0; s < cave.leftWall.length - 1; s++) {
              const res = collideCircleWithSegment(c.x, c.y, c.vx, c.vy, c.radius, cave.leftWall[s], cave.leftWall[s+1], 0.35, true);
              if (res) {
                c.x = res.x; c.y = res.y; c.vx = res.vx; c.vy = res.vy;
                cameraShakeRef.current = Math.max(cameraShakeRef.current, Math.min(10, Math.abs(res.vx * 1.2)));
              }
            }
            for (let s = 0; s < cave.rightWall.length - 1; s++) {
              const res = collideCircleWithSegment(c.x, c.y, c.vx, c.vy, c.radius, cave.rightWall[s], cave.rightWall[s+1], 0.35, true);
              if (res) {
                c.x = res.x; c.y = res.y; c.vx = res.vx; c.vy = res.vy;
                cameraShakeRef.current = Math.max(cameraShakeRef.current, Math.min(10, Math.abs(res.vx * 1.2)));
              }
            }

            // Heavy colliding on steel rotators
            hazards.rotators.forEach((rot) => {
              const halfL = rot.len / 2;
              const cos = Math.cos(rot.angle);
              const sin = Math.sin(rot.angle);

              const p1 = {
                x: rot.cx - cos * halfL,
                y: rot.cy - sin * halfL
              };
              const p2 = {
                x: rot.cx + cos * halfL,
                y: rot.cy + sin * halfL
              };

              // Momentum calculation on rotating impact
              const res = collideCircleWithSegment(c.x, c.y, c.vx, c.vy, c.radius, p1, p2, 0.45, true);
              if (res) {
                c.x = res.x; c.y = res.y;
                
                // Add velocity from rotating surface
                // Vector perpendicular to radius
                const dX = c.x - rot.cx;
                const dY = c.y - rot.cy;
                
                // Rotational surface velocity: vt = omega * radius
                const rotVx = -rot.speed * dY;
                const rotVy = rot.speed * dX;

                c.vx = res.vx + rotVx * 0.7;
                c.vy = res.vy + rotVy * 0.7;

                cameraShakeRef.current = Math.max(cameraShakeRef.current, Math.min(12, Math.abs(c.vx * 1.5)));
              }
            });

            // Hit explosive red barrels (Immediate detonation trigger)
            hazards.barrels.forEach((bar) => {
              const dx = c.x - bar.cx;
              const dy = c.y - bar.cy;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < c.radius + bar.radius) {
                triggerDeath(false);
              }
            });

            // Falling into the bottom abyss
            if (c.y > 750) {
              triggerDeath(true);
            }

            // Reach upper industrial extraction region
            if (c.y < 115) {
              // Successfully harvested the Core!
              setGameMode("SUCCESS_TRANSITION");
              coreCapturedTimerRef.current = 65; // Transition countdown
              audioEngine.playSurge();
              audioEngine.setHum(0.0);
            }
          } else {
            // SLING state - core sits peacefully idle hovering in its cradle
            const botIdx = cave.leftWall.length - 1;
            const targetX = (cave.leftWall[botIdx].x + cave.rightWall[botIdx].x) / 2;
            c.x = targetX;
            c.y = 635 + Math.sin(Date.now() * 0.0035) * 4; // Idle hovering bobbing effect
          }
        }
      }

      // ==========================================
      // B. GAME STATE UPDATE: "SUCCESS" PIPELINE
      // ==========================================
      else if (gameModeRef.current === "SUCCESS_TRANSITION") {
        coreCapturedTimerRef.current--;

        // Suck the core directly into the electromagnet center
        if (coreRef.current) {
          const c = coreRef.current;
          const targetX = 640;
          const targetY = 60;
          c.x += (targetX - c.x) * 0.22;
          c.y += (targetY - c.y) * 0.22;

          // Emit highly dense core capture energy sparks
          particlesRef.current.push({
            id: particleIdCounterRef.current++,
            x: c.x + (Math.random() - 0.5) * 10,
            y: c.y + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 6,
            size: 2 + Math.random() * 4,
            color: "#22c55e",
            alpha: 1.0,
            decay: 0.04,
            type: "spark"
          });
        }

        if (coreCapturedTimerRef.current <= 0) {
          // Increment core level score metrics
          const newScore = score + 1;
          setScore(newScore);
          setDepth(newScore * 12.5);

          // Generate next deeper segment assets
          const nextIdx = currentLevelIndexRef.current + 1;
          nextCaveRef.current = generateCavern(nextIdx);
          nextHazardsRef.current = generateHazards(nextIdx, nextCaveRef.current);

          scrollProgressRef.current = 0.0;
          setGameMode("SCROLLING");
        }
      }

      // ==========================================
      // C. GAME STATE UPDATE: "SCROLLING" PIPELINE
      // ==========================================
      else if (gameModeRef.current === "SCROLLING") {
        // Increment scroll offset transition mapping
        scrollProgressRef.current += 0.018; // Cinematic camera movement velocity
        
        if (scrollProgressRef.current >= 1.0) {
          scrollProgressRef.current = 1.0;

          // Transition old assets swap variables
          currentLevelIndexRef.current += 1;
          currentCaveRef.current = nextCaveRef.current!;
          currentHazardsRef.current = nextHazardsRef.current!;

          nextCaveRef.current = null;
          nextHazardsRef.current = null;

          // Respawn core details back in the new deep cradle safely
          const cave = currentCaveRef.current;
          const botIdx = cave.leftWall.length - 1;
          const startX = (cave.leftWall[botIdx].x + cave.rightWall[botIdx].x) / 2;

          coreRef.current = {
            x: startX,
            y: 635,
            vx: 0,
            vy: 0,
            radius: 22
          };

          pulseRef.current = null;
          phaseRef.current = "SLING";
          scrollbarAndResetState();

          setGameMode("PLAYING");
        }
      }

      // ==========================================
      // 5. UPDATE FLOATING PARTICLES LIFE
      // ==========================================
      particlesRef.current = particlesRef.current.filter((p) => {
        p.alpha -= p.decay;
        if (p.alpha <= 0) return false;

        // Apply particle motion velocities
        if (p.gScale) {
          p.vy += p.gScale; // Gravity / buoyancy
        }
        p.x += p.vx;
        p.y += p.vy;

        return true;
      });

      // ==========================================
      // 6. MAIN HIGH-PERFORMANCE CANVAS RENDER
      // ==========================================
      ctx.save();

      // Screen-shake offset displacement operations
      if (cameraShakeRef.current > 0) {
        const shakeX = (Math.random() - 0.5) * cameraShakeRef.current;
        const shakeY = (Math.random() - 0.5) * cameraShakeRef.current;
        ctx.translate(shakeX, shakeY);
      }

      // A. Draw solid midnight background
      ctx.fillStyle = "#070a13";
      ctx.fillRect(0, 0, 1280, 720);

      // B. Draw Blueprint Gridlines
      ctx.strokeStyle = "#121a2c";
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < 1280; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 720);
        ctx.stroke();
      }
      for (let y = 0; y < 720; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1280, y);
        ctx.stroke();
      }

      // Render Level Contents
      const drawLevel = (
        targetCtx: CanvasRenderingContext2D, 
        cave: Cavern, 
        hazards: any, 
        core: typeof coreRef.current,
        isSecondary: boolean
      ) => {
        // 1. Fill outer slate-grey cavern boulders structure geometries
        targetCtx.fillStyle = "#121622";
        
        // Left Cave Shell
        targetCtx.beginPath();
        targetCtx.moveTo(0, 0);
        cave.leftWall.forEach((p) => targetCtx.lineTo(p.x, p.y));
        targetCtx.lineTo(0, 720);
        targetCtx.fill();

        // Right Cave Shell
        targetCtx.beginPath();
        targetCtx.moveTo(1280, 0);
        cave.rightWall.forEach((p) => targetCtx.lineTo(p.x, p.y));
        targetCtx.lineTo(1280, 720);
        targetCtx.fill();

        // 2. High contrasting borders (Bright safety hazard orange decals)
        targetCtx.strokeStyle = "#ea580c";
        targetCtx.lineWidth = 4.5;
        targetCtx.shadowBlur = 10;
        targetCtx.shadowColor = "rgba(234, 88, 12, 0.4)";

        targetCtx.beginPath();
        targetCtx.moveTo(cave.leftWall[0].x, cave.leftWall[0].y);
        for (let i = 1; i < cave.leftWall.length; i++) {
          targetCtx.lineTo(cave.leftWall[i].x, cave.leftWall[i].y);
        }
        targetCtx.stroke();

        targetCtx.beginPath();
        targetCtx.moveTo(cave.rightWall[0].x, cave.rightWall[0].y);
        for (let i = 1; i < cave.rightWall.length; i++) {
          targetCtx.lineTo(cave.rightWall[i].x, cave.rightWall[i].y);
        }
        targetCtx.stroke();

        targetCtx.shadowBlur = 0; // Clear glowing offsets

        // 3. Bottom Cradle Landing Pad for SLING phase
        const bottomIdx = cave.leftWall.length - 1;
        const cradleLeft = cave.leftWall[bottomIdx].x;
        const cradleRight = cave.rightWall[bottomIdx].x;
        const width = cradleRight - cradleLeft;
        const cx = cradleLeft + width / 2;

        targetCtx.fillStyle = "#1e293b";
        targetCtx.fillRect(cx - 80, 660, 160, 15);
        
        // Hazard black stripes pattern on cradle landing
        targetCtx.fillStyle = "#fbbf24";
        targetCtx.fillRect(cx - 80, 660, 160, 4);
        targetCtx.fillStyle = "#000000";
        for (let stripe = cx - 70; stripe < cx + 80; stripe += 25) {
          targetCtx.beginPath();
          targetCtx.moveTo(stripe, 660);
          targetCtx.lineTo(stripe - 10, 664);
          targetCtx.lineTo(stripe, 664);
          targetCtx.lineTo(stripe + 10, 660);
          targetCtx.fill();
        }

        // Supporting steel truss visuals
        targetCtx.strokeStyle = "#475569";
        targetCtx.lineWidth = 3;
        targetCtx.beginPath();
        targetCtx.moveTo(cx - 70, 664);
        targetCtx.lineTo(cx - 100, 720);
        targetCtx.moveTo(cx + 70, 664);
        targetCtx.lineTo(cx + 100, 720);
        targetCtx.stroke();

        // 4. Draw Rotating Hazards / Obstacles
        hazards.rotators.forEach((rot: RotatorBar) => {
          targetCtx.save();
          targetCtx.translate(rot.cx, rot.cy);
          targetCtx.rotate(rot.angle);

          // Render Core Hub Pivot
          targetCtx.fillStyle = "#334155";
          targetCtx.beginPath();
          targetCtx.arc(0, 0, 18, 0, Math.PI * 2);
          targetCtx.fill();
          targetCtx.strokeStyle = "#ea580c";
          targetCtx.lineWidth = 3;
          targetCtx.stroke();

          // Heavy Orange Steel Bar
          targetCtx.fillStyle = "#ea580c";
          targetCtx.fillRect(-rot.len / 2, -10, rot.len, 20);

          // Contrast Warning Stripes (Black hazard lines)
          targetCtx.fillStyle = "#0f172a";
          const stripeCount = Math.floor(rot.len / 35);
          for (let s = 0; s < stripeCount; s++) {
            const sx = -rot.len / 2 + s * 35 + 10;
            targetCtx.beginPath();
            targetCtx.moveTo(sx, -10);
            targetCtx.lineTo(sx + 15, -10);
            targetCtx.lineTo(sx + 5, 10);
            targetCtx.lineTo(sx - 10, 10);
            targetCtx.closePath();
            targetCtx.fill();
          }

          targetCtx.restore();
        });

        // 5. Draw Magnetic Disruptors Repulsion
        hazards.disruptors.forEach((dis: Disruptor) => {
          // Draw alpha repulsion field range circle
          const grad = targetCtx.createRadialGradient(dis.cx, dis.cy, 10, dis.cx, dis.cy, dis.radius);
          grad.addColorStop(0, "rgba(6, 182, 212, 0.28)");
          grad.addColorStop(0.5, "rgba(6, 182, 212, 0.08)");
          grad.addColorStop(1, "rgba(6, 182, 212, 0)");

          targetCtx.fillStyle = grad;
          targetCtx.beginPath();
          targetCtx.arc(dis.cx, dis.cy, dis.radius, 0, Math.PI * 2);
          targetCtx.fill();

          // Electric boundary field line
          targetCtx.strokeStyle = "rgba(6, 182, 212, 0.12)";
          targetCtx.lineWidth = 1;
          targetCtx.beginPath();
          targetCtx.arc(dis.cx, dis.cy, dis.radius, 0, Math.PI * 2);
          targetCtx.stroke();

          // Outer spinning shield rings
          targetCtx.strokeStyle = "#06b6d4";
          targetCtx.lineWidth = 2.5;
          targetCtx.save();
          targetCtx.translate(dis.cx, dis.cy);
          targetCtx.rotate(Date.now() * 0.0035);
          targetCtx.beginPath();
          targetCtx.arc(0, 0, 24, 0, Math.PI * 1.5);
          targetCtx.stroke();
          
          targetCtx.rotate(-Date.now() * 0.0065);
          targetCtx.strokeStyle = "#0891b2";
          targetCtx.beginPath();
          targetCtx.arc(0, 0, 31, 0, Math.PI * 1.25);
          targetCtx.stroke();
          targetCtx.restore();

          // Heavy magnetic center core
          targetCtx.fillStyle = "#0284c7";
          targetCtx.beginPath();
          targetCtx.arc(dis.cx, dis.cy, 14, 0, Math.PI * 2);
          targetCtx.fill();

          targetCtx.fillStyle = "#e0f2fe";
          targetCtx.beginPath();
          targetCtx.arc(dis.cx, dis.cy, 6, 0, Math.PI * 2);
          targetCtx.fill();
        });

        // 6. Draw Dangerous Explosive Red Barrels
        hazards.barrels.forEach((bar: Barrel) => {
          const isLededFlash = Math.floor(Date.now() / 320) % 2 === 0;

          // Draw cylinder base container
          targetCtx.fillStyle = "#ef4444";
          targetCtx.beginPath();
          targetCtx.arc(bar.cx, bar.cy, bar.radius, 0, Math.PI * 2);
          targetCtx.fill();

          // Black hazard stripes band center
          targetCtx.fillStyle = "#1e293b";
          targetCtx.fillRect(bar.cx - bar.radius, bar.cy - 5, bar.radius * 2, 10);

          targetCtx.strokeStyle = "#7f1d1d";
          targetCtx.lineWidth = 3;
          targetCtx.beginPath();
          targetCtx.arc(bar.cx, bar.cy, bar.radius, 0, Math.PI * 2);
          targetCtx.stroke();

          // Glowing Alert flashing indicator LED
          targetCtx.fillStyle = isLededFlash ? "#f87171" : "#1e293b";
          targetCtx.beginPath();
          targetCtx.arc(bar.cx, bar.cy - 10, 3, 0, Math.PI * 2);
          targetCtx.fill();

          if (isLededFlash) {
            targetCtx.shadowBlur = 8;
            targetCtx.shadowColor = "#f87171";
            targetCtx.fillStyle = "#ef4444";
            targetCtx.beginPath();
            targetCtx.arc(bar.cx, bar.cy - 10, 4, 0, Math.PI * 2);
            targetCtx.fill();
            targetCtx.shadowBlur = 0;
          }

          // Danger cross icon sign center (tiny white cross inside dark belt)
          targetCtx.strokeStyle = "#ffffff";
          targetCtx.lineWidth = 2.5;
          targetCtx.beginPath();
          targetCtx.moveTo(bar.cx - 4, bar.cy);
          targetCtx.lineTo(bar.cx + 4, bar.cy);
          targetCtx.moveTo(bar.cx, bar.cy - 4);
          targetCtx.lineTo(bar.cx, bar.cy + 4);
          targetCtx.stroke();
        });
      };

      // C. RENDER TRANSLATED TILES ACCORDING TO SCROLL CINEMATICS
      if (gameModeRef.current === "SCROLLING" && nextCaveRef.current) {
        const offset = scrollProgressRef.current * 720;
        
        ctx.save();
        ctx.translate(0, -offset);
        drawLevel(ctx, currentCaveRef.current, currentHazardsRef.current, null, false);
        ctx.restore();

        ctx.save();
        ctx.translate(0, 720 - offset);
        drawLevel(ctx, nextCaveRef.current, nextHazardsRef.current, null, true);
        ctx.restore();
      } else {
        // Standard single active level
        drawLevel(ctx, currentCaveRef.current, currentHazardsRef.current, coreRef.current, false);
      }

      // D. DRAW DUST/SPARK PARTICLES ENGINE
      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.type === "ring") {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 4;
          ctx.beginPath();
          // Expanding wave size
          const expandSize = p.size + (1.0 - p.alpha) * 320;
          ctx.arc(p.x, p.y, expandSize, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // E. DRAW MAGNETIC SLING PREVIEW (Sling Target trajectory)
      if (gameModeRef.current === "PLAYING" && phaseRef.current === "SLING" && isDraggingRef.current && dragStartRef.current && dragCurrentRef.current) {
        const dx = dragStartRef.current.x - dragCurrentRef.current.x;
        const dy = dragStartRef.current.y - dragCurrentRef.current.y;
        
        const launchMultiplier = 0.088;
        let vx = dx * launchMultiplier;
        let vy = dy * launchMultiplier;

        const maxSpeed = 19;
        const currentSpeed = Math.sqrt(vx * vx + vy * vy);
        if (currentSpeed > maxSpeed) {
          vx = (vx / currentSpeed) * maxSpeed;
          vy = (vy / currentSpeed) * maxSpeed;
        }

        // Draw projectile trajectory prediction dots
        ctx.strokeStyle = "rgba(249, 115, 22, 0.5)";
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 12]);
        ctx.beginPath();
        
        let simX = 640;
        let simY = 65;
        let simVx = vx;
        let simVy = vy;

        ctx.moveTo(simX, simY);
        for (let step = 0; step < 75; step++) {
          simVy += 0.09; // Simulate same gravity force code
          simX += simVx;
          simY += simVy;
          ctx.lineTo(simX, simY);

          // End drawing dash line if target goes beyond borders to keep it neat
          if (simY > 720 || simX < 0 || simX > 1280) break;
        }
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dashes

        // Draw pull joystick drag tether
        ctx.strokeStyle = "rgba(249, 115, 22, 0.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(dragStartRef.current.x, dragStartRef.current.y, 45, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.arc(dragCurrentRef.current.x, dragCurrentRef.current.y, 10, 0, Math.PI * 2);
        ctx.fill();

        // Arrow trace vector
        ctx.strokeStyle = "#fb923c";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(dragStartRef.current.x, dragStartRef.current.y);
        ctx.lineTo(dragCurrentRef.current.x, dragCurrentRef.current.y);
        ctx.stroke();
      }

      // F. PLOTS ACTIVE PHYSICAL LAUNCHED PULSE BALL
      if (gameModeRef.current === "PLAYING" && phaseRef.current === "LAUNCHED" && pulseRef.current) {
        const p = pulseRef.current;
        
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#f97316";
        
        // Pulse Orb core
        ctx.fillStyle = "#fed7aa";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#f97316";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

        // Trailing particles
        if (Math.random() < 0.5) {
          particlesRef.current.push({
            id: particleIdCounterRef.current++,
            x: p.x,
            y: p.y,
            vx: -p.vx * 0.3 + (Math.random() - 0.5),
            vy: -p.vy * 0.3 + (Math.random() - 0.5),
            size: 2 + Math.random() * 3,
            color: "rgba(249, 115, 22, 0.8)",
            alpha: 0.8,
            decay: 0.05,
            type: "dust"
          });
        }
      }

      // G. DRAW ELECTRIC LIGHTNING TETHER LINE (PULL active tether)
      const isActiveLvl = gameModeRef.current === "PLAYING" || gameModeRef.current === "SUCCESS_TRANSITION";
      if (isActiveLvl && phaseRef.current === "PULL" && coreRef.current) {
        const c = coreRef.current;
        const startX = 640;
        const startY = 65;

        ctx.save();

        // Animate flicker alpha tethers based on active holding state
        const isPulling = isHoldingPullRef.current;
        ctx.strokeStyle = isPulling ? "#06b6d4" : "rgba(34, 197, 94, 0.4)";
        ctx.lineWidth = isPulling ? 4.5 : 1.8;
        
        if (isPulling) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = "#06b6d4";
        }

        // Draw perfect electric zig-zag arc between points
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        const segments = 16;
        const dx = c.x - startX;
        const dy = c.y - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        for (let i = 1; i < segments; i++) {
          const t = i / segments;
          const px = startX + dx * t;
          const py = startY + dy * t;
          
          // Disperse random lightning offset perpendicularly
          const jitterMax = isPulling ? 13 : 5;
          const jitter = (Math.random() - 0.5) * jitterMax;

          // Perpendicular vector
          const nx = -dy / dist;
          const ny = dx / dist;

          ctx.lineTo(px + nx * jitter, py + ny * jitter);
        }

        ctx.lineTo(c.x, c.y);
        ctx.stroke();
        ctx.restore();
      }

      // H. PLOTS GLOWING HEAVY PLASMA CORE
      if (isActiveLvl && coreRef.current) {
        const c = coreRef.current;
        
        ctx.save();
        ctx.shadowBlur = 22;
        ctx.shadowColor = "#22c55e";

        // Glowing backdrop energy field
        const radialGrad = ctx.createRadialGradient(c.x, c.y, 5, c.x, c.y, c.radius + 15);
        radialGrad.addColorStop(0, "rgba(34, 197, 94, 0.85)");
        radialGrad.addColorStop(0.5, "rgba(34, 197, 94, 0.25)");
        radialGrad.addColorStop(1, "rgba(34, 197, 94, 0)");
        
        ctx.fillStyle = radialGrad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius + 15, 0, Math.PI * 2);
        ctx.fill();

        // Central raw metallic capsule casing
        ctx.fillStyle = "#15803d";
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner core spinning warning fuel cell
        ctx.strokeStyle = "#4ade80";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius - 4, 0, Math.PI * 2);
        ctx.stroke();

        // High luminous white energy bulb center
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius - 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Core geometric safety notches (Spinning shield design)
        ctx.strokeStyle = "#16a34a";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const spinAngle = (Date.now() * 0.0028);
        for (let rot = 0; rot < 3; rot++) {
          const a = spinAngle + (rot * Math.PI * 2) / 3;
          ctx.moveTo(c.x, c.y);
          ctx.lineTo(c.x + Math.cos(a) * c.radius, c.y + Math.sin(a) * c.radius);
        }
        ctx.stroke();

        // Passive emission ambient core particles
        if (Math.random() < 0.12) {
          particlesRef.current.push({
            id: particleIdCounterRef.current++,
            x: c.x + (Math.random() - 0.5) * 16,
            y: c.y + (Math.random() - 0.5) * 16,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -0.5 - Math.random() * 1.5,
            size: 1.5 + Math.random() * 2,
            color: "rgba(74, 222, 128, 0.85)",
            alpha: 0.9,
            decay: 0.02 + Math.random() * 0.02,
            type: "spark"
          });
        }
      }

      // I. DRAW IMMOBILE UPPER EXTRACTION REGION (Stationary extraction zone)
      ctx.fillStyle = "rgba(4, 120, 87, 0.14)"; // Soft green safety corridor
      ctx.fillRect(0, 0, 1280, 115);

      // Bottom border for the extraction region (Safety hatch hazard strip)
      ctx.fillStyle = "#059669";
      ctx.fillRect(0, 110, 1280, 5);

      // Warning dash pattern
      ctx.fillStyle = "#10b981";
      for (let offset = 0; offset < 1280; offset += 50) {
        ctx.beginPath();
        ctx.moveTo(offset, 110);
        ctx.lineTo(offset - 12, 115);
        ctx.lineTo(offset, 115);
        ctx.lineTo(offset + 12, 110);
        ctx.fill();
      }

      // Extraction label watermark center
      ctx.fillStyle = "#10b981";
      ctx.font = '800 13px "JetBrains Mono", monospace';
      ctx.textAlign = "center";
      ctx.fillText("CORE EXTRACTION GRID ZONE", 640, 102);

      // J. DRAW HEAVY TOP ELECTROMAGNET STRUCTURE
      const isMagnPulling = isHoldingPullRef.current && phaseRef.current === "PULL" && (gameModeRef.current === "PLAYING" || gameModeRef.current === "SUCCESS_TRANSITION");
      
      ctx.save();
      
      // Giant mechanical crane plate casing
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.moveTo(560, 0);
      ctx.lineTo(580, 65);
      ctx.lineTo(700, 65);
      ctx.lineTo(720, 0);
      ctx.closePath();
      ctx.fill();

      // Hazard stripes on electromagnet head
      ctx.strokeStyle = "#ea580c";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(580, 65);
      ctx.lineTo(700, 65);
      ctx.stroke();

      // Magnetic Coils spool cylinder
      ctx.fillStyle = isMagnPulling ? "#0284c7" : "#475569";
      ctx.fillRect(600, 15, 80, 30);
      
      // Ring boundaries representing spool copper wires
      ctx.strokeStyle = isMagnPulling ? "#38bdf8" : "#94a3b8";
      ctx.lineWidth = 2.5;
      for (let rx = 610; rx <= 670; rx += 12) {
        ctx.beginPath();
        ctx.moveTo(rx, 15);
        ctx.lineTo(rx, 45);
        ctx.stroke();
      }

      // Copper tip node magnets
      ctx.fillStyle = isMagnPulling ? "#0ea5e9" : "#64748b";
      ctx.beginPath();
      ctx.arc(640, 58, 14, 0, Math.PI * 2);
      ctx.fill();

      if (isMagnPulling) {
        // Render electric discharge halos emitting from terminal tip
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(640, 58, 22 + Math.sin(Date.now() * 0.045) * 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      // K. RESTORE DISPLACEMENT LAYER
      ctx.restore();

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [score, musicMuted, gameStarted]);

  return (
    <div className="w-full min-h-screen bg-[#020617] flex flex-col items-center justify-center p-2 sm:p-4 font-sans select-none overflow-hidden relative">
      {/* BACKGROUND INDUSTRIAL GRID EFFECTS */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.15)_0%,rgba(2,6,23,0.85)_100%)] pointer-events-none" />



      {/* TOP COMPACT TITLE HEADER & VOLUME BUTTON */}
      <div id="game-controls-header" className="w-full max-w-[1240px] flex justify-between items-center mb-2 z-20 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-orange-500 rounded-lg flex items-center justify-center bg-slate-900 shadow-[0_0_15px_rgba(249,115,22,0.15)] animate-pulse shrink-0">
            <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-sm sm:text-lg md:text-xl font-extrabold tracking-tight text-slate-100 font-sans uppercase leading-none">
              MAGNA-PULL <span className="text-orange-500 font-extrabold text-[10px] sm:text-xs ml-1 px-1.5 py-0.5 border border-orange-500/20 bg-orange-500/10 rounded">CORE RETRIEVAL</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            id="sound-opt-toggle"
            onClick={toggleMute}
            className="w-8 h-8 sm:w-10 sm:h-10 border border-slate-700 hover:border-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-100 cursor-pointer transition-all duration-200 shrink-0"
            title={musicMuted ? "Unmute sound synthesizers" : "Mute audio mechanics"}
          >
            {musicMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />}
          </button>
        </div>
      </div>

      {/* RENDER VIEWPORT: LETTERBOX ASPECT-RATIO PRESERVATION STRAW */}
      <div className="relative aspect-video w-full max-w-[1240px] max-h-[calc(100vh-100px)] md:max-h-[640px] shadow-[0_0_50px_rgba(0,0,0,0.85)] rounded-2xl overflow-hidden border border-slate-800 bg-[#060912] flex items-center justify-center z-10 select-none">
        
        {/* GAME PLAYING INTERACTION CANVAS */}
        <canvas 
          id="physics-canvas-board"
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="absolute w-full h-full cursor-crosshair active:scale-[0.999] transition-transform duration-75 outline-none"
          style={{ touchAction: "none" }}
        />

        {/* HUD TELEMETRY PANEL OVERLAY (Always overlay on top of canvas) */}
        {gameMode !== "TITLE" && (
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-between pointer-events-none select-none z-20 font-mono text-[9px] sm:text-xs">
            {/* Mission Telemetry Readouts */}
            <div className="flex gap-2 sm:gap-4">
              <div className="bg-slate-950/85 border border-emerald-500/30 text-emerald-400 px-2 sm:px-3.5 py-1 sm:py-2 rounded-lg sm:rounded-xl backdrop-blur-md flex items-center gap-1 sm:gap-2 shadow-lg">
                <Cpu className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                <span className="opacity-70 hidden sm:inline">TELEMETRY:</span>
                <span className="font-bold tracking-widest text-[#4ade80]">HEALTHY</span>
              </div>
              <div className="bg-slate-950/85 border border-slate-800 text-slate-300 px-2 sm:px-3.5 py-1 sm:py-2 rounded-lg sm:rounded-xl backdrop-blur-md flex items-center gap-1 sm:gap-2 shadow-lg">
                <Radio className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
                <span className="opacity-60 hidden sm:inline">FIELD NODE:</span>
                <span className="font-bold tracking-widest text-orange-400">
                  {phaseRef.current === "SLING" && "READY"}
                  {phaseRef.current === "LAUNCHED" && "PROBE"}
                  {phaseRef.current === "PULL" && (isHoldingPullRef.current ? "ACTIVE" : "HOVER")}
                </span>
              </div>
            </div>

            {/* Run Realtime Scoring stats */}
            <div className="flex gap-2 sm:gap-3">
              <div className="bg-slate-950/85 border border-slate-800 text-slate-300 px-2 sm:px-3.5 py-1 sm:py-2 rounded-lg sm:rounded-xl backdrop-blur-md flex flex-col items-center justify-center shadow-lg">
                <span className="text-[7px] sm:text-[10px] text-slate-500 font-bold uppercase leading-none mb-0.5 sm:mb-1">CORES</span>
                <span className="text-[11px] sm:text-sm font-bold text-slate-100 font-mono tracking-wider">{score}</span>
              </div>
              <div className="bg-slate-950/85 border border-slate-800 text-slate-300 px-2 sm:px-3.5 py-1 sm:py-2 rounded-lg sm:rounded-xl backdrop-blur-md flex flex-col items-center justify-center shadow-lg">
                <span className="text-[7px] sm:text-[10px] text-slate-500 font-bold uppercase leading-none mb-0.5 sm:mb-1">DEPTH</span>
                <span className="text-[11px] sm:text-sm font-bold text-[#fb923c] font-mono tracking-wider">{depth.toFixed(1)}M</span>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            SCREEN CASE 1: TITLE/START MENU OVERLAY
           ========================================== */}
        {gameMode === "TITLE" && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-2 sm:p-6 z-30 font-sans text-center transition-all max-h-full">
            {/* Visual Header Motif */}
            <div className="hidden min-[400px]:flex w-6 h-6 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 mb-1.5 sm:mb-6 shadow-[0_0_20px_rgba(249,115,22,0.15)] animate-bounce shrink-0">
              <Zap className="w-3.5 h-3.5 sm:w-8 sm:h-8 font-extrabold" />
            </div>

            <h1 className="text-xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-100 tracking-tight leading-none mb-0.5 sm:mb-2 select-none uppercase font-sans shrink-0">
              MAGNA-PULL
            </h1>
            <p className="font-mono text-[8px] sm:text-xs md:text-sm tracking-widest text-orange-400 font-medium mb-2.5 sm:mb-6 shrink-0">
              SUB-SURFACE PLASMA CORES HARVESTING OPERATION
            </p>

            {/* Instruction Layout Grid */}
            <div className="w-full max-w-[700px] grid grid-cols-3 gap-1 sm:gap-3 md:gap-4.5 mb-2.5 sm:mb-6 text-left shrink-0">
              <div className="bg-slate-900/40 border border-slate-850 p-1 sm:p-4 rounded-lg sm:rounded-2xl flex flex-col gap-0.5 sm:gap-2">
                <div className="flex items-center gap-1 sm:gap-2 mb-0.5">
                  <div className="w-3 h-3 sm:w-6 sm:h-6 rounded bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-[7px] sm:text-xs shrink-0">1</div>
                  <h3 className="font-bold text-slate-200 uppercase tracking-divider text-[7px] sm:text-xs">Sling Probe</h3>
                </div>
                <p className="text-slate-400 leading-tight sm:leading-relaxed text-[7px] sm:text-[11px] md:text-xs">
                  Drag back & release to launch magnetic probe deep.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-850 p-1 sm:p-4 rounded-lg sm:rounded-2xl flex flex-col gap-0.5 sm:gap-2">
                <div className="flex items-center gap-1 sm:gap-2 mb-0.5">
                  <div className="w-3 h-3 sm:w-6 sm:h-6 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[7px] sm:text-xs shrink-0">2</div>
                  <h3 className="font-bold text-slate-200 uppercase tracking-divider text-[7px] sm:text-xs">Latch</h3>
                </div>
                <p className="text-slate-400 leading-tight sm:leading-relaxed text-[7px] sm:text-[11px] md:text-xs">
                  Automatic connection on core contact.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-850 p-1 sm:p-4 rounded-lg sm:rounded-2xl flex flex-col gap-0.5 sm:gap-2">
                <div className="flex items-center gap-1 sm:gap-2 mb-0.5">
                  <div className="w-3 h-3 sm:w-6 sm:h-6 rounded bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-[7px] sm:text-xs shrink-0">3</div>
                  <h3 className="font-bold text-slate-200 uppercase tracking-divider text-[7px] sm:text-xs">The Pull</h3>
                </div>
                <p className="text-slate-400 leading-tight sm:leading-relaxed text-[7px] sm:text-[11px] md:text-xs">
                  Hold press anywhere to pull core upward.
                </p>
              </div>
            </div>

            {/* Launch controls CTA */}
            <div className="flex flex-col items-center mb-1.5 sm:mb-4 shrink-0">
              <button 
                id="btn-engage-operation"
                onClick={startGame}
                className="group px-4 sm:px-8 py-1.5 sm:py-3.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-extrabold text-[10px] sm:text-sm uppercase tracking-wider rounded-lg sm:rounded-xl cursor-pointer flex items-center gap-1.5 shadow-[0_4px_20px_rgba(249,115,22,0.3)] hover:shadow-[0_4px_35px_rgba(249,115,22,0.5)] transition-all hover:scale-[1.03]"
              >
                INITIATE EXTRACTION
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>

            {/* Secondary High Score reading */}
            {highScore > 0 && (
              <div className="mt-1.5 sm:mt-4 flex gap-4 text-[7px] sm:text-xs text-slate-500 font-mono pb-1 shrink-0">
                <span>RECORD CORES CHRONICLED: <strong className="text-slate-300">{highScore}</strong></span>
                <span>DEEPEST RECORD: <strong className="text-slate-300">{highDepth.toFixed(1)}M</strong></span>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            SCREEN CASE 2: CONVULSIVE GAMEOVER CARD
           ========================================== */}
        {gameMode === "GAMEOVER" && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-3 sm:p-6 z-30 text-center animate-fade-in font-sans max-h-full">
            <div className="hidden min-[400px]:flex w-6 h-6 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-1.5 sm:mb-5 shadow-[0_0_20px_rgba(239,68,68,0.15)] shrink-0">
              <ShieldAlert className="w-3.5 h-3.5 sm:w-8 sm:h-8" />
            </div>

            <h2 className="text-base sm:text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight leading-none mb-0.5 select-none uppercase shrink-0">
              CONNECTION FLUID LOST
            </h2>
            <p className="font-mono text-[7px] sm:text-xs text-red-400 tracking-widest uppercase mb-2 sm:mb-8 shrink-0">
              Operations Cancelled — Core Integrity Compromised
            </p>

            {/* Scoreboard display */}
            <div className="bg-slate-900 border border-slate-800 p-2 sm:p-6 rounded-lg sm:rounded-2xl w-full max-w-[380px] mb-2.5 sm:mb-8 font-sans grid grid-cols-2 gap-2 sm:gap-4 shrink-0">
              <div className="flex flex-col items-center justify-center border-r border-slate-800 py-0.5 sm:py-1.5">
                <span className="text-[7px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Cores Harvested</span>
                <span className="text-base sm:text-4xl font-extrabold text-[#4ade80] font-mono leading-none tracking-tight">{score}</span>
                {score >= highScore && score > 0 && (
                  <span className="text-[6px] sm:text-[9px] text-emerald-400 font-mono font-bold uppercase mt-1 flex items-center gap-0.5 animate-pulse">
                    <Award className="w-1.5 sm:w-2.5 h-1.5 sm:h-2.5" /> NEW BEST!
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center justify-center py-0.5 sm:py-1.5">
                <span className="text-[7px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Total Depth</span>
                <span className="text-base sm:text-4xl font-extrabold text-orange-400 font-mono leading-none tracking-tight">{depth.toFixed(1)}M</span>
                {depth >= highDepth && depth > 0 && (
                  <span className="text-[6px] sm:text-[9px] text-[#fb923c] font-mono font-bold uppercase mt-1 flex items-center gap-0.5 animate-pulse">
                    <Sparkles className="w-1.5 sm:w-2.5 h-1.5 sm:h-2.5" /> DEEPEST LOG!
                  </span>
                )}
              </div>
            </div>

            {/* Action panel */}
            <div className="flex flex-col gap-1.5 sm:gap-4 items-center shrink-0">
              <button 
                id="btn-reengage-magnet"
                onClick={startGame}
                className="group px-4 sm:px-7 py-1.5 sm:py-3.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-extrabold tracking-wider text-[10px] sm:text-sm uppercase rounded-lg cursor-pointer flex items-center gap-1.5 shadow-[0_4px_20px_rgba(249,115,22,0.2)] hover:shadow-[0_4px_30px_rgba(249,115,22,0.4)] transition-all hover:scale-[1.03]"
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-[-45deg] transition-transform font-extrabold" />
                RE-ENGAGE MAGNETS
              </button>
              
              <button 
                onClick={() => setGameMode("TITLE")}
                className="px-3 py-1 hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-[8px] sm:text-xs font-mono uppercase rounded-lg transition-all cursor-pointer"
              >
                RETURN TO PRE-ENGAGEMENT TERMINAL
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE HUD SYSTEM OPERATIONAL STATUS TAPE */}
        {gameMode === "PLAYING" && phaseRef.current === "SLING" && (
          <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[80px] sm:translate-y-[100px] pointer-events-none select-none z-10 text-center flex flex-col items-center">
            <span className="text-[8px] sm:text-[10px] font-mono text-orange-500/25 tracking-[0.35em] uppercase font-bold animate-pulse leading-none mb-1">MAGNET SLING UNIT READY</span>
            <span className="text-[10px] sm:text-[12px] font-sans text-slate-400/40 tracking-wider">Drag back anywhere to probe shaft</span>
          </div>
        )}
      </div>

      {/* FOOTER USER GUIDELINE BRANDING */}
      <div id="game-controls-helpbar" className="w-full max-w-[1240px] flex flex-col md:flex-row md:justify-between items-center text-slate-500 text-[9px] sm:text-[11px] font-mono mt-2 sm:mt-3 select-none pointer-events-none opacity-45">
        <span>MAGNA-PULL INDUSTRIAL RETRIEVAL PLATFORM v4.0.0</span>
        <div className="flex gap-4 mt-1 md:mt-0">
          <span>COILS STATUS: OK</span>
          <span>MAGNET LEVEL: DEEPWELL CORE EXTRACTOR</span>
          <span>SYSTEM OPERATIONAL</span>
        </div>
      </div>
    </div>
  );
}
