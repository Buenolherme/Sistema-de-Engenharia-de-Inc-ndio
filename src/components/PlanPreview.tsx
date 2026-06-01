import { useEffect, useState } from 'react';
import type { ImgHTMLAttributes } from 'react';
import type { Project } from '../utils/data';
import { getProjectCover, isPdfSource } from '../utils/projectMedia';

type PreviewVariant = 'thumb' | 'detail' | 'modal';
type PlanTone = 'technical' | 'blueprint';
type LoadingAttr = ImgHTMLAttributes<HTMLImageElement>['loading'];
type PdfJsModule = typeof import('pdfjs-dist');

interface RenderedPdfPreview {
  dataUrl: string;
  width: number;
  height: number;
  autoRotated: boolean;
}

interface PlanPreviewProps {
  src: string;
  alt: string;
  variant?: PreviewVariant;
  tone?: PlanTone;
  rotation?: number;
  autoRotate?: boolean;
  trim?: boolean;
  className?: string;
  loading?: LoadingAttr;
  draggable?: boolean;
}

interface ProjectCoverMediaProps {
  project: Project;
  className?: string;
  loading?: LoadingAttr;
}

const TARGET_WIDTH: Record<PreviewVariant, number> = {
  thumb: 720,
  detail: 2600,
  modal: 3200,
};

const MAX_PIXELS: Record<PreviewVariant, number> = {
  thumb: 900_000,
  detail: 9_000_000,
  modal: 12_000_000,
};

const previewCache = new Map<string, RenderedPdfPreview>();
let pdfJsPromise: Promise<PdfJsModule> | null = null;

async function loadPdfJs() {
  if (!pdfJsPromise) {
    pdfJsPromise = Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
    ]).then(([pdfjs, worker]) => {
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjs;
    });
  }

  return pdfJsPromise;
}

function normalizeRotation(rotation: number) {
  return ((rotation % 360) + 360) % 360;
}

function previewCacheKey(src: string, variant: PreviewVariant, tone: PlanTone, rotation: number, autoRotate: boolean, trim: boolean) {
  return [variant, tone, normalizeRotation(rotation), autoRotate ? 'auto' : 'manual', trim ? 'trim' : 'full', src].join(':');
}

function canvasToImage(canvas: HTMLCanvasElement) {
  const webp = canvas.toDataURL('image/webp', 0.92);
  if (webp.startsWith('data:image/webp')) return webp;
  return canvas.toDataURL('image/png');
}

function getContentBounds(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  const { width, height } = canvas;
  const data = context.getImageData(0, 0, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const alpha = data[index + 3];
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];

      if (alpha > 10 && (red < 248 || green < 248 || blue < 248)) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) return null;

  const contentWidth = maxX - minX + 1;
  const contentHeight = maxY - minY + 1;
  if (contentWidth < width * 0.08 || contentHeight < height * 0.08) return null;

  return { minX, minY, maxX, maxY };
}

function cropCanvas(canvas: HTMLCanvasElement, paddingRatio = 0.035) {
  const bounds = getContentBounds(canvas);
  if (!bounds) return canvas;

  const padding = Math.round(Math.max(canvas.width, canvas.height) * paddingRatio);
  const sx = Math.max(0, bounds.minX - padding);
  const sy = Math.max(0, bounds.minY - padding);
  const ex = Math.min(canvas.width, bounds.maxX + padding);
  const ey = Math.min(canvas.height, bounds.maxY + padding);
  const width = Math.max(1, ex - sx + 1);
  const height = Math.max(1, ey - sy + 1);

  if (width >= canvas.width * 0.96 && height >= canvas.height * 0.96) return canvas;

  const cropped = document.createElement('canvas');
  cropped.width = width;
  cropped.height = height;
  cropped.getContext('2d')?.drawImage(canvas, sx, sy, width, height, 0, 0, width, height);
  return cropped;
}

function rotateCanvas(canvas: HTMLCanvasElement, rotation: number) {
  const normalized = normalizeRotation(rotation);
  if (normalized === 0) return canvas;

  const rotated = document.createElement('canvas');
  const quarterTurn = normalized === 90 || normalized === 270;
  rotated.width = quarterTurn ? canvas.height : canvas.width;
  rotated.height = quarterTurn ? canvas.width : canvas.height;

  const context = rotated.getContext('2d');
  if (!context) return canvas;

  context.translate(rotated.width / 2, rotated.height / 2);
  context.rotate((normalized * Math.PI) / 180);
  context.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  return rotated;
}

