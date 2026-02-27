import { prisma } from "@/lib/prisma";
import { toProfileView } from "@/lib/types";

export async function getHomeData() {
  const [profile, posts] = await Promise.all([
    prisma.profile.findUnique({ where: { id: "main" } }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    profile: toProfileView(profile),
    posts,
  };
}

export async function getAllPublishedPosts() {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPublishedPostBySlug(slug: string) {
  return prisma.post.findFirst({
    where: { slug, published: true },
  });
}
