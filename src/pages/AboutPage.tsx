import { Shield, Award, BookOpen, Monitor, Cpu, Wrench, Layers, FileCheck } from 'lucide-react';
import { useInView, useCounter } from '../hooks/useAnimations';
import { useEngineer } from '../utils/data';

const specializations = [
  'PPCI - Plano de Prevencao e Combate a Incendio',
  'Projetos de Sistemas de Hidrantes',
  'Projetos de Sistemas de Sprinklers',
  'Dimensionamento de Saidas de Emergencia',
  'Sinalizacao de Emergencia e Fotoluminescente',
  'Regularizacao junto ao Corpo de Bombeiros',
  'Laudos Tecnicos e ART',
  'Projetos para Edificacoes Comerciais, Industriais e Residenciais',
];

const softwareIcons = [
  { name: 'AutoCAD', icon: Monitor },
  { name: 'Revit MEP', icon: Layers },
  { name: 'CypeCAD', icon: Cpu },
  { name: 'Hydra', icon: Wrench },
  { name: 'ProjectWise', icon: FileCheck },
  { name: 'Navisworks', icon: Layers },
];

export default function AboutPage() {
  const ENGINEER = useEngineer();
  const { ref, inView } = useInView();
  const stat1 = useCounter(ENGINEER.stats.projects);
  const stat2 = useCounter(ENGINEER.stats.years);
  const stat3 = useCounter(ENGINEER.stats.clients);

  return (
    <main className="pt-24 bg-[#0a0a0f] min-h-screen">
      <div className="absolute inset-0 blueprint-bg opacity-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Header */}
        <div ref={ref} className={`mb-20 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="section-label">Sobre</span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Conheça o{' '}
            <span className="gradient-text-blue">profissional</span>
          </h1>
        </div>

        {/* Profile Section */}
        <div className="grid lg:grid-cols-2 gap-16 mb-20">
          <div className={`transition-all duration-700 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            {/* Photo placeholder */}
            <div className="relative mb-8">
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-blue-500/15">
                <img
                  src={ENGINEER.photo ?? "https://images.pexels.com/photos/3760529/pexels-photo-3760529.jpeg?auto=compress&cs=tinysrgb&w=800"}
                  alt="Engenheiro"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* CREA badge overlay */}
              <div className="absolute bottom-4 left-4 glass-card !rounded-xl px-4 py-3 flex items-center gap-3">
                <Shield className="w-6 h-6 text-red-400" />
                <div>
                  <div className="text-white font-semibold text-sm">{ENGINEER.crea} - IZ CODE</div>
                  <div className="text-xs text-slate-400">Registro ativo - {ENGINEER.location}</div>
                </div>
              </div>
            </div>
          </div>

          <div className={`transition-all duration-700 delay-200 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <h2 className="text-3xl font-bold text-white mb-2">{ENGINEER.name}</h2>
            <p className="text-blue-400 text-mono text-sm mb-6">{ENGINEER.specialization}</p>
            <p className="text-slate-400 leading-relaxed text-lg mb-8">{ENGINEER.bio}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div ref={stat1.ref} className="glass-card p-5 text-center">
                <div className="stat-value">{stat1.count}+</div>
                <div className="text-sm text-slate-400 mt-2">Projetos</div>
              </div>
              <div ref={stat2.ref} className="glass-card p-5 text-center">
                <div className="stat-value">{stat2.count}+</div>
                <div className="text-sm text-slate-400 mt-2">Anos</div>
              </div>
              <div ref={stat3.ref} className="glass-card p-5 text-center">
                <div className="stat-value">{stat3.count}+</div>
                <div className="text-sm text-slate-400 mt-2">Clientes</div>
              </div>
            </div>

            {/* Certifications */}
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-slate-300 text-sm">Especialista em Segurança Contra Incendio</span>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span className="text-slate-300 text-sm">Pós-graduação em Engenharia de Prevenção</span>
            </div>
          </div>
        </div>

        {/* Specializations */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-white mb-8">Especializações</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {specializations.map((s, i) => (
              <div key={i} className="glass-card p-4 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Software */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-8">Softwares Utilizados</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {softwareIcons.map(s => (
              <div key={s.name} className="glass-card p-6 text-center group">
                <s.icon className="w-8 h-8 mx-auto text-blue-400 mb-3 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-sm text-slate-300 text-mono">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
