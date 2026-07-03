import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { sfx, startMusic, stopMusic, setMuted, isMuted } from "../lib/game-audio";
import { CHARACTERS, CHARACTER_MAP, type CharacterId } from "../lib/characters";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Flappy Avengers" },
      { name: "description", content: "Flappy Avengers — pick your hero and fly through the pipes." },
      { property: "og:title", content: "Flappy Avengers" },
      { property: "og:description", content: "Pick your Avenger and fly." },
    ],
  }),
});

const WIDTH = 400;
const HEIGHT = 600;
const PIPE_WIDTH = 60;

type Difficulty = "easy" | "medium" | "hard";
type Settings = {
  gravity: number;
  jump: number;
  pipeGap: number;
  pipeSpeed: number;
  pipeInterval: number;
};
const DIFFICULTY: Record<Difficulty, Settings> = {
  easy:   { gravity: 0.18, jump: -4.8, pipeGap: 240, pipeSpeed: 1.2, pipeInterval: 180 },
  medium: { gravity: 0.28, jump: -6.0, pipeGap: 180, pipeSpeed: 1.8, pipeInterval: 130 },
  hard:   { gravity: 0.42, jump: -7.2, pipeGap: 140, pipeSpeed: 2.6, pipeInterval: 95 },
};

type Pipe = { x: number; gapY: number; passed: boolean };

