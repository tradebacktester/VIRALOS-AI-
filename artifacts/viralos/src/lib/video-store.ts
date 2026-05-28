const blobUrls = new Map<number, string>();
const mimeTypes = new Map<number, string>();

export function storeVideoBlob(projectId: number, blob: Blob): string {
  const existing = blobUrls.get(projectId);
  if (existing) URL.revokeObjectURL(existing);
  const url = URL.createObjectURL(blob);
  blobUrls.set(projectId, url);
  mimeTypes.set(projectId, blob.type);
  try {
    sessionStorage.setItem(`viralos_video_${projectId}`, "ready");
  } catch {}
  return url;
}

export function getVideoUrl(projectId: number): string | null {
  return blobUrls.get(projectId) ?? null;
}

export function getMimeType(projectId: number): string {
  return mimeTypes.get(projectId) ?? "video/webm";
}

export function hasVideoBlob(projectId: number): boolean {
  return blobUrls.has(projectId);
}

export function downloadVideo(projectId: number, title: string) {
  const url = blobUrls.get(projectId);
  if (!url) return false;
  const mime = mimeTypes.get(projectId) ?? "video/webm";
  const ext = mime.includes("mp4") ? "mp4" : "webm";
  const safe = title.replace(/[^a-z0-9]/gi, "_").toLowerCase().slice(0, 40);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safe}_viralos.${ext}`;
  a.click();
  return true;
}
