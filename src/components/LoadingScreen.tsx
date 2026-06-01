import { useLoading } from '../hooks/useAnimations';

export default function LoadingScreen() {
  const { loading, progress } = useLoading();

  return (
    <div className={`loading-screen ${!loading ? 'hidden' : ''}`}>
      <div className="absolute inset-0 blueprint-bg" />

      {/* Animated grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#2563eb" strokeWidth="0.5" strokeDasharray="8 4">
          <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1s" repeatCount="indefinite" />
        </line>
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#2563eb" strokeWidth="0.5" strokeDasharray="8 4">
          <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1s" repeatCount="indefinite" />
        </line>
      </svg>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl border border-blue-500/30 flex items-center justify-center bg-blue-950/50 animate-pulse-glow">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="animate-spin-slow">
              <path d="M20 4L36 32H4L20 4Z" stroke="#2563eb" strokeWidth="1.5" fill="none" strokeDasharray="4 2" />
              <path d="M20 12L28 28H12L20 12Z" stroke="#60a5fa" strokeWidth="1" fill="none" />
              <circle cx="20" cy="22" r="3" fill="#dc2626" opacity="0.8" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white tracking-wide">FIRE ENGINEER</h2>
          <p className="text-mono text-xs text-blue-400/60 mt-2 tracking-widest">SISTEMA CARREGANDO</p>
        </div>

        {/* Progress bar */}
        <div className="w-64 space-y-3">
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-mono text-xs">
            <span className="text-slate-500">Carregando modulos...</span>
            <span className="text-blue-400">{Math.floor(progress)}%</span>
          </div>
        </div>

        {/* Technical text */}
        <div className="text-mono text-[10px] text-slate-600 space-y-1 text-center">
          <p>[INIT] Modulo Three.js..............OK</p>
          <p>[INIT] Modulo Particulas..........OK</p>
          <p>[INIT] Modulo Blueprint...........OK</p>
          <p className={`${progress > 60 ? 'text-blue-400/60' : 'text-slate-700'}`}>[LOAD] Modelos 3D................{progress > 60 ? 'OK' : '...'}</p>
        </div>
      </div>
    </div>
  );
}
