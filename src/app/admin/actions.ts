"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clearAdminSession, requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_HOME_PAGE_TEXTS, toProfileView } from "@/lib/types";

const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3),
  slug: z.string().trim().optional(),
  excerpt: z.string().trim().min(10),
  content: z.string().trim().min(20),
  coverImage: z.union([z.url(), z.literal("")]).optional(),
  tags: z.string().trim().optional(),
});

const heroSchema = z.object({
  siteTitle: z.string().trim().min(2),
  name: z.string().trim().min(2),
  role: z.string().trim().min(2),
  bio: z.string().trim().min(16),
  homepageBadge: z.string().trim().min(2),
  primaryCtaLabel: z.string().trim().min(2),
  secondaryCtaLabel: z.string().trim().min(2),
});

const metaSchema = z.object({
  school: z.string().trim().optional(),
  location: z.string().trim().optional(),
  email: z.union([z.email(), z.literal("")]).optional(),
});

const skillSchema = z.object({
  skill: z.string().trim().min(1),
});

const projectSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().min(8),
  url: z.union([z.url(), z.literal("")]).optional(),
});

const skillsSectionTextSchema = z.object({
  skillsTitle: z.string().trim().min(2),
});

const projectsSectionTextSchema = z.object({
  projectsTitle: z.string().trim().min(2),
});

const postsSectionTextSchema = z.object({
  postsTitle: z.string().trim().min(2),
  viewAllPostsLabel: z.string().trim().min(2),
});

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseList(input?: string | null) {
  if (!input) return [];
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getProfilePayload(profile: ReturnType<typeof toProfileView>) {
  return {
    name: profile.name,
    role: profile.role,
    bio: profile.bio,
    school: profile.school ?? null,
    location: profile.location ?? null,
    email: profile.email ?? null,
    avatarUrl: profile.avatarUrl ?? null,
    githubUrl: profile.githubUrl ?? null,
    linkedinUrl: profile.linkedinUrl ?? null,
    skills: profile.skills,
    projects: profile.projects,
    homepageTexts: profile.homepageTexts,
  };
}

async function getEditableProfile() {
  const raw = await prisma.profile.findUnique({ where: { id: "main" } });
  return toProfileView(raw);
}

function resolveReturnTo(formData: FormData, fallbackPath: string) {
  const value = formData.get("returnTo");
  if (typeof value !== "string") {
    return fallbackPath;
  }

  const trimmed = value.trim();
  return trimmed.startsWith("/admin") ? trimmed : fallbackPath;
}

function withQuery(pathname: string, query: string) {
  return pathname.includes("?") ? `${pathname}&${query}` : `${pathname}?${query}`;
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function createPostAction(formData: FormData) {
  await requireAdminSession();
  const returnTo = resolveReturnTo(formData, "/admin");

  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    coverImage: formData.get("coverImage"),
    tags: formData.get("tags"),
  });

  if (!parsed.success) {
    redirect(withQuery(returnTo, "error=validation"));
  }

  const slug = slugify(parsed.data.slug || parsed.data.title);
  if (!slug) {
    redirect(withQuery(returnTo, "error=slug"));
  }

  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) {
    redirect(withQuery(returnTo, "error=slug_exists"));
  }

  await prisma.post.create({
    data: {
      title: parsed.data.title,
      slug,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      coverImage: parsed.data.coverImage || null,
      tags: parseList(parsed.data.tags),
      published: true,
    },
  });

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/posts");
  revalidatePath("/admin");
  redirect(withQuery(returnTo, "saved=post"));
}

export async function updatePostAction(formData: FormData) {
  await requireAdminSession();
  const returnTo = resolveReturnTo(formData, "/admin");

  const id = formData.get("id");
  if (typeof id !== "string") {
    redirect(withQuery(returnTo, "error=missing_post"));
  }

  const parsed = postSchema.safeParse({
    id,
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    coverImage: formData.get("coverImage"),
    tags: formData.get("tags"),
  });

  if (!parsed.success) {
    redirect(withQuery(returnTo, "error=validation"));
  }

  const slug = slugify(parsed.data.slug || parsed.data.title);
  if (!slug) {
    redirect(withQuery(returnTo, "error=slug"));
  }

  const existing = await prisma.post.findFirst({
    where: {
      slug,
      id: { not: id },
    },
  });

  if (existing) {
    redirect(withQuery(returnTo, "error=slug_exists"));
  }

  await prisma.post.update({
    where: { id },
    data: {
      title: parsed.data.title,
      slug,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      coverImage: parsed.data.coverImage || null,
      tags: parseList(parsed.data.tags),
      published: true,
    },
  });

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/posts");
  revalidatePath("/admin");
  redirect(withQuery(returnTo, "updated=post"));
}

