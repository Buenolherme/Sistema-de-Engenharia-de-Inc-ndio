import { useEffect, useState } from 'react';

// ============================================================
// IZ CODE — Dados do Sistema
// Editáveis via Área do Engenheiro
// ============================================================

export interface Project {
  id: string;
  title: string;
  category: string;
  type: string;
  area: string;
  location: string;
  description: string;
  image: string;
  beforeImage: string;
  imageName?: string;
  beforeImageName?: string;
  floorPlan2d: string;
  floorPlan2dName?: string;
  galleryImages?: string[];
  galleryImageNames?: string[];
  features: string[];
  status?: string;
  year?: string;
  buildingType?: string;
  systems?: string[];
  evacuationTime?: string;
  riskLevel?: string;
  hydrants?: number;
  exits?: number;
  sprinklers?: number;
  approvalStatus?: string;
  model3d?: string;
  model3dName?: string;
  model3dType?: string;
}

export interface Engineer {
  name: string;
  specialization: string;
  crea: string;
  bio: string;
  softwares: string[];
  stats: { projects: number; years: number; clients: number };
  location: string;
  whatsapp: string;
  instagram: string;
  email: string;
  photo: string;
}

export interface SiteContent {
  projects: Project[];
  engineer: Engineer;
}

export const DEFAULT_BLUEPRINT = '/assets/blueprints/default-plan.svg';

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: '1', title: 'Torre Corporativa Alpha', category: 'Comercial', type: 'PPCI + Sprinklers',
    area: '12.500 m²', location: 'Betim, Minas Gerais',
    description: 'Projeto completo de proteção contra incêndio para edifício corporativo de 25 andares, incluindo sistema de sprinklers, hidrantes, rotas de fuga e sinalização de emergência. Aprovado pelo Corpo de Bombeiros de Minas Gerais conforme NBR vigente.',
    image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
    beforeImage: 'https://images.pexels.com/photos/3729556/pexels-photo-3729556.jpeg?auto=compress&cs=tinysrgb&w=800',
    floorPlan2d: DEFAULT_BLUEPRINT,
    features: ['Sprinklers automatizados', '4 rotas de fuga', '18 hidrantes', 'Portas corta-fogo', 'Sinalização fotoluminescente'],
    status: 'Concluído', year: '2024', buildingType: 'Edifício Corporativo — 25 pavimentos',
    systems: ['Sprinklers NBR 10897', 'Hidrantes NBR 13714', 'Saídas NBR 9077', 'Sinalização NBR 13434'],
    evacuationTime: '4 min 30 s', riskLevel: 'Alto', hydrants: 18, exits: 4, sprinklers: 312,
    approvalStatus: 'Aprovado — CBMMG 2024', model3d: '',
  },
  {
    id: '2', title: 'Centro Logístico Industrial', category: 'Industrial', type: 'Hidrantes + PPCI',
    area: '28.000 m²', location: 'Betim, Minas Gerais',
    description: 'Sistema de proteção contra incêndio para galpão logístico de grande porte, com ênfase em hidrantes e plano de prevenção e combate a incêndios. Projeto dimensionado para carga de incêndio elevada.',
    image: 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800',
    beforeImage: 'https://images.pexels.com/photos/3452173/pexels-photo-3452173.jpeg?auto=compress&cs=tinysrgb&w=800',
    floorPlan2d: DEFAULT_BLUEPRINT,
    features: ['Rede de hidrantes', 'PPCI aprovado', 'Saídas de emergência', 'Iluminação de emergência', 'Brigada treinada'],
    status: 'Concluído', year: '2023', buildingType: 'Galpão Logístico Industrial',
    systems: ['Hidrantes NBR 13714', 'PPCI completo', 'Iluminação NBR 10898', 'Brigada NBR 14276'],
    evacuationTime: '6 min 15 s', riskLevel: 'Muito Alto', hydrants: 32, exits: 8, sprinklers: 0,
    approvalStatus: 'Aprovado — CBMMG 2023', model3d: '',
  },
  {
    id: '3', title: 'Residencial Parque das Torres', category: 'Residencial', type: 'Saídas de Emergência',
    area: '8.200 m²', location: 'Betim, Minas Gerais',
    description: 'Projeto de segurança contra incêndio para condomínio residencial de alto padrão, com foco em rotas de fuga e sistemas de sinalização. Dimensionamento completo de escadas enclausuradas e pressurizadas.',
    image: 'https://images.pexels.com/photos/1546168/pexels-photo-1546168.jpeg?auto=compress&cs=tinysrgb&w=800',
    beforeImage: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800',
    floorPlan2d: DEFAULT_BLUEPRINT,
    features: ['6 escadas enclausuradas', 'Sinalização de emergência', 'Iluminação autônoma', 'Portas corta-fogo', 'Pressurização de escadas'],
    status: 'Concluído', year: '2024', buildingType: 'Condomínio Residencial — 18 pavimentos',
    systems: ['Escadas pressurizadas NBR 11742', 'Sinalização NBR 13434', 'Iluminação NBR 10898'],
    evacuationTime: '3 min 45 s', riskLevel: 'Médio', hydrants: 6, exits: 6, sprinklers: 0,
    approvalStatus: 'Aprovado — CBMMG 2024', model3d: '',
  },
  {
    id: '4', title: 'Hospital Central Beta', category: 'Saúde', type: 'PPCI Completo',
    area: '15.800 m²', location: 'Betim, Minas Gerais',
    description: 'Projeto completo de segurança contra incêndio para hospital de grande porte, com requisitos especiais para áreas de internação e centro cirúrgico. Atende às normas específicas para ocupações de saúde.',
    image: 'https://images.pexels.com/photos/236698/pexels-photo-236698.jpeg?auto=compress&cs=tinysrgb&w=800',
    beforeImage: 'https://images.pexels.com/photos/1438761/pexels-photo-1438761.jpeg?auto=compress&cs=tinysrgb&w=800',
    floorPlan2d: DEFAULT_BLUEPRINT,
    features: ['Sprinklers hospitalares', 'Pressurização de escadas', 'Detecção de fumaça', 'Sistema de voz', 'Rotas acessíveis'],
    status: 'Em Execução', year: '2025', buildingType: 'Hospital — 8 pavimentos',
    systems: ['Sprinklers NBR 10897', 'Detecção NBR 17240', 'Sistema de voz', 'Rotas acessíveis NBR 9050'],
    evacuationTime: '7 min 00 s', riskLevel: 'Alto', hydrants: 22, exits: 10, sprinklers: 480,
    approvalStatus: 'Em análise — CBMMG 2025', model3d: '',
  },
  {
    id: '5', title: 'Shopping Center Oeste', category: 'Comercial', type: 'Sprinklers + Sinalização',
    area: '45.000 m²', location: 'Betim, Minas Gerais',
    description: 'Sistema integrado de proteção contra incêndio para shopping center, com cobertura completa de sprinklers e sinalização inteligente. Projeto de maior complexidade técnica com central de monitoramento 24 horas.',
    image: 'https://images.pexels.com/photos/373912/pexels-photo-373912.jpeg?auto=compress&cs=tinysrgb&w=800',
    beforeImage: 'https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=800',
    floorPlan2d: DEFAULT_BLUEPRINT,
    features: ['Sprinklers em toda área', 'Sinalização dinâmica', '12 rotas de fuga', 'Central de monitoramento', 'Brigada interna'],
    status: 'Concluído', year: '2022', buildingType: 'Shopping Center — 3 pisos',
    systems: ['Sprinklers NBR 10897', 'Hidrantes NBR 13714', 'Detecção NBR 17240', 'Sinalização dinâmica'],
    evacuationTime: '5 min 00 s', riskLevel: 'Alto', hydrants: 48, exits: 12, sprinklers: 1240,
    approvalStatus: 'Aprovado — CBMMG 2022', model3d: '',
  },
  {
    id: '6', title: 'Indústria Química Gamma', category: 'Industrial', type: 'Laudos + Regularização',
    area: '22.000 m²', location: 'Betim, Minas Gerais',
    description: 'Projeto especializado para indústria química, incluindo laudos técnicos, regularização junto ao Corpo de Bombeiros e sistemas de combate a incêndio. Atende às normas para armazenamento de produtos químicos perigosos.',
    image: 'https://images.pexels.com/photos/110810/pexels-photo-110810.jpeg?auto=compress&cs=tinysrgb&w=800',
    beforeImage: 'https://images.pexels.com/photos/3939099/pexels-photo-3939099.jpeg?auto=compress&cs=tinysrgb&w=800',
    floorPlan2d: DEFAULT_BLUEPRINT,
    features: ['Laudos técnicos', 'Regularização CB', 'Sistema de espuma', 'Detecção de gases', 'Plano de emergência'],
    status: 'Concluído', year: '2023', buildingType: 'Indústria Química',
    systems: ['Sistema de espuma NBR 12615', 'Detecção de gases', 'Hidrantes NBR 13714', 'Laudo técnico ART'],
    evacuationTime: '8 min 30 s', riskLevel: 'Muito Alto', hydrants: 28, exits: 6, sprinklers: 0,
    approvalStatus: 'Aprovado — CBMMG 2023', model3d: '',
  },
];

