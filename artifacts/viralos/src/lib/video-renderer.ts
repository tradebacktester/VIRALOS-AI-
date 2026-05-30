export interface VideoScript {
  title: string;
  hook: string;
  body: string;
  cta: string;
}

const FPS = 30;
const W = 540;
const H = 960;

function easeOut(t: number) {
  return 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines = 8): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
      if (lines.length >= maxLines) break;
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

function drawBackground(ctx: CanvasRenderingContext2D, sec: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#06090f");
  bg.addColorStop(0.5, "#0a0d1c");
  bg.addColorStop(1, "#040608");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

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

  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.15, W / 2, H / 2, H * 0.8);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.72)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}

function drawHookScene(ctx: CanvasRenderingContext2D, localT: number, hook: string) {
  ctx.save();
  const t = Math.min(localT, 1);

  const lineW = 56 * easeOut(t * 1.5);
  ctx.fillStyle = "#4F8DFF";
  ctx.globalAlpha = easeOut(t * 2);
  ctx.fillRect(W / 2 - lineW / 2, H / 2 - 100, lineW, 3);
  ctx.globalAlpha = 1;

  ctx.font = "bold 42px system-ui, sans-serif";
  ctx.textAlign = "center";
  const lines = wrapText(ctx, hook, W - 80, 5);
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

function drawBodyScene(ctx: CanvasRenderingContext2D, localT: number, title: string, body: string) {
  const t = Math.min(localT, 1);
  ctx.save();

  ctx.globalAlpha = easeOut(t * 5);
  ctx.font = "bold 20px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#4F8DFF";
  ctx.fillText(title.toUpperCase().slice(0, 30), W / 2, 80);

  ctx.fillStyle = "rgba(79,141,255,0.4)";
  ctx.fillRect(W / 2 - 30, 92, 60, 1.5);
  ctx.globalAlpha = 1;

  ctx.font = "28px system-ui, sans-serif";
  const lines = wrapText(ctx, body, W - 80, 12);
  const lineH = 44;
  const totalH = lines.length * lineH;
  const startY = H / 2 - totalH / 2 + 10;

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

function drawCTAScene(ctx: CanvasRenderingContext2D, localT: number, sec: number, cta: string) {
  const t = Math.min(localT, 1);
  ctx.save();

  const e = easeOut(t);
  ctx.globalAlpha = e;

  const ringScale = 0.85 + Math.sin(sec * 3) * 0.04;
  ctx.beginPath();
  ctx.arc(W / 2, H / 2 - 80, 44 * ringScale, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(79,141,255,0.6)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = "52px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("↑", W / 2, H / 2 - 50);

  ctx.font = "bold 30px system-ui, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  const lines = wrapText(ctx, cta, W - 80, 4);
  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, H / 2 + 30 + i * 44);
  });

  ctx.restore();
}

function drawOutroScene(ctx: CanvasRenderingContext2D) {
  ctx.save();

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

function drawFrame(
  ctx: CanvasRenderingContext2D,
  sec: number,
  script: VideoScript,
  totalSec: number
) {
  const hookEnd = totalSec * 0.15;
  const bodyEnd = totalSec * 0.82;
  const ctaEnd = totalSec * 0.95;

  drawBackground(ctx, sec);

  if (sec < hookEnd) {
    drawHookScene(ctx, sec / hookEnd, script.hook);
  } else if (sec < bodyEnd) {
    drawBodyScene(ctx, (sec - hookEnd) / (bodyEnd - hookEnd), script.title, script.body);
  } else if (sec < ctaEnd) {
    drawCTAScene(ctx, (sec - bodyEnd) / (ctaEnd - bodyEnd), sec, script.cta);
  } else {
    drawOutroScene(ctx);
  }

  drawWatermark(ctx);
}

export function generateVideo(
  script: VideoScript,
  onProgress?: (pct: number) => void,
  audioBlob?: Blob
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas 2D context unavailable"));
      return;
    }

    let totalSeconds = 45;
    let audioCtx: AudioContext | null = null;
    let audioSource: AudioBufferSourceNode | null = null;

    if (audioBlob) {
      try {
        audioCtx = new AudioContext();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        totalSeconds = Math.min(audioBuffer.duration + 2, 120);

        const dest = audioCtx.createMediaStreamDestination();
        audioSource = audioCtx.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.connect(dest);

        const canvasStream = canvas.captureStream(FPS);
        for (const track of dest.stream.getAudioTracks()) {
          canvasStream.addTrack(track);
        }

        const totalFrames = Math.round(FPS * totalSeconds);
        const mimeType = pickMimeType();
        const chunks: BlobPart[] = [];

        let recorder: MediaRecorder;
        try {
          recorder = new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond: 3_000_000 });
        } catch {
          audioCtx.close();
          reject(new Error("MediaRecorder not supported"));
          return;
        }

        recorder.ondataavailable = (e) => { if (e.data?.size > 0) chunks.push(e.data); };
        recorder.onstop = () => {
          audioCtx!.close();
          resolve(new Blob(chunks, { type: mimeType }));
        };
        recorder.onerror = (e) => { audioCtx!.close(); reject(e); };

        recorder.start(250);
        audioSource.start(0);

        let frame = 0;
        const msPerFrame = 1000 / FPS;
        const tick = () => {
          if (frame >= totalFrames) {
            recorder.stop();
            onProgress?.(100);
            return;
          }
          drawFrame(ctx, frame / FPS, script, totalSeconds);
          onProgress?.(Math.round((frame / totalFrames) * 100));
          frame++;
          setTimeout(tick, msPerFrame);
        };
        tick();
        return;
      } catch (e) {
        console.warn("Audio setup failed, falling back to silent video:", e);
        audioCtx?.close().catch(() => {});
        audioCtx = null;
        audioSource = null;
      }
    }

    const silentDuration = 45;
    const totalFrames = FPS * silentDuration;
    const mimeType = pickMimeType();
    const stream = canvas.captureStream(FPS);
    const chunks: BlobPart[] = [];
    let recorder: MediaRecorder;

    try {
      recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2_500_000 });
    } catch {
      reject(new Error("MediaRecorder not supported in this browser"));
      return;
    }

    recorder.ondataavailable = (e) => { if (e.data?.size > 0) chunks.push(e.data); };
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    recorder.onerror = (e) => reject(e);

    recorder.start(250);

    let frame = 0;
    const msPerFrame = 1000 / FPS;
    const tick = () => {
      if (frame >= totalFrames) {
        recorder.stop();
        onProgress?.(100);
        return;
      }
      drawFrame(ctx, frame / FPS, script, silentDuration);
      onProgress?.(Math.round((frame / totalFrames) * 100));
      frame++;
      setTimeout(tick, msPerFrame);
    };
    tick();
  });
}

function pickMimeType(): string {
  if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) return "video/webm;codecs=vp9";
  if (MediaRecorder.isTypeSupported("video/webm")) return "video/webm";
  return "video/mp4";
}