export async function deletePostAction(formData: FormData) {
  await requireAdminSession();
  const returnTo = resolveReturnTo(formData, "/admin");

  const id = formData.get("id");
  if (typeof id !== "string") {
    redirect(withQuery(returnTo, "error=missing_post"));
  }

  await prisma.post.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/posts");
  revalidatePath("/admin");
  redirect(withQuery(returnTo, "deleted=post"));
}

export async function updateHeroSectionAction(formData: FormData) {
  await requireAdminSession();

  const parsed = heroSchema.safeParse({
    siteTitle: readString(formData, "siteTitle"),
    name: formData.get("name"),
    role: formData.get("role"),
    bio: formData.get("bio"),
    homepageBadge: readString(formData, "homepageBadge"),
    primaryCtaLabel: readString(formData, "primaryCtaLabel"),
    secondaryCtaLabel: readString(formData, "secondaryCtaLabel"),
  });

  if (!parsed.success) {
    redirect("/admin?error=validation");
  }

  const profile = await getEditableProfile();

  await prisma.profile.upsert({
    where: { id: "main" },
    update: {
      name: parsed.data.name,
      role: parsed.data.role,
      bio: parsed.data.bio,
      homepageTexts: {
        ...profile.homepageTexts,
        siteTitle: parsed.data.siteTitle,
        heroBadge: parsed.data.homepageBadge,
        primaryCtaLabel: parsed.data.primaryCtaLabel,
        secondaryCtaLabel: parsed.data.secondaryCtaLabel,
      },
    },
    create: {
      id: "main",
      ...getProfilePayload(profile),
      name: parsed.data.name,
      role: parsed.data.role,
      bio: parsed.data.bio,
      homepageTexts: {
        ...DEFAULT_HOME_PAGE_TEXTS,
        siteTitle: parsed.data.siteTitle,
        heroBadge: parsed.data.homepageBadge,
        primaryCtaLabel: parsed.data.primaryCtaLabel,
        secondaryCtaLabel: parsed.data.secondaryCtaLabel,
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?saved=hero");
}

export async function updateMetaSectionAction(formData: FormData) {
  await requireAdminSession();

  const parsed = metaSchema.safeParse({
    school: formData.get("school"),
    location: formData.get("location"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    redirect("/admin?error=validation");
  }

  const profile = await getEditableProfile();

  await prisma.profile.upsert({
    where: { id: "main" },
    update: {
      school: parsed.data.school || null,
      location: parsed.data.location || null,
      email: parsed.data.email || null,
    },
    create: {
      id: "main",
      ...getProfilePayload(profile),
      school: parsed.data.school || null,
      location: parsed.data.location || null,
      email: parsed.data.email || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?saved=meta");
}

export async function updateSkillsSectionTextAction(formData: FormData) {
  await requireAdminSession();

  const parsed = skillsSectionTextSchema.safeParse({
    skillsTitle: readString(formData, "skillsTitle"),
  });

  if (!parsed.success) {
    redirect("/admin?error=validation");
  }

  const profile = await getEditableProfile();

  await prisma.profile.upsert({
    where: { id: "main" },
    update: {
      homepageTexts: {
        ...profile.homepageTexts,
        skillsTitle: parsed.data.skillsTitle,
      },
    },
    create: {
      id: "main",
      ...getProfilePayload(profile),
      homepageTexts: {
        ...profile.homepageTexts,
        skillsTitle: parsed.data.skillsTitle,
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?saved=skills_text");
}

export async function updateProjectsSectionTextAction(formData: FormData) {
  await requireAdminSession();

  const parsed = projectsSectionTextSchema.safeParse({
    projectsTitle: readString(formData, "projectsTitle"),
  });

  if (!parsed.success) {
    redirect("/admin?error=validation");
  }

  const profile = await getEditableProfile();

  await prisma.profile.upsert({
    where: { id: "main" },
    update: {
      homepageTexts: {
        ...profile.homepageTexts,
        projectsTitle: parsed.data.projectsTitle,
      },
    },
    create: {
      id: "main",
      ...getProfilePayload(profile),
      homepageTexts: {
        ...profile.homepageTexts,
        projectsTitle: parsed.data.projectsTitle,
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?saved=projects_text");
}

export async function updatePostsSectionTextAction(formData: FormData) {
  await requireAdminSession();

  const parsed = postsSectionTextSchema.safeParse({
    postsTitle: readString(formData, "postsTitle"),
    viewAllPostsLabel: readString(formData, "viewAllPostsLabel"),
  });

  if (!parsed.success) {
    redirect("/admin?error=validation");
  }

  const profile = await getEditableProfile();

  await prisma.profile.upsert({
    where: { id: "main" },
    update: {
      homepageTexts: {
        ...profile.homepageTexts,
        postsTitle: parsed.data.postsTitle,
        viewAllPostsLabel: parsed.data.viewAllPostsLabel,
      },
    },
    create: {
      id: "main",
      ...getProfilePayload(profile),
      homepageTexts: {
        ...profile.homepageTexts,
        postsTitle: parsed.data.postsTitle,
        viewAllPostsLabel: parsed.data.viewAllPostsLabel,
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?saved=posts_text");
}

export async function addSkillAction(formData: FormData) {
  await requireAdminSession();

  const parsed = skillSchema.safeParse({
    skill: formData.get("skill"),
  });

  if (!parsed.success) {
    redirect("/admin?error=validation");
  }

  const profile = await getEditableProfile();
  const nextSkills = Array.from(new Set([...profile.skills, parsed.data.skill]));

  await prisma.profile.upsert({
    where: { id: "main" },
    update: {
      skills: nextSkills,
    },
    create: {
      id: "main",
      ...getProfilePayload(profile),
      skills: nextSkills,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?saved=skill");
}

export async function deleteSkillAction(formData: FormData) {
  await requireAdminSession();

  const index = Number.parseInt(readString(formData, "index"), 10);
  if (!Number.isInteger(index)) {
    redirect("/admin?error=validation");
  }

  const profile = await getEditableProfile();
  const nextSkills = profile.skills.filter((_, currentIndex) => currentIndex !== index);

  await prisma.profile.upsert({
    where: { id: "main" },
    update: {
      skills: nextSkills,
    },
    create: {
      id: "main",
      ...getProfilePayload(profile),
      skills: nextSkills,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?deleted=skill");
}

export async function addProjectAction(formData: FormData) {
  await requireAdminSession();

  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    url: formData.get("url"),
  });

  if (!parsed.success) {
    redirect("/admin?error=validation");
  }

  const profile = await getEditableProfile();
  const nextProjects = [
    ...profile.projects,
    {
      name: parsed.data.name,
      description: parsed.data.description,
      url: parsed.data.url || undefined,
    },
  ];

  await prisma.profile.upsert({
    where: { id: "main" },
    update: {
      projects: nextProjects,
    },
    create: {
      id: "main",
      ...getProfilePayload(profile),
      projects: nextProjects,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?saved=project");
}

export async function updateProjectAction(formData: FormData) {
  await requireAdminSession();

  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    url: formData.get("url"),
  });

  const index = Number.parseInt(readString(formData, "index"), 10);
  if (!parsed.success || !Number.isInteger(index)) {
    redirect("/admin?error=validation");
  }

  const profile = await getEditableProfile();
  if (index < 0 || index >= profile.projects.length) {
    redirect("/admin?error=validation");
  }

  const nextProjects = profile.projects.map((project, currentIndex) => {
    if (currentIndex !== index) {
      return project;
    }

    return {
      name: parsed.data.name,
      description: parsed.data.description,
      url: parsed.data.url || undefined,
    };
  });

  await prisma.profile.upsert({
    where: { id: "main" },
    update: {
      projects: nextProjects,
    },
    create: {
      id: "main",
      ...getProfilePayload(profile),
      projects: nextProjects,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?updated=project");
}

export async function deleteProjectAction(formData: FormData) {
  await requireAdminSession();

  const index = Number.parseInt(readString(formData, "index"), 10);
  if (!Number.isInteger(index)) {
    redirect("/admin?error=validation");
  }

  const profile = await getEditableProfile();
  const nextProjects = profile.projects.filter((_, currentIndex) => currentIndex !== index);

  await prisma.profile.upsert({
    where: { id: "main" },
    update: {
      projects: nextProjects,
    },
    create: {
      id: "main",
      ...getProfilePayload(profile),
      projects: nextProjects,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?deleted=project");
}
