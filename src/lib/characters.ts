// Avengers character skins. Each `draw` is called with the canvas context already
// translated to the bird's center and rotated to its dive angle. All characters
// share the same 14px hitbox — visuals only.

export type CharacterId =
  | "iron-man"
  | "captain-america"
  | "thor"
  | "hulk"
  | "black-widow"
  | "hawkeye"
  | "spider-man"
  | "black-panther";

export type DrawCtx = {
  frame: number;
  flapAnim: number;
  isDark: boolean;
};

export type Character = {
  id: CharacterId;
  name: string;
  draw: (ctx: CanvasRenderingContext2D, s: DrawCtx) => void;
};

// Shared wing helper: two colors (main + trailing edge).
function drawWing(
  ctx: CanvasRenderingContext2D,
  flapAnim: number,
  main: string,
  edge?: string,
) {
  const phase = Math.sin(flapAnim);
  const wingY = -4 + phase * 6;
  const wingLen = 10 + Math.abs(phase) * 4;
  const wingRot = phase * 0.9;
  ctx.save();
  ctx.translate(-2, wingY);
  ctx.rotate(wingRot);
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.ellipse(-2, 2, wingLen, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  if (edge) {
    ctx.fillStyle = edge;
    ctx.beginPath();
    ctx.ellipse(-2 - wingLen * 0.4, 3, wingLen * 0.5, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBody(ctx: CanvasRenderingContext2D, color: string, highlight?: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();
  if (highlight) {
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.arc(-3, -4, 9, 0, Math.PI * 2);
    ctx.fill();
  }
}

const ironMan: Character = {
  id: "iron-man",
  name: "Iron Man",
  draw: (ctx, { frame, flapAnim, isDark }) => {
    drawBody(ctx, "#b3181c", "#d92329");
    drawWing(ctx, flapAnim, "#8a1114", "#e6b422");

    // Gold faceplate
    ctx.fillStyle = "#e6b422";
    ctx.beginPath();
    ctx.moveTo(-2, -12);
    ctx.lineTo(13, -9);
    ctx.lineTo(15, -2);
    ctx.lineTo(18, 3);
    ctx.lineTo(11, 6);
    ctx.lineTo(4, 9);
    ctx.lineTo(-4, 6);
    ctx.lineTo(-4, -8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#a67d10";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-2, -3);
    ctx.lineTo(15, -1);
    ctx.stroke();

    // Eye slits
    ctx.save();
    ctx.shadowColor = "#8ff0ff";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#c9f7ff";
    ctx.save();
    ctx.translate(6, -4);
    ctx.rotate(-0.15);
    ctx.fillRect(-4, -1, 8, 2);
    ctx.restore();
    ctx.save();
    ctx.translate(13, -3);
    ctx.rotate(-0.15);
    ctx.fillRect(-3, -1, 6, 2);
    ctx.restore();
    ctx.restore();

    // Arc reactor
    const pulse = 0.85 + Math.sin(frame * 0.18) * 0.15;
    ctx.save();
    ctx.translate(-6, 4);
    ctx.shadowColor = "#8ff0ff";
    ctx.shadowBlur = isDark ? 14 : 10;
    ctx.fillStyle = "#5ac8dc";
    ctx.beginPath();
    ctx.arc(0, 0, 4.2 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, 1.8 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};

const captainAmerica: Character = {
  id: "captain-america",
  name: "Captain America",
  draw: (ctx, { flapAnim }) => {
    drawBody(ctx, "#1a3a7a", "#254da3");
    drawWing(ctx, flapAnim, "#c81c22", "#ffffff");

    // Helmet — top half blue with wing detail
    ctx.fillStyle = "#254da3";
    ctx.beginPath();
    ctx.arc(0, -3, 12, Math.PI * 1.05, Math.PI * 1.95);
    ctx.closePath();
    ctx.fill();

    // Little "A" wing on side of head
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(11, -6);
    ctx.lineTo(16, -8);
    ctx.lineTo(12, -3);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(5, -3, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(11, -2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(6, -3, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(11.5, -2, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // White star on chest
    ctx.fillStyle = "#ffffff";
    drawStar(ctx, -4, 5, 5, 3.6, 1.6);

    // Red stripe below
    ctx.fillStyle = "#c81c22";
    ctx.fillRect(-10, 8, 18, 2);
  },
};

const thor: Character = {
  id: "thor",
  name: "Thor",
  draw: (ctx, { flapAnim }) => {
    // Cape trailing behind (drawn before body)
    const phase = Math.sin(flapAnim * 0.7);
    ctx.fillStyle = "#a01820";
    ctx.beginPath();
    ctx.moveTo(-8, -6);
    ctx.quadraticCurveTo(-22 + phase * 2, 0, -18 + phase * 3, 10);
    ctx.quadraticCurveTo(-10, 8, -6, 8);
    ctx.closePath();
    ctx.fill();

    drawBody(ctx, "#8a8f99", "#b3b8c2");
    drawWing(ctx, flapAnim, "#5c6068", "#c9a648");

    // Chest plate lines
    ctx.strokeStyle = "#3a3d44";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-6, -2);
    ctx.lineTo(6, -2);
    ctx.moveTo(-6, 2);
    ctx.lineTo(6, 2);
    ctx.stroke();

    // Gold discs (chest armor dots)
    ctx.fillStyle = "#e6b422";
    ctx.beginPath();
    ctx.arc(-5, 0, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5, 0, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Hair — blond swoop
    ctx.fillStyle = "#f4d97a";
    ctx.beginPath();
    ctx.ellipse(-6, -8, 7, 5, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#0c1a3d";
    ctx.beginPath();
    ctx.arc(4, -5, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(10, -4, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Beard hint
    ctx.strokeStyle = "#b8933d";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(2, 4);
    ctx.lineTo(10, 4);
    ctx.stroke();
  },
};

const hulk: Character = {
  id: "hulk",
  name: "Hulk",
  draw: (ctx, { flapAnim }) => {
    drawBody(ctx, "#3c8f2b", "#5cb840");
    drawWing(ctx, flapAnim, "#2a6b1e", "#6b3ea0");

    // Angry brow
    ctx.strokeStyle = "#1f4a15";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(2, -6);
    ctx.lineTo(9, -3);
    ctx.moveTo(11, -3);
    ctx.lineTo(15, -5);
    ctx.stroke();

    // Eyes (small, angry)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(6, -2, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(12, -1, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(6.5, -2, 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(12.3, -1, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Torn purple stripe (shorts)
    ctx.fillStyle = "#6b3ea0";
    ctx.beginPath();
    ctx.moveTo(-10, 6);
    ctx.lineTo(-6, 4);
    ctx.lineTo(-2, 7);
    ctx.lineTo(3, 5);
    ctx.lineTo(8, 8);
    ctx.lineTo(11, 6);
    ctx.lineTo(11, 11);
    ctx.lineTo(-10, 11);
    ctx.closePath();
    ctx.fill();

    // Muscle shading
    ctx.strokeStyle = "#1f4a15";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(-2, 5);
    ctx.stroke();
  },
};

const blackWidow: Character = {
  id: "black-widow",
  name: "Black Widow",
  draw: (ctx, { flapAnim }) => {
    drawBody(ctx, "#1a1a1e", "#2c2c33");
    drawWing(ctx, flapAnim, "#0d0d10", "#c81c22");

    // Red hair sweep
    ctx.fillStyle = "#b8321a";
    ctx.beginPath();
    ctx.ellipse(-6, -6, 8, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // hair strand across face
    ctx.beginPath();
    ctx.moveTo(-2, -8);
    ctx.quadraticCurveTo(6, -10, 12, -6);
    ctx.quadraticCurveTo(6, -6, -2, -4);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(6, -2, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(12, -1, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(6.5, -2, 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(12.3, -1, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Red hourglass on chest
    ctx.fillStyle = "#c81c22";
    ctx.beginPath();
    ctx.moveTo(-6, 3);
    ctx.lineTo(0, 3);
    ctx.lineTo(-3, 6);
    ctx.lineTo(0, 9);
    ctx.lineTo(-6, 9);
    ctx.lineTo(-3, 6);
    ctx.closePath();
    ctx.fill();

    // Belt buckle
    ctx.fillStyle = "#3a3a44";
    ctx.fillRect(3, 6, 6, 2);
  },
};

const hawkeye: Character = {
  id: "hawkeye",
  name: "Hawkeye",
  draw: (ctx, { flapAnim }) => {
    drawBody(ctx, "#3a1a4a", "#5a2d70");
    drawWing(ctx, flapAnim, "#1a0f26", "#8a4dc2");

    // Dark mask across eyes
    ctx.fillStyle = "#0d0510";
    ctx.beginPath();
    ctx.moveTo(-2, -6);
    ctx.lineTo(15, -6);
    ctx.lineTo(15, -1);
    ctx.lineTo(-2, -1);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#f7d51d";
    ctx.beginPath();
    ctx.arc(6, -4, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(12, -3, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Quiver over shoulder — arrows sticking up
    ctx.strokeStyle = "#3a2a1a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-8, -6);
    ctx.lineTo(-10, -14);
    ctx.moveTo(-6, -6);
    ctx.lineTo(-7, -14);
    ctx.stroke();
    // Fletching
    ctx.fillStyle = "#c81c22";
    ctx.beginPath();
    ctx.arc(-10, -14, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-7, -14, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Chest arrow emblem
    ctx.strokeStyle = "#8a4dc2";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-4, 5);
    ctx.lineTo(6, 5);
    ctx.lineTo(4, 3);
    ctx.moveTo(6, 5);
    ctx.lineTo(4, 7);
    ctx.stroke();
  },
};

const spiderMan: Character = {
  id: "spider-man",
  name: "Spider-Man",
  draw: (ctx, { flapAnim }) => {
    drawBody(ctx, "#c81c22", "#e63239");
    drawWing(ctx, flapAnim, "#1a3a7a", "#c81c22");

    // Blue lower half
    ctx.fillStyle = "#1a3a7a";
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0.15, Math.PI - 0.15);
    ctx.closePath();
    ctx.fill();

    // Web crosshatch on face
    ctx.strokeStyle = "#5a0d10";
    ctx.lineWidth = 0.6;
    for (let i = -12; i <= 12; i += 3) {
      ctx.beginPath();
      ctx.moveTo(i, -12);
      ctx.lineTo(i, 0);
      ctx.stroke();
    }
    for (let j = -12; j <= 0; j += 3) {
      ctx.beginPath();
      ctx.ellipse(0, j, 12, 3, 0, Math.PI, 0, true);
      ctx.stroke();
    }

    // Big white eyes with black outline
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(4, -4, 4, 3, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(12, -3, 4, 3, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(4, -4, 3.2, 2.3, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(12, -3, 3.2, 2.3, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Chest spider
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(-3, 6, 2.2, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 0.6;
    for (let a = 0; a < 6; a++) {
      const ang = (a / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(-3, 6);
      ctx.lineTo(-3 + Math.cos(ang) * 4, 6 + Math.sin(ang) * 2.5);
      ctx.stroke();
    }
  },
};

const blackPanther: Character = {
  id: "black-panther",
  name: "Black Panther",
  draw: (ctx, { frame, flapAnim, isDark }) => {
    drawBody(ctx, "#0a0a0f", "#1a1a24");
    drawWing(ctx, flapAnim, "#050508", "#c0c4cc");

    // Silver necklace ring with glow
    const pulse = 0.85 + Math.sin(frame * 0.12) * 0.15;
    ctx.save();
    ctx.shadowColor = "#a0d8ff";
    ctx.shadowBlur = isDark ? 12 : 8;
    ctx.strokeStyle = "#c8d4dc";
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const r = 8;
      const x = Math.cos(a) * r;
      const y = 3 + Math.sin(a) * 3.5;
      ctx.beginPath();
      ctx.arc(x, y, 1.2 * pulse, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Panther ears
    ctx.fillStyle = "#0a0a0f";
    ctx.beginPath();
    ctx.moveTo(-4, -12);
    ctx.lineTo(-2, -16);
    ctx.lineTo(0, -12);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(8, -13);
    ctx.lineTo(10, -17);
    ctx.lineTo(12, -13);
    ctx.closePath();
    ctx.fill();

    // Glowing silver eyes
    ctx.save();
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 6;
    ctx.fillStyle = "#e8f4ff";
    ctx.beginPath();
    ctx.ellipse(5, -4, 2.2, 1.4, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(12, -3, 2.2, 1.4, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outer: number,
  inner: number,
) {
  let rot = -Math.PI / 2;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outer);
  for (let i = 0; i < spikes; i++) {
    let x = cx + Math.cos(rot) * outer;
    let y = cy + Math.sin(rot) * outer;
    ctx.lineTo(x, y);
    rot += step;
    x = cx + Math.cos(rot) * inner;
    y = cy + Math.sin(rot) * inner;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outer);
  ctx.closePath();
  ctx.fill();
}

export const CHARACTERS: Character[] = [
  ironMan,
  captainAmerica,
  thor,
  hulk,
  blackWidow,
  hawkeye,
  spiderMan,
  blackPanther,
];

export const CHARACTER_MAP: Record<CharacterId, Character> = Object.fromEntries(
  CHARACTERS.map((c) => [c.id, c]),
) as Record<CharacterId, Character>;