export const SERVICES = [
  { title: 'PPCI', desc: 'Plano de Prevenção e Combate a Incêndio completo, conforme normas técnicas vigentes.', icon: 'shield' },
  { title: 'Saídas de Emergência', desc: 'Dimensionamento e projeto de rotas de fuga e saídas de emergência seguras.', icon: 'exit' },
  { title: 'Hidrantes', desc: 'Projeto de sistema de hidrantes com dimensionamento hidráulico preciso.', icon: 'droplet' },
  { title: 'Sprinklers', desc: 'Sistemas automatizados de chuveiros para combate a incêndio.', icon: 'cloud-rain' },
  { title: 'Sinalização', desc: 'Sinalização de emergência e fotoluminescente conforme NBR 13434.', icon: 'signpost' },
  { title: 'Regularização CB', desc: 'Regularização e aprovação de projetos junto ao Corpo de Bombeiros.', icon: 'badge-check' },
  { title: 'Laudos Técnicos', desc: 'Emissão de laudos técnicos e ART para projetos de segurança contra incêndio.', icon: 'file-text' },
  { title: 'Projetos Comerciais', desc: 'Projetos especializados para edificações comerciais e corporativas.', icon: 'building' },
  { title: 'Projetos Industriais', desc: 'Soluções para galpões, fábricas e áreas industriais de grande porte.', icon: 'factory' },
  { title: 'Projetos Residenciais', desc: 'Projetos para condomínios e edifícios residenciais de todos os portes.', icon: 'home' },
];

