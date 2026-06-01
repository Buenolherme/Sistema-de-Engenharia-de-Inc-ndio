import { useEffect, useRef, useState } from 'react';
import {
  Save, RotateCcw, Plus, Trash2, Edit3, X, Check, User, Wrench,
  FolderOpen, AlertTriangle, ImageIcon, UploadCloud, Loader2,
  FileImage, Box, Lock, LogOut, FileCheck2
} from 'lucide-react';
import {
  DEFAULT_ENGINEER, DEFAULT_PROJECTS,
  Engineer, Project, loadSiteContent, resetAll, saveSiteContent
} from '../utils/data';

type AuthState = 'checking' | 'guest' | 'authenticated';
type Notice = { type: 'success' | 'error'; message: string } | null;
type UploadKind = 'image' | 'plan2d' | 'model3d';
type UploadPreview = 'image' | 'blueprint' | 'model';

interface UploadResult {
  url: string;
  originalName: string;
  type: string;
  size: number;
}

const uploadSpecs: Record<UploadKind, { accept: string; extensions: string[]; maxSize: number; helper: string }> = {
  image: {
    accept: '.png,.jpg,.jpeg,.webp',
    extensions: ['.png', '.jpg', '.jpeg', '.webp'],
    maxSize: 8 * 1024 * 1024,
    helper: 'PNG, JPG, JPEG ou WEBP até 8 MB.',
  },
  plan2d: {
    accept: '.png,.jpg,.jpeg,.webp,.pdf',
    extensions: ['.png', '.jpg', '.jpeg', '.webp', '.pdf'],
    maxSize: 15 * 1024 * 1024,
    helper: 'Imagem ou PDF técnico até 15 MB. Imagens são exibidas no estilo blueprint.',
  },
  model3d: {
    accept: '.glb,.gltf,.obj,.fbx,.stl',
    extensions: ['.glb', '.gltf', '.obj', '.fbx', '.stl'],
    maxSize: 60 * 1024 * 1024,
    helper: 'GLB, GLTF, OBJ, FBX ou STL até 60 MB. Opcional.',
  },
};

const emptyProject = (): Project => ({
  id: Date.now().toString(),
  title: 'Novo Projeto',
  category: 'Comercial',
  type: 'PPCI',
  area: '0 m²',
  location: 'Betim, Minas Gerais',
  description: 'Descrição do projeto.',
  image: '',
  beforeImage: '',
  floorPlan2d: '',
  features: ['Sistema implementado'],
  status: 'Em Execução',
  year: new Date().getFullYear().toString(),
  buildingType: '',
  systems: [],
  evacuationTime: '',
  riskLevel: 'Médio',
  hydrants: 0,
  exits: 0,
  sprinklers: 0,
  approvalStatus: 'Em análise',
  model3d: '',
});

function fileExtension(name: string) {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot).toLowerCase();
}

function validateLocalFile(file: File, kind: UploadKind) {
  const spec = uploadSpecs[kind];
  if (!spec.extensions.includes(fileExtension(file.name))) {
    throw new Error(`Formato inválido. Use: ${spec.extensions.join(', ').replace(/\./g, '').toUpperCase()}.`);
  }
  if (file.size > spec.maxSize) {
    throw new Error(`Arquivo muito grande. Limite: ${Math.round(spec.maxSize / 1024 / 1024)} MB.`);
  }
}

async function uploadFile(file: File, kind: UploadKind): Promise<UploadResult> {
  validateLocalFile(file, kind);
  const formData = new FormData();
  formData.append('kind', kind);
  formData.append('file', file);

  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  if (!res.ok) {
    const data = await res.json().catch(() => null) as { error?: string } | null;
    throw new Error(data?.error ?? 'Não foi possível enviar o arquivo.');
  }
  return res.json() as Promise<UploadResult>;
}

function BlueprintPreview({ src, compact = false }: { src: string; compact?: boolean }) {
  const isPdf = src.toLowerCase().split('?')[0].endsWith('.pdf');

  return (
    <div className={`relative mt-3 ${compact ? 'h-36' : 'aspect-video'} rounded-lg overflow-hidden bg-[#0a1628] border border-blue-500/20`}>
      <div className="absolute inset-0 blueprint-bg opacity-80" />
      {isPdf ? (
        <object data={src} type="application/pdf" className="absolute inset-3 w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)] blueprint-plan-document">
          <a href={src} target="_blank" rel="noreferrer" className="relative z-10 text-blue-300 text-sm">Abrir planta 2D</a>
        </object>
      ) : (
        <img src={src} alt="Prévia da planta 2D" className="absolute inset-0 w-full h-full object-contain p-5 blueprint-plan-image" />
      )}
      <div className="absolute top-3 left-3 px-2 py-1 rounded bg-[#0a1628]/80 border border-blue-500/20 text-mono text-[10px] text-blue-300">
        PLANTA 2D
      </div>
    </div>
  );
}

