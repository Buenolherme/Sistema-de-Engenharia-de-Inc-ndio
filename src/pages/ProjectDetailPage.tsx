import { useState, useRef, useEffect } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Box, Maximize2, Lightbulb, Route, Grid3x3, Triangle,
  CheckCircle2, MapPin, Building2, Calendar, Activity, Droplets,
  DoorOpen, CloudRain, Clock, AlertTriangle, ShieldCheck, Layers,
  ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Move, Images, RotateCw
} from 'lucide-react';
import { Project, useProjects } from '../utils/data';
import ThreeScene from '../components/ThreeScene';
import { PlanPreview } from '../components/PlanPreview';

// ── Mini Dashboard ─────────────────────────────────────────
function ProjectDashboard({ project }: { project: Project }) {
  const riskColor = {
    'Baixo': 'text-green-400 bg-green-500/10 border-green-500/20',
    'Médio': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    'Alto': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    'Muito Alto': 'text-red-400 bg-red-500/10 border-red-500/20',
  }[project.riskLevel ?? 'Alto'] ?? 'text-orange-400 bg-orange-500/10 border-orange-500/20';

  const statusColor = project.approvalStatus?.includes('Aprovado')
    ? 'text-green-400 bg-green-500/10 border-green-500/20'
    : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';

  const cards = [
    { icon: Clock, label: 'Tempo de Evacuação', value: project.evacuationTime ?? '—', color: 'text-blue-400' },
    { icon: AlertTriangle, label: 'Nível de Risco', value: project.riskLevel ?? '—', colorClass: riskColor },
    { icon: Droplets, label: 'Hidrantes', value: `${project.hydrants ?? 0}`, color: 'text-red-400' },
    { icon: DoorOpen, label: 'Saídas', value: `${project.exits ?? 0}`, color: 'text-green-400' },
    { icon: Building2, label: 'Área Protegida', value: project.area, color: 'text-blue-400' },
    { icon: CloudRain, label: 'Sprinklers', value: `${project.sprinklers ?? 0}`, color: 'text-cyan-400' },
    { icon: Layers, label: 'Tipo de Sistema', value: project.type, color: 'text-purple-400' },
    { icon: ShieldCheck, label: 'Aprovação', value: project.approvalStatus ?? '—', colorClass: statusColor, small: true },
  ];

  return (
    <div className="mb-12">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-400" /> Dashboard Técnico
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map(c => (
          <div key={c.label} className="blueprint-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <c.icon className={`w-4 h-4 ${c.colorClass ? (c.colorClass.split(' ')[0]) : c.color}`} />
              <span className="text-xs text-slate-500 truncate">{c.label}</span>
            </div>
            {c.colorClass ? (
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${c.colorClass} ${c.small ? 'text-[10px]' : ''}`}>
                {c.value}
              </span>
            ) : (
              <div className={`text-lg font-bold ${c.color}`}>{c.value}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Slider Antes/Depois ────────────────────────────────────
function BeforeAfterSlider({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePos = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    setPos(pct);
  };

  return (
    <div className="mb-8">
      <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
        <ChevronLeft className="w-5 h-5 text-slate-400" />
        Antes &amp; Depois
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </h3>
      <div
        ref={containerRef}
        className="relative h-[220px] sm:h-[260px] lg:h-[320px] xl:h-[340px] rounded-2xl overflow-hidden border border-blue-500/15 select-none cursor-col-resize bg-[#050810]"
        onMouseDown={e => { dragging.current = true; updatePos(e.clientX); }}
        onMouseMove={e => { if (dragging.current) updatePos(e.clientX); }}
        onMouseUp={() => { dragging.current = false; }}
        onMouseLeave={() => { dragging.current = false; }}
        onTouchStart={e => { dragging.current = true; updatePos(e.touches[0].clientX); }}
        onTouchMove={e => { if (dragging.current) updatePos(e.touches[0].clientX); }}
        onTouchEnd={() => { dragging.current = false; }}
      >
        {/* DEPOIS (fundo) */}
        <img src={after} alt="Depois" className="absolute inset-0 w-full h-full object-cover object-center" />

        {/* ANTES (clip) */}
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <img src={before} alt="Antes" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-[#0a1628]/60 blueprint-bg" />
        </div>

        {/* Divisor */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-[0_0_12px_rgba(255,255,255,0.5)]" style={{ left: `${pos}%` }}>
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
            <ChevronLeft className="w-3 h-3 text-slate-700 -mr-0.5" />
            <ChevronRight className="w-3 h-3 text-slate-700 -ml-0.5" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 px-2 py-1 rounded bg-black/60 text-xs text-mono text-slate-300">ANTES</div>
        <div className="absolute top-4 right-4 px-2 py-1 rounded bg-black/60 text-xs text-mono text-blue-300">DEPOIS</div>

        {/* Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-xs text-slate-400 text-mono">
          ← Arraste para comparar →
        </div>
      </div>
    </div>
  );
}

function BlueprintPlan({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const [planMode, setPlanMode] = useState<'blueprint' | 'technical'>('blueprint');
  const isBlueprint = planMode === 'blueprint';

  return (
    <section className="mb-9 max-w-[1500px] mx-auto">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="section-label">Planta do Projeto</span>
          <h2 className="mt-4 text-2xl sm:text-4xl font-bold text-white tracking-tight">{project.title}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
            <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-300" />{project.location}</span>
            <span className="inline-flex items-center gap-1.5"><Layers className="w-4 h-4 text-blue-300" />{project.type}</span>
            {project.year && <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-300" />{project.year}</span>}
            <span className="inline-flex items-center gap-1.5"><Building2 className="w-4 h-4 text-blue-300" />{project.area}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex rounded-xl border border-blue-500/20 bg-[#06111f]/80 p-1">
            <button
              type="button"
              onClick={() => setPlanMode('blueprint')}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${isBlueprint ? 'bg-blue-500/20 text-blue-200 shadow-[0_0_18px_rgba(37,99,235,0.18)]' : 'text-slate-400 hover:text-white'}`}
            >
              <Grid3x3 className="h-3.5 w-3.5" /> Modo Blueprint
            </button>
            <button
              type="button"
              onClick={() => setPlanMode('technical')}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${!isBlueprint ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Layers className="h-3.5 w-3.5" /> Modo Tecnico
            </button>
          </div>

          <button onClick={onOpen} className="btn-glow w-full justify-center sm:w-auto">
            <Maximize2 className="w-5 h-5" /> Ampliar Planta
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="group relative block w-full overflow-hidden rounded-2xl border border-blue-400/20 bg-[#050b14] text-left shadow-[0_0_45px_rgba(37,99,235,0.16),0_26px_70px_rgba(0,0,0,0.48)] transition-all duration-500 hover:border-blue-300/40 hover:shadow-[0_0_70px_rgba(37,99,235,0.24),0_30px_80px_rgba(0,0,0,0.52)]"
        aria-label="Ampliar planta do projeto"
      >
        <div className="absolute inset-0 blueprint-bg opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.10),transparent_54%),linear-gradient(135deg,rgba(15,23,42,0.42),rgba(2,6,23,0.88))]" />
        <div className="relative flex h-[72vw] min-h-[260px] max-h-[400px] items-center justify-center p-2 sm:h-[420px] sm:max-h-none sm:p-3 md:h-[460px] lg:h-[500px] xl:h-[540px] lg:p-4">
          <PlanPreview
            src={project.floorPlan2d}
            alt={`Planta 2D - ${project.title}`}
            variant="detail"
            tone={planMode}
            autoRotate={isBlueprint}
            trim={isBlueprint}
            className={`block max-h-[96%] max-w-[98%] select-none rounded-xl object-contain ${isBlueprint ? 'bg-transparent shadow-[0_0_34px_rgba(34,211,238,0.20)]' : 'bg-white shadow-[0_18px_60px_rgba(0,0,0,0.42)]'}`}
            loading="eager"
            draggable={false}
          />
        </div>
        <div className="pointer-events-none absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-[#06111f]/85 border border-blue-500/20 text-mono text-xs text-blue-300">
          {isBlueprint ? 'PLANTA BLUEPRINT' : 'PLANTA TECNICA'}
        </div>
        <div className="pointer-events-none absolute bottom-4 right-4 hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#06111f]/85 border border-blue-500/20 text-mono text-xs text-slate-300">
          <Maximize2 className="w-3.5 h-3.5 text-blue-300" /> Clique para ampliar
        </div>
      </button>
    </section>
  );
}

function PlanLightbox({ project, open, onClose }: { project: Project; open: boolean; onClose: () => void }) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null);

  useEffect(() => {
    if (!open) return;

    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setRotation(0);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  const fitToScreen = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const updateZoom = (next: number) => {
    const clamped = Math.max(1, Math.min(4, next));
    setZoom(clamped);
    if (clamped === 1) setOffset({ x: 0, y: 0 });
  };

  const rotatePlan = () => {
    setRotation(current => (current + 90) % 360);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (zoom <= 1) return;
    event.preventDefault();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setOffset({
      x: drag.originX + event.clientX - drag.startX,
      y: drag.originY + event.clientY - drag.startY,
    });
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };

  return (
    <div className="fixed inset-0 z-[90] bg-[#020617]/88 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label={`Planta ampliada - ${project.title}`}>
      <button className="absolute inset-0 cursor-default" aria-label="Fechar visualizacao ampliada" onClick={onClose} />

      <div className="relative flex h-full flex-col">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0">
            <div className="text-xs text-mono uppercase tracking-[0.18em] text-blue-300">Planta ampliada</div>
            <h2 className="mt-1 truncate text-xl font-bold text-white sm:text-2xl">{project.title}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => updateZoom(zoom - 0.25)} className="h-10 w-10 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors" title="Diminuir zoom">
              <ZoomOut className="mx-auto h-4 w-4" />
            </button>
            <span className="min-w-16 rounded-lg border border-blue-500/15 bg-blue-500/10 px-3 py-2 text-center text-xs text-mono text-blue-200">{Math.round(zoom * 100)}%</span>
            <button onClick={() => updateZoom(zoom + 0.25)} className="h-10 w-10 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors" title="Aumentar zoom">
              <ZoomIn className="mx-auto h-4 w-4" />
            </button>
            <button onClick={fitToScreen} className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
              <Maximize2 className="h-4 w-4" /> Ajustar a tela
            </button>
            <button onClick={rotatePlan} className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
              <RotateCw className="h-4 w-4" /> Girar planta
            </button>
            <button onClick={onClose} className="h-10 w-10 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors" title="Fechar">
              <X className="mx-auto h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden px-4 pb-5 sm:px-6 sm:pb-6">
          <div
            className={`relative flex h-full w-full touch-none items-center justify-center overflow-hidden rounded-2xl border border-blue-500/15 bg-[#020817] shadow-[inset_0_0_60px_rgba(37,99,235,0.08)] ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
          >
            <div className="absolute inset-0 blueprint-bg opacity-40" />
            {zoom > 1 && (
              <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-blue-500/20 bg-[#06111f]/80 px-3 py-1.5 text-xs text-slate-300 sm:flex">
                <Move className="h-3.5 w-3.5 text-blue-300" /> Arraste para navegar
              </div>
            )}
            <div
              className="relative z-10 origin-center"
              style={{
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
                transition: dragRef.current ? 'none' : 'transform 180ms ease',
              }}
            >
              <PlanPreview
                src={project.floorPlan2d}
                alt={`Planta ampliada - ${project.title}`}
                variant="modal"
                tone="technical"
                rotation={rotation}
                autoRotate
                trim={false}
                className="block max-h-[82vh] max-w-[90vw] select-none rounded-lg bg-white object-contain shadow-[0_26px_90px_rgba(0,0,0,0.58)]"
                loading="eager"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectDeliveryGallery({ project }: { project: Project }) {
  const images = [project.image, ...(project.galleryImages ?? [])]
    .map(src => src?.trim())
    .filter((src): src is string => Boolean(src))
    .filter((src, index, all) => all.indexOf(src) === index);

  if (!images.length) return null;

  return (
    <section className="mb-10">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <Images className="w-5 h-5 text-blue-400" /> Galeria do Projeto Entregue
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        {images.map((src, index) => (
          <div key={src} className="group relative aspect-video overflow-hidden rounded-2xl border border-blue-500/15 bg-[#050810]">
            <img
              src={src}
              alt={`${project.title} - imagem ${index + 1}`}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/45 to-transparent opacity-70" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Página Principal ──────────────────────────────────────
export default function ProjectDetailPage() {
  const { id } = useParams();
  const projects = useProjects();
  const project = projects.find(p => p.id === id);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [transitioning, setTransitioning] = useState(false);
  const [showEscapeRoutes, setShowEscapeRoutes] = useState(false);
  const [blueprintMode, setBlueprintMode] = useState(false);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [showLighting, setShowLighting] = useState(true);
  const [techMode, setTechMode] = useState(false);
  const [planLightboxOpen, setPlanLightboxOpen] = useState(false);
  const hasModel3d = Boolean(project?.model3d);

  // Scroll cinematic
  const heroRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const y = window.scrollY;
        heroRef.current.style.transform = `translateY(${y * 0.3}px)`;
        heroRef.current.style.opacity = `${1 - y / 600}`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!hasModel3d && viewMode === '3d') setViewMode('2d');
  }, [hasModel3d, viewMode]);

  const enter3D = () => {
    if (!hasModel3d) return;
    setTransitioning(true);
    setTimeout(() => { setViewMode('3d'); setTransitioning(false); }, 1200);
  };

  if (!project) {
    return (
      <main className="pt-24 min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Projeto não encontrado</h2>
          <Link to="/projetos" className="btn-glow">Voltar aos Projetos</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#0a0a0f] min-h-screen">
      {/* Transição 3D */}
      {transitioning && (
        <div className="fixed inset-0 z-50 bg-[#050810] flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-lg text-white font-semibold">Entrando no Modo 3D</p>
            <p className="text-sm text-slate-500 text-mono mt-2">Inicializando cena interativa...</p>
            <div className="mt-6 w-64 mx-auto h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      )}

      <PlanLightbox
        project={project}
        open={planLightboxOpen}
        onClose={() => setPlanLightboxOpen(false)}
      />

      {/* Hero com parallax */}
      <div className="relative h-[70vh] overflow-hidden">
        <div ref={heroRef} className="absolute inset-0 will-change-transform">
          <img src={project.image} alt={project.title} className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-[#0a0a0f]/20" />
          <div className="absolute inset-0 blueprint-bg opacity-20" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
          <Link to="/projetos" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> Voltar aos Projetos
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs text-mono">{project.category}</span>
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs text-mono">{project.type}</span>
                {project.status && (
                  <span className={`px-2 py-0.5 rounded text-xs text-mono border ${project.status === 'Concluído' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                    {project.status}
                  </span>
                )}
                {project.year && (
                  <span className="px-2 py-0.5 rounded bg-slate-500/20 text-slate-400 text-xs text-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" />{project.year}
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">{project.title}</h1>
              <div className="flex flex-wrap items-center gap-6 mt-4 text-slate-400 text-sm">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{project.location}</span>
                <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{project.area}</span>
                {project.buildingType && <span className="flex items-center gap-1 text-slate-500">{project.buildingType}</span>}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {viewMode === '2d' && hasModel3d && (
                <button onClick={enter3D} className="btn-glow">
                  <Box className="w-5 h-5" /> Visualizar em 3D
                </button>
              )}
              <button
                onClick={() => setTechMode(!techMode)}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border transition-all ${techMode ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
              >
                <Layers className="w-4 h-4" /> Modo Técnico
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-6 lg:px-8 py-12">

        {/* Dashboard Técnico */}
        <ProjectDashboard project={project} />

        {/* Modo Técnico: overlay de informações */}
        {techMode && (
          <div className="mb-12 blueprint-card p-6 border border-amber-500/20">
            <div className="flex items-center gap-3 mb-6">
              <Layers className="w-5 h-5 text-amber-400" />
              <h3 className="text-white font-semibold">Modo Técnico Ativo</h3>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs text-mono">CAMADAS VISÍVEIS</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { color: 'bg-red-400', label: 'Hidrantes', count: project.hydrants, desc: 'Pontos de hidrante' },
                { color: 'bg-cyan-400', label: 'Sprinklers', count: project.sprinklers, desc: 'Chuveiros automáticos' },
                { color: 'bg-green-400', label: 'Saídas de Emergência', count: project.exits, desc: 'Rotas de fuga' },
                { color: 'bg-yellow-400', label: 'Iluminação de Emergência', count: '—', desc: 'Blocos autônomos' },
                { color: 'bg-orange-400', label: 'Portas Corta-Fogo', count: '—', desc: 'Compartimentação' },
                { color: 'bg-blue-400', label: 'Wireframe Estrutural', count: '—', desc: 'Geometria do edifício' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                  <div className={`w-3 h-3 rounded-full ${item.color} flex-shrink-0 mt-0.5`} />
                  <div>
                    <div className="text-white text-sm font-medium">{item.label}</div>
                    <div className="text-slate-500 text-xs">{item.desc}</div>
                    {item.count !== '—' && <div className={`text-sm font-bold mt-1 ${item.color.replace('bg-', 'text-')}`}>{item.count}</div>}
                  </div>
                </div>
              ))}
            </div>
            {project.systems && project.systems.length > 0 && (
              <div className="mt-6">
                <div className="text-sm text-slate-400 mb-3">Normas Técnicas Aplicadas:</div>
                <div className="flex flex-wrap gap-2">
                  {project.systems.map(s => (
                    <span key={s} className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/15 text-blue-300 text-xs text-mono">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Viewer 2D / 3D */}
        {viewMode === '2d' ? (
          <BlueprintPlan project={project} onOpen={() => setPlanLightboxOpen(true)} />
        ) : (
          <div className="mb-12">
            <div className="viewer-3d-container relative" style={{ minHeight: '600px' }}>
              <>
                <ThreeScene modelUrl={project.model3d} showEscapeRoutes={showEscapeRoutes} blueprintMode={blueprintMode} wireframeMode={wireframeMode} showLighting={showLighting} />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <button onClick={() => { setViewMode('2d'); setBlueprintMode(false); setWireframeMode(false); setShowEscapeRoutes(false); }} className="w-10 h-10 rounded-lg bg-[#0a1628]/80 border border-blue-500/20 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-colors" title="Planta 2D"><Grid3x3 className="w-4 h-4" /></button>
                  <button onClick={() => setShowEscapeRoutes(!showEscapeRoutes)} className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${showEscapeRoutes ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-[#0a1628]/80 border-blue-500/20 text-slate-400 hover:text-green-400'}`} title="Rotas de Fuga"><Route className="w-4 h-4" /></button>
                  <button onClick={() => setBlueprintMode(!blueprintMode)} className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${blueprintMode ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-[#0a1628]/80 border-blue-500/20 text-slate-400 hover:text-blue-400'}`} title="Blueprint"><Grid3x3 className="w-4 h-4" /></button>
                  <button onClick={() => setWireframeMode(!wireframeMode)} className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${wireframeMode ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-[#0a1628]/80 border-blue-500/20 text-slate-400 hover:text-blue-400'}`} title="Wireframe"><Triangle className="w-4 h-4" /></button>
                  <button onClick={() => setShowLighting(!showLighting)} className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${showLighting ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-[#0a1628]/80 border-blue-500/20 text-slate-400 hover:text-amber-400'}`} title="Iluminação"><Lightbulb className="w-4 h-4" /></button>
                  <button onClick={() => { if (document.fullscreenElement) document.exitFullscreen(); else document.querySelector('.viewer-3d-container')?.requestFullscreen(); }} className="w-10 h-10 rounded-lg bg-[#0a1628]/80 border border-blue-500/20 flex items-center justify-center text-slate-400 hover:text-white transition-colors" title="Tela Cheia"><Maximize2 className="w-4 h-4" /></button>
                </div>
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-[#0a1628]/80 border border-blue-500/20 text-mono text-xs text-blue-400">MODO 3D INTERATIVO</div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-[#0a1628]/80 border border-blue-500/20 text-mono text-xs text-slate-500 hidden sm:flex items-center gap-4">
                  <span>Arrastar: Orbitar</span><span>Scroll: Zoom</span><span>Shift+Arrastar: Mover</span>
                </div>
              </>
            </div>
          </div>
        )}

        {/* Antes e Depois */}
        <BeforeAfterSlider before={project.beforeImage} after={project.image} />

        {/* Galeria do Projeto Entregue */}
        <ProjectDeliveryGallery project={project} />

        {/* Descrição + Sistemas */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-4">Descrição do Projeto</h2>
            <p className="text-slate-400 leading-relaxed text-lg">{project.description}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Sistemas Implementados</h3>
            <ul className="space-y-3">
              {project.features.map(f => (
                <li key={f} className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