export const DEFAULT_ENGINEER: Engineer = {
  name: 'Eng. Bruno Rodrigues',
  specialization: 'Engenharia de Segurança Contra Incêndio',
  crea: 'CREA-MG 1234567890',
  bio: 'Engenheiro especializado em segurança contra incêndio com mais de 15 anos de experiência em projetos técnicos para edificações comerciais, industriais e residenciais. Especialista em PPCI, sistemas de proteção passiva e ativa, e regularização junto ao Corpo de Bombeiros. Atuando em Minas Gerais com excelência técnica.',
  softwares: ['AutoCAD', 'Revit MEP', 'CypeCAD', 'Hydra', 'ProjectWise', 'Navisworks'],
  stats: { projects: 180, years: 15, clients: 120 },
  location: 'Betim, Minas Gerais',
  whatsapp: '5531999990000',
  instagram: '@izcode.eng',
  email: 'contato@izcode.com.br',
  photo: 'https://images.pexels.com/photos/3760529/pexels-photo-3760529.jpeg?auto=compress&cs=tinysrgb&w=800',
};

// ── local persistence + API helpers ────────────────────────
const PROJECTS_KEY = 'izcode_projects';
const ENGINEER_KEY = 'izcode_engineer';
const CONTENT_EVENT = 'izcode_content_updated';

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    if (!hasStorage()) return fallback;
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function normalizeProject(project: Project): Project {
  return {
    ...project,
    image: project.image ?? '',
    beforeImage: project.beforeImage ?? '',
    floorPlan2d: project.floorPlan2d ?? DEFAULT_BLUEPRINT,
    galleryImages: Array.isArray(project.galleryImages) ? project.galleryImages : [],
    galleryImageNames: Array.isArray(project.galleryImageNames) ? project.galleryImageNames : [],
    features: Array.isArray(project.features) ? project.features : [],
    systems: Array.isArray(project.systems) ? project.systems : [],
    model3d: project.model3d ?? '',
  };
}

