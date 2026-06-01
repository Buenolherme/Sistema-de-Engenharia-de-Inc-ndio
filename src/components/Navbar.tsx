import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const links = [
  { label: 'Início', to: '/' },
  { label: 'Projetos', to: '/projetos' },
  { label: 'Sobre', to: '/sobre' },
  { label: 'Contato', to: '/contato' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-blue-500/10 shadow-2xl shadow-black/30' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
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

          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 ${location.pathname === l.to ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/contato" className="btn-glow text-sm !py-2.5 !px-5">Contato</Link>
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2" aria-label="Abrir menu">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-[#0a0a0f]/98 backdrop-blur-xl border-t border-blue-500/10">
          <div className="px-6 py-4 space-y-1">
            {links.map(l => (
              <Link key={l.to} to={l.to} className={`block px-4 py-3 rounded-lg transition-colors ${location.pathname === l.to ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                {l.label}
              </Link>
            ))}
            <Link to="/contato" className="block mt-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg text-center">
              Contato
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
