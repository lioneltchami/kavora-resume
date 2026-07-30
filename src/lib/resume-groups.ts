export interface DashboardResume {
  slug: string;
  name: string;
  savedAt: string;
  paletteId?: string;
  label?: string;
  parentSlug?: string;
}

export interface ResumeGroup {
  parent: DashboardResume;
  children: DashboardResume[];
}

export function groupResumesForDashboard(
  resumes: DashboardResume[],
): ResumeGroup[] {
  const bySlug = new Map(resumes.map((r) => [r.slug, r]));
  const childrenByParent = new Map<string, DashboardResume[]>();
  const roots: DashboardResume[] = [];

  for (const resume of resumes) {
    const parentSlug = resume.parentSlug?.trim();
    if (parentSlug && bySlug.has(parentSlug) && parentSlug !== resume.slug) {
      const list = childrenByParent.get(parentSlug) ?? [];
      list.push(resume);
      childrenByParent.set(parentSlug, list);
    } else {
      roots.push(resume);
    }
  }

  const sortBySaved = (a: DashboardResume, b: DashboardResume) =>
    new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();

  return roots.sort(sortBySaved).map((parent) => ({
    parent,
    children: (childrenByParent.get(parent.slug) ?? []).sort(sortBySaved),
  }));
}

export function portfolioSlugForResume(resume: {
  slug: string;
  parentSlug?: string;
}): string {
  const parent = resume.parentSlug?.trim();
  return parent || resume.slug;
}
