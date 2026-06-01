import { Link } from 'react-router-dom';
import { Mail, MapPin, Instagram, MessageCircle, Shield } from 'lucide-react';
import { getEngineer } from '../utils/data';

export default function Footer() {
  const eng = getEngineer();

  return (
    <footer className="bg-[#04040c] border-t border-blue-500/10 relative overflow-hidden">
      {/* Blueprint grid sutil */}
      <div className="absolute inset-0 blueprint-bg opacity-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">

          {/* Marca */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-5 group">
              <img
                src="/izcode.png"
                alt="IZ CODE"
                width={60}
                height={40}
                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <div>
                <span className="text-lg font-bold text-white tracking-tight block leading-tight">IZ CODE</span>
                <span className="text-[10px] text-blue-400 font-medium tracking-[0.2em] text-mono">ENGENHARIA</span>
              </div>
            </Link>
            <p className="text-slate-500 max-w-sm leading-relaxed text-sm mb-6">
              Engenharia de segurança contra incêndio com excelência técnica e compromisso com a proteção de vidas e patrimônios. Atuando em Minas Gerais.
            </p>
            <p className="text-blue-400/70 text-xs text-mono tracking-wider uppercase">
              Tecnologia e Engenharia de Precisão.
            </p>

            {/* Redes Sociais */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href={`https://wa.me/${eng.whatsapp}`}
                target="_blank" rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 hover:bg-green-500/20 transition-all duration-200 hover:scale-110"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={`https://instagram.com/${eng.instagram.replace('@', '')}`}
                target="_blank" rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 hover:bg-pink-500/20 transition-all duration-200 hover:scale-110"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${eng.email}`}
                className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-all duration-200 hover:scale-110"
                title="E-mail"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navegação */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Links Rápidos</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Início', to: '/' },
                { label: 'Projetos', to: '/projetos' },
                { label: 'Sobre', to: '/sobre' },
                { label: 'Contato', to: '/contato' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-blue-500/50 group-hover:bg-blue-400 transition-colors" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Contato</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <a href={`mailto:${eng.email}`} className="flex items-start gap-3 text-slate-500 hover:text-blue-400 transition-colors group">
                  <Mail className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>{eng.email}</span>
                </a>
              </li>
              <li>
                <a href={`https://wa.me/${eng.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-start gap-3 text-slate-500 hover:text-green-400 transition-colors">
                  <MessageCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>WhatsApp</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-slate-500">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Betim — Minas Gerais</span>
              </li>
              <li className="flex items-start gap-3 text-slate-500">
                <Shield className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-mono text-xs">{eng.crea}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="tech-line mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">Todos os direitos reservados © IZCODE</p>
          <p className="text-xs text-slate-600 text-mono">Desenvolvido por IZCODE</p>
        </div>
      </div>
    </footer>
  );
}
