import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Filter, Building2, Factory, Home, Heart, ToggleLeft, ToggleRight, Calendar } from 'lucide-react';
import { useInView } from '../hooks/useAnimations';
import { useProjects } from '../utils/data';
import { ProjectCoverMedia } from '../components/PlanPreview';

const categories = [
  { label: 'Todos', value: 'all', icon: Filter },
  { label: 'Comercial', value: 'Comercial', icon: Building2 },
  { label: 'Industrial', value: 'Industrial', icon: Factory },
  { label: 'Residencial', value: 'Residencial', icon: Home },
  { label: 'Saúde', value: 'Saúde', icon: Heart },
];

export default function ProjectsPage() {
  const PROJECTS = useProjects();
  const [active, setActive] = useState('all');
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const { ref, inView } = useInView();

  const filtered = active === 'all' ? PROJECTS : PROJECTS.filter(p => p.category === active);

  return (
    <main className="pt-24 bg-[#0a0a0f] min-h-screen">
      <div className="absolute inset-0 blueprint-bg opacity-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Header */}
        <div ref={ref} className={`mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="section-label">Portfolio</span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Projetos{' '}
            <span className="gradient-text-blue">tecnicos</span>
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-2xl">
            Conheca nossos projetos de seguranca contra incendio para edificacoes comerciais, industriais e residenciais.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-12">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {categories.map(c => (
              <button
                key={c.value}
                onClick={() => setActive(c.value)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  active === c.value
                    ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/10'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <c.icon className="w-4 h-4" />
                {c.label}
              </button>
            ))}
          </div>

          {/* Before/After Toggle */}
          <button
            onClick={() => setShowBeforeAfter(!showBeforeAfter)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              showBeforeAfter
                ? 'bg-green-600/20 border border-green-500/30 text-green-300 shadow-lg shadow-green-500/10'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {showBeforeAfter ? (
              <ToggleRight className="w-4 h-4" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
            {showBeforeAfter ? 'Antes e Depois' : 'Galeria Normal'}
          </button>
        </div>

        {/* Grid */}
        {showBeforeAfter ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => (
              <div key={p.id} className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2">
                {/* Split view container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#050810]">
                  {/* Before image */}
                  <div className="absolute inset-0 w-1/2 overflow-hidden">
                    <img src={p.beforeImage} alt={`${p.title} - Antes`} className="w-full h-full object-cover" loading="lazy" />
                  </div>

                  {/* After image */}
                  <div className="absolute inset-0 right-0 w-1/2 overflow-hidden">
                    <img src={p.image} alt={`${p.title} - Depois`} className="w-full h-full object-cover" loading="lazy" />
                  </div>

                  {/* Divider */}
                  <div className="absolute inset-y-0 left-1/2 w-1 bg-gradient-to-b from-transparent via-white/30 to-transparent" />

                  {/* Labels */}
                  <div className="absolute top-3 left-3 px-2 py-1 rounded bg-slate-900/60 border border-white/20">
                    <span className="text-xs text-white font-mono">ANTES</span>
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 rounded bg-slate-900/60 border border-white/20">
                    <span className="text-xs text-white font-mono">DEPOIS</span>
                  </div>

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/20 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
                </div>

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0a0f] to-transparent translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs text-mono">{p.category}</span>
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs text-mono">{p.type}</span>
                    {p.year && (
                      <span className="px-2 py-0.5 rounded bg-slate-500/20 text-slate-400 text-xs text-mono inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{p.year}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white">{p.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                    <span>{p.area}</span>
                    <span>{p.location}</span>
                  </div>
                  <Link to={`/projetos/${p.id}`} className="inline-flex items-center gap-1 text-blue-400 text-sm font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-4 h-4" /> Ver Projeto
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => (
              <Link
                key={p.id}
                to={`/projetos/${p.id}`}
                className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <ProjectCoverMedia project={p} className="w-full h-full transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
                <div className="absolute inset-0 blueprint-bg opacity-0 group-hover:opacity-20 transition-opacity duration-500" />

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs text-mono">{p.category}</span>
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs text-mono">{p.type}</span>
                    {p.year && (
                      <span className="px-2 py-0.5 rounded bg-slate-500/20 text-slate-400 text-xs text-mono inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{p.year}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white">{p.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                    <span>{p.area}</span>
                    <span>{p.location}</span>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1 text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <Eye className="w-4 h-4" /> Ver Projeto
                  </div>
                </div>

                <div className="absolute inset-0 rounded-2xl border border-blue-500/0 group-hover:border-blue-500/30 transition-all duration-500 pointer-events-none" />
              </Link>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg">Nenhum projeto encontrado nesta categoria.</p>
          </div>
        )}
      </div>
    </main>
  );
}