function drawBlueprintGrid(context: CanvasRenderingContext2D, width: number, height: number) {
  const major = Math.max(42, Math.round(Math.min(width, height) / 12));
  const minor = Math.max(14, Math.round(major / 4));

  context.save();
  context.lineWidth = 1;

  for (let x = 0; x <= width; x += minor) {
    context.strokeStyle = x % major === 0 ? 'rgba(56,189,248,0.11)' : 'rgba(37,99,235,0.045)';
    context.beginPath();
    context.moveTo(x + 0.5, 0);
    context.lineTo(x + 0.5, height);
    context.stroke();
  }

  for (let y = 0; y <= height; y += minor) {
    context.strokeStyle = y % major === 0 ? 'rgba(56,189,248,0.11)' : 'rgba(37,99,235,0.045)';
    context.beginPath();
    context.moveTo(0, y + 0.5);
    context.lineTo(width, y + 0.5);
    context.stroke();
  }

  context.restore();
}

function applyBlueprintTone(canvas: HTMLCanvasElement) {
  const sourceContext = canvas.getContext('2d', { willReadFrequently: true });
  if (!sourceContext) return canvas;

  const { width, height } = canvas;
  const source = sourceContext.getImageData(0, 0, width, height);
  const lineCanvas = document.createElement('canvas');
  lineCanvas.width = width;
  lineCanvas.height = height;
  const lineContext = lineCanvas.getContext('2d');
  if (!lineContext) return canvas;

  const lineData = lineContext.createImageData(width, height);

  for (let index = 0; index < source.data.length; index += 4) {
    const red = source.data[index];
    const green = source.data[index + 1];
    const blue = source.data[index + 2];
    const alpha = source.data[index + 3];
    const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
    const chroma = Math.max(red, green, blue) - Math.min(red, green, blue);
    const lineAlpha = Math.max(0, Math.min(255, (246 - luminance) * 2.65 + chroma * 0.55));

    lineData.data[index] = 85;
    lineData.data[index + 1] = 225;
    lineData.data[index + 2] = 255;
    lineData.data[index + 3] = alpha > 10 ? lineAlpha : 0;
  }

  lineContext.putImageData(lineData, 0, 0);

  const output = document.createElement('canvas');
  output.width = width;
  output.height = height;
  const outputContext = output.getContext('2d');
  if (!outputContext) return canvas;

  const gradient = outputContext.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#020817');
  gradient.addColorStop(0.42, '#061a32');
  gradient.addColorStop(1, '#020617');
  outputContext.fillStyle = gradient;
  outputContext.fillRect(0, 0, width, height);
  drawBlueprintGrid(outputContext, width, height);

  outputContext.save();
  outputContext.shadowColor = 'rgba(34,211,238,0.52)';
  outputContext.shadowBlur = Math.max(2, Math.min(7, width / 500));
  outputContext.drawImage(lineCanvas, 0, 0);
  outputContext.restore();
  outputContext.globalAlpha = 0.95;
  outputContext.drawImage(lineCanvas, 0, 0);
  outputContext.globalAlpha = 1;

  return output;
}

function postProcessCanvas(
  canvas: HTMLCanvasElement,
  options: { tone: PlanTone; rotation: number; autoRotate: boolean; trim: boolean }
): RenderedPdfPreview {
  let output = options.trim ? cropCanvas(canvas) : canvas;
  const autoRotation = options.autoRotate && output.height > output.width * 1.08 ? 90 : 0;
  output = rotateCanvas(output, options.rotation + autoRotation);
  if (options.tone === 'blueprint') output = applyBlueprintTone(output);

  return {
    dataUrl: canvasToImage(output),
    width: output.width,
    height: output.height,
    autoRotated: autoRotation !== 0,
  };
}

async function renderPdfFirstPage(
  src: string,
  variant: PreviewVariant,
  tone: PlanTone,
  rotation: number,
  autoRotate: boolean,
  trim: boolean
): Promise<RenderedPdfPreview> {
  const cacheKey = previewCacheKey(src, variant, tone, rotation, autoRotate, trim);
  const cached = previewCache.get(cacheKey);
  if (cached) return cached;

  const { getDocument } = await loadPdfJs();
  const loadingTask = getDocument({
    url: src,
    disableAutoFetch: variant === 'thumb',
    isEvalSupported: false,
  });
  const pdf = await loadingTask.promise;

  try {
    const page = await pdf.getPage(1);
    const baseViewport = page.getViewport({ scale: 1 });
    let scale = Math.max(1, TARGET_WIDTH[variant] / baseViewport.width);
    const projectedPixels = baseViewport.width * scale * baseViewport.height * scale;

    if (projectedPixels > MAX_PIXELS[variant]) {
      scale *= Math.sqrt(MAX_PIXELS[variant] / projectedPixels);
    }

    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: false });

    if (!context) throw new Error('Canvas indisponivel.');

    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: context,
      viewport,
      background: 'rgb(255,255,255)',
    }).promise;

    page.cleanup();

    const rendered = postProcessCanvas(canvas, { tone, rotation, autoRotate, trim });
    previewCache.set(cacheKey, rendered);
    return rendered;
  } finally {
    await pdf.destroy();
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Imagem indisponivel.'));
    image.src = src;
  });
}

