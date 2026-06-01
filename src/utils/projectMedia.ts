import type { Project } from './data';

export type ProjectCoverKind = 'image' | 'plan';

export interface ProjectCover {
  src: string;
  kind: ProjectCoverKind;
}

export function cleanMediaSource(src?: string) {
  return (src ?? '').trim();
}

export function isPdfSource(src?: string) {
  return cleanMediaSource(src).split('?')[0].toLowerCase().endsWith('.pdf');
}

export function getProjectCover(project: Pick<Project, 'image' | 'floorPlan2d'>): ProjectCover {
  const image = cleanMediaSource(project.image);
  if (image) return { src: image, kind: 'image' };

  return {
    src: cleanMediaSource(project.floorPlan2d),
    kind: 'plan',
  };
}
