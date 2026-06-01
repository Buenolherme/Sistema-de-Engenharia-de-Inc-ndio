import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Flame } from 'lucide-react';
import { useInView } from '../hooks/useAnimations';

export default function ContactPage() {
  const { ref, inView } = useInView();
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'contato@izcode.com.br', href: 'mailto:contato@izcode.com.br' },
    { icon: Phone, label: 'Telefone', value: '(31) 99999-0000', href: 'tel:+5531999990000' },
    { icon: MapPin, label: 'Endereco', value: 'Minas Gerais, Betim', href: '#' },
    { icon: Clock, label: 'Horario', value: 'Seg-Sex: 8h as 18h', href: '#' },
  ];

  return (
    <main className="pt-24 bg-[#0a0a0f] min-h-screen">
      <div className="absolute inset-0 blueprint-bg opacity-20 pointer-events-none" />

      <div ref={ref} className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Header */}
        <div className={`mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="section-label">Contato</span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Vamos conversar sobre{' '}
            <span className="gradient-text-blue">seu projeto</span>
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-2xl">
            Entre em contato para discutir seu projeto de seguranca contra incendio. Atendemos todo o Brasil.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className={`lg:col-span-2 transition-all duration-700 delay-100 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="space-y-6">
              {contactInfo.map(c => (
                <a key={c.label} href={c.href} className="glass-card p-5 flex items-center gap-4 group hover:border-blue-500/30">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center transition-colors group-hover:bg-blue-500/20">
                    <c.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">{c.label}</div>
                    <div className="text-white font-medium">{c.value}</div>
                  </div>
                </a>
              ))}
            </div>

            {/* CREA badge */}
            <div className="mt-8 glass-card p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600/20 to-red-900/20 border border-red-500/20 flex items-center justify-center">
                <Flame className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <div className="text-white font-semibold">CREA-MG 1234567890</div>
                <div className="text-sm text-slate-400">Registro profissional ativo e regular</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className={`lg:col-span-3 transition-all duration-700 delay-200 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nome</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    placeholder="(11) 99999-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Assunto</label>
                  <select
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  >
                    <option value="" className="bg-slate-900">Selecione...</option>
                    <option value="ppci" className="bg-slate-900">PPCI</option>
                    <option value="hidrantes" className="bg-slate-900">Hidrantes</option>
                    <option value="sprinklers" className="bg-slate-900">Sprinklers</option>
                    <option value="saidas" className="bg-slate-900">Saídas de Emergência</option>
                    <option value="regularizacao" className="bg-slate-900">Regularização CB</option>
                    <option value="laudos" className="bg-slate-900">Laudos Técnicos</option>
                    <option value="outro" className="bg-slate-900">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Mensagem</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                  placeholder="Descreva seu projeto e necessidades..."
                />
              </div>

              <button
                type="submit"
                className="w-full btn-glow justify-center !py-4"
              >
                {sent ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> Mensagem Enviada com Sucesso!
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> Enviar Mensagem
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
