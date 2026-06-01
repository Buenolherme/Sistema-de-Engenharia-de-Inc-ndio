import { Link } from 'react-router-dom';
import {
  ArrowRight, ChevronRight, Shield, DoorOpen, Droplets, CloudRain,
  Signpost, BadgeCheck, FileText, Building2, Factory, Home,
  CheckCircle2, Monitor, Cpu, Wrench, Layers, Eye, Calendar
} from 'lucide-react';
import { useInView, useCounter } from '../hooks/useAnimations';
import { SERVICES, useEngineer, useProjects } from '../utils/data';
import ParticleCanvas from '../components/ParticleCanvas';
import { ProjectCoverMedia } from '../components/PlanPreview';

const iconMap: Record<string, React.ElementType> = {
  shield: Shield, exit: DoorOpen, droplet: Droplets, 'cloud-rain': CloudRain,
  signpost: Signpost, 'badge-check': BadgeCheck, 'file-text': FileText,
  building: Building2, factory: Factory, home: Home,
};

function Hero() {
  const ENGINEER = useEngineer();
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0a0a0f]">
      <ParticleCanvas />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-transparent to-[#0a0a0f]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/80 via-transparent to-[#0a0a0f]/80" />

      {/* Blueprint grid */}
      <div className="absolute inset-0 blueprint-bg opacity-40" />

      {/* Red glow */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-blue-900/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-32">
        <div className="max-w-4xl">
          <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300 text-mono">ENGENHARIA DE SEGURANÇA CONTRA INCÊNDIO</span>
          </div>

          <h1 className="animate-fade-up animate-fade-up-d1 text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight">
            Proteção que{' '}
            <span className="gradient-text-fire">salva vidas</span>
            <br />
            Projetos que{' '}
            <span className="gradient-text-blue">fazem a diferença</span>
          </h1>

          <p className="animate-fade-up animate-fade-up-d2 mt-8 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
            {ENGINEER.name} — Especialista em PPCI, saídas de emergência e projetos técnicos de segurança contra incêndio para edificações de todos os portes.
          </p>

          <div className="animate-fade-up animate-fade-up-d3 mt-10 flex flex-col sm:flex-row gap-4">
            <Link to="/projetos" className="btn-glow">
              Ver Projetos <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/contato" className="btn-outline">
              Entrar em Contato <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="animate-fade-up animate-fade-up-d4 mt-16 flex flex-wrap items-center gap-8 text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              <span className="text-sm">{ENGINEER.stats.projects}+ Projetos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              <span className="text-sm">{ENGINEER.stats.years}+ Anos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              <span className="text-sm">{ENGINEER.stats.clients}+ Clientes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-red-400" />
              <span className="text-sm text-mono">{ENGINEER.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600">
        <span className="text-[10px] tracking-[0.3em] text-mono uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-blue-500/50 to-transparent" />
      </div>
    </section>
  );
}

function AboutPreview() {
  const ENGINEER = useEngineer();
  const { ref, inView } = useInView();
  const stat1 = useCounter(ENGINEER.stats.projects);
  const stat2 = useCounter(ENGINEER.stats.years);
  const stat3 = useCounter(ENGINEER.stats.clients);

  return (
    <section id="sobre" className="relative py-32 bg-[#080812]">
      <div className="absolute inset-0 blueprint-bg opacity-30" />
      <div ref={ref} className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className={`transition-all duration-700 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <span className="section-label">Sobre</span>
            <h2 className="mt-6 text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Engenharia com{' '}
              <span className="gradient-text-blue">excelência técnica</span>
            </h2>
            <p className="mt-6 text-lg text-slate-400 leading-relaxed">{ENGINEER.bio}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              {ENGINEER.softwares.map(s => (
                <span key={s} className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/15 text-blue-300 text-sm text-mono">
                  {s}
                </span>
              ))}
            </div>

            <Link to="/sobre" className="inline-flex items-center gap-2 mt-8 text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Saiba mais <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className={`transition-all duration-700 delay-200 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="grid grid-cols-3 gap-4">
              <div ref={stat1.ref} className="glass-card p-6 text-center">
                <div className="stat-value">{stat1.count}+</div>
                <div className="text-sm text-slate-400 mt-2">Projetos Realizados</div>
              </div>
              <div ref={stat2.ref} className="glass-card p-6 text-center">
                <div className="stat-value">{stat2.count}+</div>
                <div className="text-sm text-slate-400 mt-2">Anos de Experiencia</div>
              </div>
              <div ref={stat3.ref} className="glass-card p-6 text-center">
                <div className="stat-value">{stat3.count}+</div>
                <div className="text-sm text-slate-400 mt-2">Clientes Atendidos</div>
              </div>
            </div>

            {/* CREA badge */}
            <div className="mt-6 glass-card p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600/20 to-red-900/20 border border-red-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <div className="text-white font-semibold">{ENGINEER.crea}</div>
                <div className="text-sm text-slate-400">Registro profissional ativo</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const { ref, inView } = useInView();

  return (
    <section id="servicos" className="relative py-32 bg-[#0a0a0f]">
      <div className="absolute inset-0 blueprint-bg opacity-30" />
      <div ref={ref} className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className={`text-center max-w-2xl mx-auto mb-20 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="section-label">Servicos</span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Soluções em{' '}
            <span className="gradient-text-blue">segurança contra incêndio</span>
          </h2>
          <p className="mt-6 text-lg text-slate-400">
            Servicos completos para proteção de vidas e patrimonios, conforme as normas técnicas vigentes.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {SERVICES.map((s, i) => {
            const Icon = iconMap[s.icon] || Shield;
            return (
              <div
                key={s.title}
                className={`group glass-card p-6 text-center transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: inView ? `${i * 60}ms` : '0ms' }}
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 group-hover:scale-110">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-2">{s.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PortfolioPreview() {
  const PROJECTS = useProjects();
  const { ref, inView } = useInView();

  return (
    <section id="portfolio" className="relative py-32 bg-[#080812]">
      <div className="absolute inset-0 blueprint-bg opacity-30" />
      <div ref={ref} className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className={`flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div>
            <span className="section-label">Portfolio</span>
            <h2 className="mt-6 text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Projetos em{' '}
              <span className="gradient-text-blue">destaque</span>
            </h2>
          </div>
          <Link to="/projetos" className="btn-outline text-sm !py-2.5 !px-5">
            Ver Todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.slice(0, 3).map((p, i) => (
            <Link
              key={p.id}
              to={`/projetos/${p.id}`}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 hover:-translate-y-2 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: inView ? `${i * 150}ms` : '0ms' }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <ProjectCoverMedia project={p} className="w-full h-full transition-transform duration-700 group-hover:scale-110" loading="lazy" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

              {/* Blueprint overlay on hover */}
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

              {/* Glow border on hover */}
              <div className="absolute inset-0 rounded-2xl border border-blue-500/0 group-hover:border-blue-500/30 transition-all duration-500 pointer-events-none" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TechBanner() {
  const { ref, inView } = useInView();
  const techs = [
    { icon: Monitor, label: 'AutoCAD' },
    { icon: Layers, label: 'Revit MEP' },
    { icon: Cpu, label: 'CypeCAD' },
    { icon: Wrench, label: 'Hydra' },
  ];

  return (
    <section className="relative py-16 bg-[#0a0a0f] border-y border-blue-500/10">
      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-12 transition-all duration-700 ${inView ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-sm text-slate-500 text-mono tracking-wider">TECNOLOGIAS</span>
          {techs.map(t => (
            <div key={t.label} className="flex items-center gap-3 text-slate-400 hover:text-blue-400 transition-colors">
              <t.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <TechBanner />
      <AboutPreview />
      <ServicesSection />
      <PortfolioPreview />
    </>
  );
}