async function renderImagePreview(
  src: string,
  variant: PreviewVariant,
  tone: PlanTone,
  rotation: number,
  autoRotate: boolean,
  trim: boolean
) {
  const cacheKey = previewCacheKey(src, variant, tone, rotation, autoRotate, trim);
  const cached = previewCache.get(cacheKey);
  if (cached) return cached;

  const image = await loadImage(src);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  let scale = Math.min(1, TARGET_WIDTH[variant] / Math.max(sourceWidth, 1));
  const projectedPixels = sourceWidth * scale * sourceHeight * scale;

  if (projectedPixels > MAX_PIXELS[variant]) {
    scale *= Math.sqrt(MAX_PIXELS[variant] / projectedPixels);
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(sourceWidth * scale));
  canvas.height = Math.max(1, Math.round(sourceHeight * scale));

  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('Canvas indisponivel.');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const rendered = postProcessCanvas(canvas, { tone, rotation, autoRotate, trim });
  previewCache.set(cacheKey, rendered);
  return rendered;
}

export function PlanPreview({
  src,
  alt,
  variant = 'detail',
  tone = 'technical',
  rotation = 0,
  autoRotate = false,
  trim = false,
  className = '',
  loading = 'lazy',
  draggable = false,
}: PlanPreviewProps) {
  const isPdf = isPdfSource(src);
  const shouldRenderImage = !isPdf && (tone === 'blueprint' || rotation !== 0 || autoRotate || trim);
  const [preview, setPreview] = useState<RenderedPdfPreview | null>(() => {
    if (!isPdf && !shouldRenderImage) return null;
    return previewCache.get(previewCacheKey(src, variant, tone, rotation, autoRotate, trim)) ?? null;
  });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!src || (!isPdf && !shouldRenderImage)) return;

    let cancelled = false;
    setFailed(false);
    setPreview(previewCache.get(previewCacheKey(src, variant, tone, rotation, autoRotate, trim)) ?? null);

    const render = isPdf
      ? renderPdfFirstPage(src, variant, tone, rotation, autoRotate, trim)
      : renderImagePreview(src, variant, tone, rotation, autoRotate, trim);

    render
      .then(rendered => {
        if (!cancelled) setPreview(rendered);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [autoRotate, isPdf, rotation, shouldRenderImage, src, tone, trim, variant]);

  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-[#08111f] text-sm text-slate-500 ${className}`}>
        Planta indisponivel
      </div>
    );
  }

  if (!isPdf && !shouldRenderImage) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        draggable={draggable}
      />
    );
  }

  if (preview) {
    return (
      <img
        src={preview.dataUrl}
        width={preview.width}
        height={preview.height}
        alt={alt}
        className={className}
        loading={loading}
        draggable={draggable}
      />
    );
  }

  return (
    <div className={`flex min-h-[220px] items-center justify-center bg-[#08111f] ${className}`}>
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-9 w-9 rounded-full border border-blue-400/20 border-t-blue-300 animate-spin" />
        <span className="text-xs text-mono uppercase tracking-[0.18em] text-blue-200/70">
          {failed ? 'Nao foi possivel gerar a previa' : 'Renderizando planta'}
        </span>
      </div>
    </div>
  );
}

export function ProjectCoverMedia({ project, className = '', loading = 'lazy' }: ProjectCoverMediaProps) {
  const cover = getProjectCover(project);

  if (!cover.src) {
    return (
      <div className={`relative bg-[#07111f] ${className}`}>
        <div className="absolute inset-0 blueprint-bg opacity-70" />
      </div>
    );
  }

  if (cover.kind === 'plan') {
    return (
      <div className={`relative overflow-hidden bg-[#07111f] ${className}`}>
        <div className="absolute inset-0 blueprint-bg opacity-70" />
        <PlanPreview
          src={cover.src}
          alt={`Planta 2D - ${project.title}`}
          variant="thumb"
          tone="blueprint"
          autoRotate
          trim
          className="absolute inset-0 h-full w-full object-contain p-5"
          loading={loading}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(7,17,31,0.42)_100%)]" />
      </div>
    );
  }

  return (
    <img
      src={cover.src}
      alt={project.title}
      className={`object-cover ${className}`}
      loading={loading}
    />
  );
}