function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [state, setState] = useState<"ready" | "playing" | "over">("ready");
  const [muted, setMutedState] = useState(false);
  const [dark, setDark] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [character, setCharacter] = useState<CharacterId>("iron-man");
  const darkRef = useRef(false);
  darkRef.current = dark;
  const settingsRef = useRef<Settings>(DIFFICULTY.easy);
  settingsRef.current = DIFFICULTY[difficulty];
  const characterRef = useRef<CharacterId>("iron-man");
  characterRef.current = character;

  const stateRef = useRef(state);
  stateRef.current = state;

  const gameRef = useRef({
    birdY: HEIGHT / 2,
    birdV: 0,
    pipes: [] as Pipe[],
    frame: 0,
    score: 0,
    flapAnim: 0,
    flapBoost: 0,
  });

  const reset = useCallback(() => {
    gameRef.current = {
      birdY: HEIGHT / 2,
      birdV: 0,
      pipes: [],
      frame: 0,
      score: 0,
      flapAnim: 0,
      flapBoost: 0,
    };
    setScore(0);
  }, []);

  const doFlap = () => {
    gameRef.current.birdV = settingsRef.current.jump;
    gameRef.current.flapBoost = 14; // ~14 frames of fast flapping
    sfx.flap();
  };

  const flap = useCallback(() => {
    if (stateRef.current === "ready") {
      reset();
      setState("playing");
      startMusic();
      doFlap();
    } else if (stateRef.current === "playing") {
      doFlap();
    }
  }, [reset]);

  const playAgain = useCallback(() => {
    reset();
    setState("playing");
    startMusic();
    doFlap();
  }, [reset]);

  const toggleMute = useCallback(() => {
    const next = !isMuted();
    setMuted(next);
    setMutedState(next);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("flippa-best");
    if (saved) setBest(parseInt(saved, 10) || 0);
    const savedDark = window.localStorage.getItem("flippa-dark");
    if (savedDark === "1") setDark(true);
    const savedDiff = window.localStorage.getItem("flippa-difficulty") as Difficulty | null;
    if (savedDiff === "easy" || savedDiff === "medium" || savedDiff === "hard") {
      setDifficulty(savedDiff);
    }
    const savedChar = window.localStorage.getItem("flippa-character") as CharacterId | null;
    if (savedChar && CHARACTER_MAP[savedChar]) setCharacter(savedChar);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("flippa-dark", dark ? "1" : "0");
    } catch {}
  }, [dark]);

  useEffect(() => {
    try {
      window.localStorage.setItem("flippa-difficulty", difficulty);
    } catch {}
  }, [difficulty]);

  useEffect(() => {
    try {
      window.localStorage.setItem("flippa-character", character);
    } catch {}
  }, [character]);

  const toggleDark = useCallback(() => setDark((d) => !d), []);

  const changeDifficulty = useCallback(
    (d: Difficulty) => {
      if (stateRef.current === "playing") return;
      setDifficulty(d);
    },
    [],
  );

  const changeCharacter = useCallback(
    (id: CharacterId) => {
      if (stateRef.current === "playing") return;
      setCharacter(id);
    },
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (stateRef.current === "over") playAgain();
        else flap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flap, playAgain]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;

    const loop = () => {
      const g = gameRef.current;
      const playing = stateRef.current === "playing";

      // Advance wing animation: fast while boosting after a flap, slower during glide.
      const flapSpeed = g.flapBoost > 0 ? 0.55 : 0.18;
      g.flapAnim += flapSpeed;
      if (g.flapBoost > 0) g.flapBoost--;


      if (playing) {
        g.frame++;
        g.birdV += settingsRef.current.gravity;
        g.birdY += g.birdV;

        if (g.frame % settingsRef.current.pipeInterval === 0) {
          const gapY = 80 + Math.random() * (HEIGHT - 160 - settingsRef.current.pipeGap);
          g.pipes.push({ x: WIDTH, gapY, passed: false });
        }

        for (const p of g.pipes) p.x -= settingsRef.current.pipeSpeed;
        g.pipes = g.pipes.filter((p) => p.x + PIPE_WIDTH > 0);

        const bx = 80;
        const br = 14;
        for (const p of g.pipes) {
          if (!p.passed && p.x + PIPE_WIDTH < bx - br) {
            p.passed = true;
            g.score++;
            setScore(g.score);
            sfx.score();
          }
          const inX = bx + br > p.x && bx - br < p.x + PIPE_WIDTH;
          const outY = g.birdY - br < p.gapY || g.birdY + br > p.gapY + settingsRef.current.pipeGap;
          if (inX && outY) {
            endGame();
          }
        }
        if (g.birdY + br > HEIGHT - 40 || g.birdY - br < 0) {
          endGame();
        }
      }

      // Draw
      const isDark = darkRef.current;
      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      if (isDark) {
        skyGrad.addColorStop(0, "#0b1026");
        skyGrad.addColorStop(1, "#1c2340");
      } else {
        skyGrad.addColorStop(0, "#70c5ce");
        skyGrad.addColorStop(1, "#b5e0e5");
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Stars in dark mode
      if (isDark) {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        for (let i = 0; i < 40; i++) {
          const sx = (i * 97) % WIDTH;
          const sy = (i * 53) % (HEIGHT - 80);
          ctx.fillRect(sx, sy, 2, 2);
        }
      }

      // Pipes
      const pipeMain = isDark ? "#2d6a4f" : "#5cb85c";
      const pipeDark = isDark ? "#1b4332" : "#3d8b3d";
      ctx.fillStyle = pipeMain;
      for (const p of g.pipes) {
        ctx.fillRect(p.x, 0, PIPE_WIDTH, p.gapY);
        ctx.fillRect(p.x, p.gapY + settingsRef.current.pipeGap, PIPE_WIDTH, HEIGHT - (p.gapY + settingsRef.current.pipeGap) - 40);
        ctx.fillStyle = pipeDark;
        ctx.fillRect(p.x - 3, p.gapY - 16, PIPE_WIDTH + 6, 16);
        ctx.fillRect(p.x - 3, p.gapY + settingsRef.current.pipeGap, PIPE_WIDTH + 6, 16);
        ctx.fillStyle = pipeMain;
      }

      // Ground
      ctx.fillStyle = isDark ? "#2a2140" : "#ded895";
      ctx.fillRect(0, HEIGHT - 40, WIDTH, 40);
      ctx.fillStyle = isDark ? "#3d3358" : "#c9c176";
      ctx.fillRect(0, HEIGHT - 40, WIDTH, 6);

      // Bird — delegated to selected character skin
      const bx = 80;
      ctx.save();
      ctx.translate(bx, g.birdY);
      const angle = Math.max(-0.5, Math.min(1.2, g.birdV / 10));
      ctx.rotate(angle);
      CHARACTER_MAP[characterRef.current].draw(ctx, {
        frame: g.frame,
        flapAnim: g.flapAnim,
        isDark: darkRef.current,
      });
      ctx.restore();

      // Score
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      ctx.font = "bold 40px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.strokeText(String(g.score), WIDTH / 2, 60);
      ctx.fillText(String(g.score), WIDTH / 2, 60);

      if (stateRef.current === "ready") {
        ctx.fillStyle = "rgba(2,6,23,0.72)";
        ctx.fillRect(0, HEIGHT / 2 - 70, WIDTH, 140);
        ctx.fillStyle = "#dc2626";
        ctx.fillRect(WIDTH / 2 - 60, HEIGHT / 2 - 70, 120, 3);
        ctx.fillStyle = "#fff";
        ctx.font = "900 italic 30px Inter, system-ui, sans-serif";
        ctx.fillText("FLAPPY AVENGERS", WIDTH / 2, HEIGHT / 2 - 10);
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = "600 11px Inter, system-ui, sans-serif";
        const readyMsg = "TAP OR PRESS SPACE TO START";
        ctx.fillText(readyMsg, WIDTH / 2, HEIGHT / 2 + 20);
      } else if (stateRef.current === "over") {
        ctx.fillStyle = "rgba(2,6,23,0.78)";
        ctx.fillRect(0, HEIGHT / 2 - 100, WIDTH, 170);
        ctx.fillStyle = "#dc2626";
        ctx.fillRect(WIDTH / 2 - 70, HEIGHT / 2 - 100, 140, 3);
        ctx.fillStyle = "#fff";
        ctx.font = "900 italic 34px Inter, system-ui, sans-serif";
        ctx.fillText("MISSION FAILED", WIDTH / 2, HEIGHT / 2 - 50);
        ctx.font = "700 14px Inter, system-ui, sans-serif";
        ctx.fillStyle = "#fbbf24";
        ctx.fillText(`SCORE  ${g.score}`, WIDTH / 2, HEIGHT / 2 - 18);
        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.fillText(`BEST  ${best}`, WIDTH / 2, HEIGHT / 2 + 4);
      }

      raf = requestAnimationFrame(loop);
    };

    const endGame = () => {
      if (stateRef.current !== "playing") return;
      setState("over");
      stopMusic();
      sfx.hit();
      const g = gameRef.current;
      if (g.score > best) {
        setBest(g.score);
        try {
          window.localStorage.setItem("flippa-best", String(g.score));
        } catch {}
      }
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [best]);

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center gap-6 p-4 sm:p-8 bg-slate-950 text-slate-100 overflow-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Ambient background: radial glow + subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 10%, rgba(220,38,38,0.18), transparent 70%), radial-gradient(50% 40% at 50% 100%, rgba(37,99,235,0.15), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />

      <div className="relative w-full max-w-[420px] flex flex-col items-center gap-5 animate-fade-in">
        {/* Title */}
        <h1 className="whitespace-nowrap text-3xl sm:text-4xl font-black tracking-tighter uppercase italic text-white text-center leading-none">
          <span className="text-red-600">Flappy</span>{" "}
          <span className="border-b-4 border-red-600 pb-1">Avengers</span>
        </h1>
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-red-600/60 to-transparent -mt-3" />


        {/* HUD row: score/best + icon toggles */}
        <div className="w-full flex justify-between items-center bg-slate-900/80 border-y border-slate-700 px-4 py-3 backdrop-blur-sm">
          <div className="flex gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Score</span>
              <span className="text-xl font-bold text-white leading-none tabular-nums">
                {String(score).padStart(3, "0")}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Best</span>
              <span className="text-xl font-bold text-amber-400 leading-none tabular-nums">
                {String(best).padStart(3, "0")}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
              className={`p-2 rounded transition-colors border border-slate-700 ${
                muted
                  ? "bg-slate-800 text-slate-500 hover:bg-slate-700"
                  : "bg-slate-800 text-red-500 hover:bg-slate-700"
              }`}
            >
              {muted ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12A4.5 4.5 0 0014 8.03v2.21l2.45 2.45c.03-.22.05-.45.05-.69zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4l-2.09 2.09L12 8.18V4z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.03v7.94A4.5 4.5 0 0016.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              )}
            </button>
            <button
              onClick={toggleDark}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              {dark ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Game canvas shell with red/blue glow + corner brackets */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-b from-red-600 to-blue-700 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-700 pointer-events-none" />
          {/* Corner brackets */}
          <span aria-hidden className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-red-600 z-10" />
          <span aria-hidden className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-red-600 z-10" />
          <span aria-hidden className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-red-600 z-10" />
          <span aria-hidden className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-red-600 z-10" />

          <div className="relative bg-slate-900 rounded-lg border-4 border-slate-800 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={WIDTH}
              height={HEIGHT}
              onClick={() => {
                if (state !== "over") flap();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                if (state !== "over") flap();
              }}
              className="cursor-pointer touch-none max-w-full h-auto block"
              style={{ aspectRatio: `${WIDTH}/${HEIGHT}`, width: WIDTH, maxWidth: "100%" }}
            />
            {/* Scanline overlay */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 3px)",
              }}
            />
            {state === "over" && (
              <div className="absolute inset-x-0 flex justify-center animate-fade-in" style={{ bottom: "22%" }}>
                <button
                  onClick={playAgain}
                  className="rounded-full bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-[0.2em] text-xs px-6 py-3 shadow-lg shadow-red-600/50 transition transform hover:scale-105"
                >
                  ▶ Retry Mission
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="w-full flex flex-col items-center gap-5">
          {/* Difficulty pill */}
          <div
            className="inline-flex p-1 bg-slate-900 rounded-full border border-slate-800"
            role="radiogroup"
            aria-label="Difficulty"
          >
            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                role="radio"
                aria-checked={difficulty === d}
                disabled={state === "playing"}
                onClick={() => changeDifficulty(d)}
                className={`px-4 py-1 text-xs font-bold uppercase tracking-wider rounded-full transition-colors ${
                  difficulty === d
                    ? "bg-red-600 text-white shadow-sm shadow-red-600/40"
                    : "text-slate-400 hover:text-white disabled:opacity-40"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Character roster */}
          <div className="w-full flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.25em]">
              Hero · <span className="text-red-500">{CHARACTER_MAP[character].name}</span>
            </span>
            <div
              role="radiogroup"
              aria-label="Character"
              className="flex gap-2 overflow-x-auto py-2 px-1 w-full justify-start sm:justify-center scrollbar-none"
            >
              {CHARACTERS.map((c) => (
                <CharacterChip
                  key={c.id}
                  id={c.id}
                  selected={character === c.id}
                  disabled={state === "playing"}
                  onSelect={() => changeCharacter(c.id)}
                />
              ))}
            </div>
          </div>

          <p className="text-center text-slate-500 text-[10px] uppercase font-bold tracking-[0.25em]">
            Tap or Space to Fly · Avoid the Pipes
          </p>
        </div>
      </div>
    </main>
  );
}

function CharacterChip({
  id,
  selected,
  disabled,
  onSelect,
}: {
  id: CharacterId;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const character = CHARACTER_MAP[id];

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = 48;
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = selected ? "rgba(239,68,68,0.18)" : "rgba(30,41,59,0.9)";
    ctx.fillRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.scale(1.25, 1.25);
    character.draw(ctx, { frame: 0, flapAnim: 0, isDark: true });
    ctx.restore();
  }, [id, selected, character]);

  return (
    <button
      role="radio"
      aria-checked={selected}
      aria-label={character.name}
      title={character.name}
      disabled={disabled}
      onClick={onSelect}
      className={`shrink-0 rounded-lg overflow-hidden transition-all disabled:cursor-not-allowed ${
        selected
          ? "border-2 border-red-600 shadow-lg shadow-red-600/30 ring-2 ring-red-600 ring-offset-2 ring-offset-slate-950 scale-110"
          : "border border-slate-700 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:border-slate-500 disabled:opacity-30"
      }`}
    >
      <canvas ref={ref} width={48} height={48} className="block" />
    </button>
  );
}