function normalizeContent(content: Partial<SiteContent>): SiteContent {
  return {
    projects: Array.isArray(content.projects) && content.projects.length > 0
      ? content.projects.map(normalizeProject)
      : DEFAULT_PROJECTS,
    engineer: content.engineer
      ? { ...DEFAULT_ENGINEER, ...content.engineer, stats: { ...DEFAULT_ENGINEER.stats, ...content.engineer.stats } }
      : DEFAULT_ENGINEER,
  };
}

function cacheContent(content: SiteContent): void {
  if (!hasStorage()) return;
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(content.projects));
  localStorage.setItem(ENGINEER_KEY, JSON.stringify(content.engineer));
  window.dispatchEvent(new Event(CONTENT_EVENT));
}

export function getProjects(): Project[] {
  return loadFromStorage<Project[]>(PROJECTS_KEY, DEFAULT_PROJECTS).map(normalizeProject);
}
export async function saveProjects(p: Project[]): Promise<SiteContent> {
  return saveSiteContent({ projects: p.map(normalizeProject), engineer: getEngineer() });
}
export function getEngineer(): Engineer {
  return normalizeContent({ engineer: loadFromStorage(ENGINEER_KEY, DEFAULT_ENGINEER) }).engineer;
}
export async function saveEngineer(d: Engineer): Promise<SiteContent> {
  return saveSiteContent({ projects: getProjects(), engineer: d });
}
export function resetAll(): void {
  if (!hasStorage()) return;
  localStorage.removeItem(PROJECTS_KEY);
  localStorage.removeItem(ENGINEER_KEY);
  window.dispatchEvent(new Event(CONTENT_EVENT));
}

export async function loadSiteContent(): Promise<SiteContent> {
  try {
    const res = await fetch('/api/content', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('Falha ao carregar dados');
    const data = await res.json() as Partial<SiteContent>;
    const content = normalizeContent({
      projects: Array.isArray(data.projects) ? data.projects : getProjects(),
      engineer: data.engineer ?? getEngineer(),
    });
    cacheContent(content);
    return content;
  } catch {
    return { projects: getProjects(), engineer: getEngineer() };
  }
}

export async function saveSiteContent(content: SiteContent): Promise<SiteContent> {
  const normalized = normalizeContent(content);
  const res = await fetch('/api/content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(normalized),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null) as { error?: string } | null;
    throw new Error(data?.error ?? 'Não foi possível salvar os dados.');
  }
  const saved = normalizeContent(await res.json() as SiteContent);
  cacheContent(saved);
  return saved;
}

export function useProjects(): Project[] {
  const [projects, setProjects] = useState<Project[]>(getProjects);

  useEffect(() => {
    let alive = true;
    loadSiteContent().then(content => { if (alive) setProjects(content.projects); });
    const sync = () => setProjects(getProjects());
    window.addEventListener(CONTENT_EVENT, sync);
    return () => {
      alive = false;
      window.removeEventListener(CONTENT_EVENT, sync);
    };
  }, []);

  return projects;
}

export function useEngineer(): Engineer {
  const [engineer, setEngineer] = useState<Engineer>(getEngineer);

  useEffect(() => {
    let alive = true;
    loadSiteContent().then(content => { if (alive) setEngineer(content.engineer); });
    const sync = () => setEngineer(getEngineer());
    window.addEventListener(CONTENT_EVENT, sync);
    return () => {
      alive = false;
      window.removeEventListener(CONTENT_EVENT, sync);
    };
  }, []);

  return engineer;
}

// Exporta dados ao vivo (lê o cache local a cada import)
export const PROJECTS = getProjects();
export const ENGINEER = getEngineer();
