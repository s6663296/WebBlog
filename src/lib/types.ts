type ProfileRecord = {
  id: string;
  name: string;
  role: string;
  bio: string;
  school: string | null;
  location: string | null;
  email: string | null;
  avatarUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  skills: unknown;
  projects: unknown;
  homepageTexts?: unknown;
};

export type ProjectItem = {
  name: string;
  description: string;
  url?: string;
};

export type HomePageTexts = {
  siteTitle: string;
  heroBadge: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  skillsTitle: string;
  skillsHint: string;
  projectsTitle: string;
  postsTitle: string;
  viewAllPostsLabel: string;
};

export const DEFAULT_HOME_PAGE_TEXTS: HomePageTexts = {
  siteTitle: "Nebula Notes",
  heroBadge: "MODERN DARK BLOG SYSTEM",
  primaryCtaLabel: "閱讀最新文章",
  secondaryCtaLabel: "進入後台管理",
  skillsTitle: "技能",
  skillsHint: "可於後台隨時更新",
  projectsTitle: "精選專案",
  postsTitle: "最新文章",
  viewAllPostsLabel: "查看全部",
};

export type ProfileView = {
  id: string;
  name: string;
  role: string;
  bio: string;
  school?: string;
  location?: string;
  email?: string;
  avatarUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  skills: string[];
  projects: ProjectItem[];
  homepageTexts: HomePageTexts;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asString(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function asProjectArray(value: unknown): ProjectItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const projects: ProjectItem[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const record = item as Record<string, unknown>;
    if (typeof record.name !== "string" || typeof record.description !== "string") {
      continue;
    }

    projects.push({
      name: record.name,
      description: record.description,
      url: typeof record.url === "string" ? record.url : undefined,
    });
  }

  return projects;
}

function asHomePageTexts(value: unknown): HomePageTexts {
  const record = asRecord(value);

  if (!record) {
    return { ...DEFAULT_HOME_PAGE_TEXTS };
  }

  return {
    siteTitle: asString(record.siteTitle, DEFAULT_HOME_PAGE_TEXTS.siteTitle),
    heroBadge: asString(record.heroBadge, DEFAULT_HOME_PAGE_TEXTS.heroBadge),
    primaryCtaLabel: asString(record.primaryCtaLabel, DEFAULT_HOME_PAGE_TEXTS.primaryCtaLabel),
    secondaryCtaLabel: asString(record.secondaryCtaLabel, DEFAULT_HOME_PAGE_TEXTS.secondaryCtaLabel),
    skillsTitle: asString(record.skillsTitle, DEFAULT_HOME_PAGE_TEXTS.skillsTitle),
    skillsHint: asString(record.skillsHint, DEFAULT_HOME_PAGE_TEXTS.skillsHint),
    projectsTitle: asString(record.projectsTitle, DEFAULT_HOME_PAGE_TEXTS.projectsTitle),
    postsTitle: asString(record.postsTitle, DEFAULT_HOME_PAGE_TEXTS.postsTitle),
    viewAllPostsLabel: asString(record.viewAllPostsLabel, DEFAULT_HOME_PAGE_TEXTS.viewAllPostsLabel),
  };
}

export function toProfileView(profile: ProfileRecord | null): ProfileView {
  if (!profile) {
    return {
      id: "main",
      name: "Your Name",
      role: "Developer",
      bio: "Write your profile in the admin panel.",
      skills: [],
      projects: [],
      homepageTexts: { ...DEFAULT_HOME_PAGE_TEXTS },
    };
  }

  return {
    id: profile.id,
    name: profile.name,
    role: profile.role,
    bio: profile.bio,
    school: profile.school ?? undefined,
    location: profile.location ?? undefined,
    email: profile.email ?? undefined,
    avatarUrl: profile.avatarUrl ?? undefined,
    githubUrl: profile.githubUrl ?? undefined,
    linkedinUrl: profile.linkedinUrl ?? undefined,
    skills: asStringArray(profile.skills),
    projects: asProjectArray(profile.projects),
    homepageTexts: asHomePageTexts(profile.homepageTexts),
  };
}
