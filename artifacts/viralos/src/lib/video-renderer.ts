export interface VideoScript {
  title: string;
  hook: string;
  body: string;
  cta: string;
}

const DURATION_SEC = 10;
const FPS = 30;
const TOTAL_FRAMES = FPS * DURATION_SEC;
const W = 540;
const H = 960;

function easeOut(t: number) {
  return 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
      if (lines.length >= 6) break;
    } else {
      line = test;
    }
  }
  if (line && lines.length < 6) lines.push(line);
  return lines;
}

function drawBackground(ctx: CanvasRenderingContext2D, sec: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#06090f");
  bg.addColorStop(0.5, "#0a0d1c");
  bg.addColorStop(1, "#040608");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle noise overlay via particles
  ctx.globalAlpha = 0.55;
  for (let i = 0; i < 18; i++) {
    const seed = i * 137.508;
    const px = (Math.sin(seed) * 0.5 + 0.5) * W;
    const py = ((Math.cos(seed * 0.7) * 0.5 + 0.5) * H - sec * 14 * ((i % 3) + 0.5) + H * 10) % H;
    const r = 0.5 + (i % 3) * 0.8;
    const alpha = 0.08 + Math.sin(sec * 0.4 + seed) * 0.04;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(79, 141, 255, ${alpha})`;
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Vignette
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.15, W / 2, H / 2, H * 0.8);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.72)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}

function drawHookScene(ctx: CanvasRenderingContext2D, sec: number, hook: string) {
  const t = sec / 2; // 0..1 over 2 seconds
  ctx.save();

  // Accent line
  const lineW = 56 * easeOut(t * 1.5);
  ctx.fillStyle = "#4F8DFF";
  ctx.globalAlpha = easeOut(t * 2);
  ctx.fillRect(W / 2 - lineW / 2, H / 2 - 100, lineW, 3);
  ctx.globalAlpha = 1;

  // Hook text
  ctx.font = "bold 42px system-ui, sans-serif";
  ctx.textAlign = "center";
  const lines = wrapText(ctx, hook, W - 80);
  const lineH = 56;
  const totalH = lines.length * lineH;
  const startY = H / 2 - totalH / 2 + 20;

  lines.forEach((line, i) => {
    const lineT = easeOut(Math.max(0, t * (lines.length + 1) - i));
    const dy = (1 - lineT) * 20;
    ctx.globalAlpha = lineT;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(line, W / 2, startY + i * lineH + dy);
  });

  ctx.restore();
}

function drawBodyScene(ctx: CanvasRenderingContext2D, sec: number, title: string, body: string) {
  const t = (sec - 2) / 6; // 0..1 over 6 seconds
  ctx.save();

  // Title badge
  ctx.globalAlpha = easeOut(t * 5);
  ctx.font = "bold 20px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#4F8DFF";
  ctx.fillText(title.toUpperCase().slice(0, 30), W / 2, 80);

  // Decorative line
  ctx.fillStyle = "rgba(79,141,255,0.4)";
  ctx.fillRect(W / 2 - 30, 92, 60, 1.5);

  ctx.globalAlpha = 1;

  // Body text — lines animate in sequentially
  ctx.font = "28px system-ui, sans-serif";
  const lines = wrapText(ctx, body, W - 80);
  const lineH = 44;
  const totalH = lines.length * lineH;
  const startY = H / 2 - totalH / 2 + 10;
  const linesPerSec = lines.length / 5;

  lines.forEach((line, i) => {
    const lineDelay = i / lines.length;
    const lineT = easeOut(Math.max(0, t / 0.85 - lineDelay * 0.9));
    const dy = (1 - lineT) * 14;
    ctx.globalAlpha = lineT;
    ctx.fillStyle = i % 4 === 0 ? "#FFFFFF" : "#CBD5E1";
    ctx.fillText(line, W / 2, startY + i * lineH + dy);
  });

  ctx.restore();
}

function drawCTAScene(ctx: CanvasRenderingContext2D, sec: number, cta: string) {
  const t = (sec - 8) / 1.5;
  ctx.save();

  const e = easeOut(t);
  ctx.globalAlpha = e;

  // Pulse ring
  const ringScale = 0.85 + Math.sin(sec * 3) * 0.04;
  ctx.beginPath();
  ctx.arc(W / 2, H / 2 - 80, 44 * ringScale, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(79,141,255,0.6)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Arrow icon
  ctx.font = "52px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("↑", W / 2, H / 2 - 50);

  // Follow text
  ctx.font = "bold 30px system-ui, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  const lines = wrapText(ctx, cta, W - 80);
  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, H / 2 + 30 + i * 44);
  });

  ctx.restore();
}

function drawOutroScene(ctx: CanvasRenderingContext2D) {
  ctx.save();

  // Logo mark (rounded rect via arc method for broad compatibility)
  const rx = W / 2 - 28, ry = H / 2 - 68, rw = 56, rh = 56, rr = 12;
  ctx.fillStyle = "#4F8DFF";
  ctx.beginPath();
  ctx.moveTo(rx + rr, ry);
  ctx.lineTo(rx + rw - rr, ry);
  ctx.arcTo(rx + rw, ry, rx + rw, ry + rr, rr);
  ctx.lineTo(rx + rw, ry + rh - rr);
  ctx.arcTo(rx + rw, ry + rh, rx + rw - rr, ry + rh, rr);
  ctx.lineTo(rx + rr, ry + rh);
  ctx.arcTo(rx, ry + rh, rx, ry + rh - rr, rr);
  ctx.lineTo(rx, ry + rr);
  ctx.arcTo(rx, ry, rx + rr, ry, rr);
  ctx.closePath();
  ctx.fill();

  ctx.font = "bold 26px system-ui, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.fillText("⚡", W / 2, H / 2 - 30);

  ctx.font = "bold 38px system-ui, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("VIRALOS AI", W / 2, H / 2 + 20);

  ctx.font = "20px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillText("Generated by AI · Go viral.", W / 2, H / 2 + 58);

  ctx.restore();
}

function drawWatermark(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.font = "bold 16px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.textAlign = "right";
  ctx.fillText("VIRALOS AI", W - 22, H - 26);
  ctx.restore();
}

function drawFrame(ctx: CanvasRenderingContext2D, frame: number, script: VideoScript) {
  const sec = frame / FPS;

  drawBackground(ctx, sec);

  if (sec < 2) {
    drawHookScene(ctx, sec, script.hook);
  } else if (sec < 8) {
    drawBodyScene(ctx, sec, script.title, script.body);
  } else if (sec < 9.5) {
    drawCTAScene(ctx, sec, script.cta);
  } else {
    drawOutroScene(ctx);
  }

  drawWatermark(ctx);
}

export function generateVideo(
  script: VideoScript,
  onProgress?: (pct: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas 2D context unavailable"));
      return;
    }

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : MediaRecorder.isTypeSupported("video/webm")
      ? "video/webm"
      : "video/mp4";

    const stream = canvas.captureStream(FPS);
    const chunks: BlobPart[] = [];
    let recorder: MediaRecorder;

    try {
      recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2_500_000,
      });
    } catch {
      reject(new Error("MediaRecorder not supported in this browser"));
      return;
    }

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };

    recorder.onerror = (e) => reject(e);

    recorder.start(200);

    let frame = 0;
    const msPerFrame = 1000 / FPS;

    const tick = () => {
      if (frame >= TOTAL_FRAMES) {
        recorder.stop();
        onProgress?.(100);
        return;
      }
      drawFrame(ctx, frame, script);
      onProgress?.(Math.round((frame / TOTAL_FRAMES) * 100));
      frame++;
      setTimeout(tick, msPerFrame);
    };

    tick();
  });
}