function UploadField({
  label,
  value,
  fileName,
  kind,
  required = false,
  preview = 'image',
  onUploaded,
  onClear,
}: {
  label: string;
  value?: string;
  fileName?: string;
  kind: UploadKind;
  required?: boolean;
  preview?: UploadPreview;
  onUploaded: (file: UploadResult) => void;
  onClear?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const spec = uploadSpecs[kind];

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      onUploaded(await uploadFile(file, kind));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar o arquivo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs text-slate-500 mb-2 flex items-center gap-1">
        {preview === 'model' ? <Box className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="min-w-0">
            <div className="text-sm text-slate-300 truncate">
              {fileName || (value ? 'Arquivo selecionado' : 'Nenhum arquivo selecionado')}
            </div>
            <div className="text-xs text-slate-600 mt-1">{spec.helper}</div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {onClear && value && (
              <button type="button" onClick={onClear} className="px-3 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs transition-colors">
                Remover
              </button>
            )}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 disabled:opacity-60 text-sm transition-colors"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              {uploading ? 'Enviando...' : 'Selecionar'}
            </button>
          </div>
        </div>
        <input ref={inputRef} type="file" accept={spec.accept} onChange={handleChange} className="hidden" />

        {error && (
          <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> {error}
          </p>
        )}

        {value && preview === 'image' && (
          <img src={value} alt="Prévia" className="mt-3 w-full h-36 object-cover rounded-lg border border-white/10" />
        )}
        {value && preview === 'blueprint' && <BlueprintPreview src={value} compact />}
        {value && preview === 'model' && (
          <div className="mt-3 rounded-lg border border-blue-500/15 bg-[#0a1628] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5 text-blue-300" />
            </div>
            <div className="min-w-0">
              <div className="text-sm text-white truncate">{fileName || 'Modelo 3D enviado'}</div>
              <a href={value} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300">Abrir arquivo</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function validateProjects(projects: Project[]) {
  const invalid = projects.find(project => (
    !project.title.trim() || !project.image || !project.beforeImage || !project.floorPlan2d
  ));

  if (!invalid) return '';
  return `Revise o projeto "${invalid.title || 'sem título'}": imagem principal, imagem antes e planta 2D são obrigatórias.`;
}

function LoginPanel({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null) as { error?: string } | null;
        throw new Error(data?.error ?? 'Senha inválida.');
      }
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-24 min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="glass-card p-8 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Lock className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-white font-bold">Acesso Restrito</h1>
            <p className="text-xs text-slate-500">Área do Engenheiro</p>
          </div>
        </div>

        <label className="block text-sm text-slate-400 mb-1">Senha</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Digite a senha administrativa"
          required
          className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all text-sm ${error ? 'border-red-500/50 focus:ring-red-500/40' : 'border-white/10 focus:ring-amber-500/40 focus:border-amber-500/40'}`}
        />
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

        <button type="submit" disabled={loading} className="w-full mt-5 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}

export default function AdminPage() {
  const [authState, setAuthState] = useState<AuthState>('checking');

  useEffect(() => {
    let alive = true;
    fetch('/api/admin/session')
      .then(res => res.ok ? res.json() : { authenticated: false })
      .then(data => { if (alive) setAuthState(data.authenticated ? 'authenticated' : 'guest'); })
      .catch(() => { if (alive) setAuthState('guest'); });
    return () => { alive = false; };
  }, []);

  if (authState === 'checking') {
    return (
      <main className="pt-24 min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </main>
    );
  }

  if (authState === 'guest') {
    return <LoginPanel onLogin={() => setAuthState('authenticated')} />;
  }

  return <AdminContent onLogout={() => setAuthState('guest')} />;
}

function AdminContent({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<'engineer' | 'projects'>('engineer');
  const [notice, setNotice] = useState<Notice>(null);
  const [saving, setSaving] = useState<'engineer' | 'projects' | 'reset' | null>(null);
  const [engineer, setEngineer] = useState<Engineer>(DEFAULT_ENGINEER);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    let alive = true;
    loadSiteContent().then(content => {
      if (!alive) return;
      setEngineer(content.engineer);
      setProjects(content.projects);
    });
    return () => { alive = false; };
  }, []);

  const showNotice = (next: Notice) => {
    setNotice(next);
    if (next?.type === 'success') {
      window.setTimeout(() => setNotice(null), 2500);
    }
  };

  const persist = async (area: 'engineer' | 'projects' | 'reset', nextProjects = projects, nextEngineer = engineer) => {
    setSaving(area);
    showNotice(null);
    try {
      const saved = await saveSiteContent({ projects: nextProjects, engineer: nextEngineer });
      setProjects(saved.projects);
      setEngineer(saved.engineer);
      setEditingProject(current => current ? saved.projects.find(project => project.id === current.id) ?? null : null);
      showNotice({ type: 'success', message: 'Dados salvos com sucesso.' });
    } catch (err) {
      showNotice({ type: 'error', message: err instanceof Error ? err.message : 'Não foi possível salvar.' });
    } finally {
      setSaving(null);
    }
  };

  const handleSaveEngineer = () => {
    void persist('engineer');
  };

  const handleSaveProjects = () => {
    const validation = validateProjects(projects);
    if (validation) {
      showNotice({ type: 'error', message: validation });
      return;
    }
    void persist('projects');
  };

  const handleReset = () => {
    if (!confirm('Restaurar todos os dados padrão? Todas as edições serão perdidas.')) return;
    resetAll();
    void persist('reset', DEFAULT_PROJECTS, DEFAULT_ENGINEER);
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => null);
    onLogout();
  };

  const addProject = () => {
    const np = emptyProject();
    setProjects(prev => [...prev, np]);
    setEditingProject(np);
  };

  const removeProject = (id: string) => {
    if (!confirm('Remover este projeto?')) return;
    setProjects(prev => prev.filter(p => p.id !== id));
    if (editingProject?.id === id) setEditingProject(null);
  };

  const updateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    setEditingProject(updated);
  };

  return (
    <main className="pt-24 min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="section-label">Área do Engenheiro</span>
            <h1 className="mt-4 text-3xl font-bold text-white">Editar Projetos</h1>
            <p className="text-slate-500 text-sm mt-1">Dados e arquivos salvos no servidor local do projeto</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={handleReset} disabled={saving === 'reset'} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 disabled:opacity-60 transition-colors text-sm">
              {saving === 'reset' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Restaurar Padrão
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>

        {notice && (
          <div className={`mb-6 rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ${notice.type === 'success' ? 'border-green-500/20 bg-green-500/10 text-green-300' : 'border-red-500/20 bg-red-500/10 text-red-300'}`}>
            {notice.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {notice.message}
          </div>
        )}

        <div className="flex gap-1 mb-8 bg-white/5 p-1 rounded-xl w-fit">
          <button onClick={() => setTab('engineer')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'engineer' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            <User className="w-4 h-4" /> Engenheiro
          </button>
          <button onClick={() => setTab('projects')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'projects' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            <FolderOpen className="w-4 h-4" /> Projetos ({projects.length})
          </button>
        </div>

        {tab === 'engineer' && (
          <div className="glass-card p-8 max-w-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-400" /> Dados do Engenheiro
            </h2>
            <div className="space-y-5">
              {[
                { label: 'Nome Completo', key: 'name' as const },
                { label: 'Especialização', key: 'specialization' as const },
                { label: 'CREA', key: 'crea' as const },
                { label: 'Localização', key: 'location' as const },
                { label: 'WhatsApp (somente números)', key: 'whatsapp' as const },
                { label: 'Instagram (com @)', key: 'instagram' as const },
                { label: 'E-mail', key: 'email' as const },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm text-slate-400 mb-1">{f.label}</label>
                  <input
                    type="text"
                    value={engineer[f.key] as string}
                    onChange={e => setEngineer(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Biografia</label>
                <textarea
                  rows={4}
                  value={engineer.bio}
                  onChange={e => setEngineer(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-none"
                />
              </div>
              <UploadField
                label="Foto de Perfil"
                value={engineer.photo}
                kind="image"
                preview="image"
                onUploaded={file => setEngineer(prev => ({ ...prev, photo: file.url }))}
              />
              <div className="grid grid-cols-3 gap-4">
                {(['projects', 'years', 'clients'] as const).map(k => (
                  <div key={k}>
                    <label className="block text-xs text-slate-500 mb-1 capitalize">{k === 'projects' ? 'Projetos' : k === 'years' ? 'Anos' : 'Clientes'}</label>
                    <input
                      type="number"
                      value={engineer.stats[k]}
                      onChange={e => setEngineer(prev => ({ ...prev, stats: { ...prev.stats, [k]: Number(e.target.value) } }))}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                    />
                  </div>
                ))}
              </div>
              <button onClick={handleSaveEngineer} disabled={saving === 'engineer'} className="btn-glow w-full justify-center">
                {saving === 'engineer' ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><Save className="w-4 h-4" /> Salvar Alterações</>}
              </button>
            </div>
          </div>
        )}

        {tab === 'projects' && (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <button onClick={addProject} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-blue-500/30 text-blue-400 hover:bg-blue-500/5 transition-colors text-sm">
                <Plus className="w-4 h-4" /> Adicionar Novo Projeto
              </button>
              {projects.map(p => (
                <div
                  key={p.id}
                  className={`relative rounded-xl border p-4 cursor-pointer transition-all ${editingProject?.id === p.id ? 'border-blue-500/40 bg-blue-500/5' : 'border-white/10 bg-white/3 hover:border-white/20'}`}
                  onClick={() => setEditingProject(p)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-white text-sm font-medium truncate">{p.title}</div>
                      <div className="text-slate-500 text-xs mt-1">{p.category} · {p.area}</div>
                      {!p.floorPlan2d && (
                        <div className="text-red-400 text-xs mt-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Planta 2D pendente
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={e => { e.stopPropagation(); setEditingProject(p); }} className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-colors" aria-label="Editar projeto">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); removeProject(p.id); }} className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors" aria-label="Remover projeto">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={handleSaveProjects} disabled={saving === 'projects'} className="w-full btn-glow justify-center mt-2">
                {saving === 'projects' ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><Save className="w-4 h-4" /> Salvar Projetos</>}
              </button>
            </div>

            {editingProject ? (
              <div className="lg:col-span-3 glass-card p-6 space-y-4 overflow-y-auto max-h-[80vh]">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">Editando: {editingProject.title}</h3>
                  <button onClick={() => setEditingProject(null)} className="text-slate-500 hover:text-white" aria-label="Fechar editor">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Título', key: 'title' },
                    { label: 'Categoria', key: 'category' },
                    { label: 'Tipo de Sistema', key: 'type' },
                    { label: 'Área Protegida', key: 'area' },
                    { label: 'Localização', key: 'location' },
                    { label: 'Tipo de Edificação', key: 'buildingType' },
                    { label: 'Status', key: 'status' },
                    { label: 'Ano', key: 'year' },
                    { label: 'Nível de Risco', key: 'riskLevel' },
                    { label: 'Tempo de Evacuação', key: 'evacuationTime' },
                    { label: 'Status de Aprovação', key: 'approvalStatus' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                      <input
                        type="text"
                        value={(editingProject as unknown as Record<string, unknown>)[f.key] as string ?? ''}
                        onChange={e => updateProject({ ...editingProject, [f.key]: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                      />
                    </div>
                  ))}
                  {[
                    { label: 'Hidrantes', key: 'hydrants' },
                    { label: 'Saídas', key: 'exits' },
                    { label: 'Sprinklers', key: 'sprinklers' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                      <input
                        type="number"
                        value={(editingProject as unknown as Record<string, unknown>)[f.key] as number ?? 0}
                        onChange={e => updateProject({ ...editingProject, [f.key]: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Descrição</label>
                  <textarea
                    rows={3}
                    value={editingProject.description}
                    onChange={e => updateProject({ ...editingProject, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <UploadField
                    label="Imagem Principal"
                    value={editingProject.image}
                    fileName={editingProject.imageName}
                    kind="image"
                    required
                    preview="image"
                    onUploaded={file => updateProject({ ...editingProject, image: file.url, imageName: file.originalName })}
                  />
                  <UploadField
                    label="Imagem Antes"
                    value={editingProject.beforeImage}
                    fileName={editingProject.beforeImageName}
                    kind="image"
                    required
                    preview="image"
                    onUploaded={file => updateProject({ ...editingProject, beforeImage: file.url, beforeImageName: file.originalName })}
                  />
                </div>

                <UploadField
                  label="Planta 2D do Projeto"
                  value={editingProject.floorPlan2d}
                  fileName={editingProject.floorPlan2dName}
                  kind="plan2d"
                  required
                  preview="blueprint"
                  onUploaded={file => updateProject({ ...editingProject, floorPlan2d: file.url, floorPlan2dName: file.originalName })}
                />

                <UploadField
                  label="Planta 3D / Modelo 3D"
                  value={editingProject.model3d}
                  fileName={editingProject.model3dName}
                  kind="model3d"
                  preview="model"
                  onUploaded={file => updateProject({ ...editingProject, model3d: file.url, model3dName: file.originalName, model3dType: file.type })}
                  onClear={() => updateProject({ ...editingProject, model3d: '', model3dName: '', model3dType: '' })}
                />

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Sistemas/Características (uma por linha)</label>
                  <textarea
                    rows={4}
                    value={editingProject.features.join('\n')}
                    onChange={e => updateProject({ ...editingProject, features: e.target.value.split('\n').filter(Boolean) })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Normas Técnicas (uma por linha)</label>
                  <textarea
                    rows={3}
                    value={(editingProject.systems ?? []).join('\n')}
                    onChange={e => updateProject({ ...editingProject, systems: e.target.value.split('\n').filter(Boolean) })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="lg:col-span-3 glass-card p-12 flex flex-col items-center justify-center text-slate-500">
                <FileImage className="w-12 h-12 mb-4 opacity-30" />
                <p>Selecione um projeto para editar</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
