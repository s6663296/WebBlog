import { prisma } from "@/lib/prisma";

function uniqueNonEmpty(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

export async function recordPostImpressions(postIds: string[]) {
  const ids = uniqueNonEmpty(postIds);
  if (ids.length === 0) {
    return;
  }

  await prisma.post.updateMany({
    where: {
      id: { in: ids },
      published: true,
    },
    data: {
      impressionCount: { increment: 1 },
    },
  });
}

export async function recordPostClickBySlug(slug: string) {
  await prisma.post.updateMany({
    where: {
      slug,
      published: true,
    },
    data: {
      clickCount: { increment: 1 },
    },
  });
}

export async function recordPostViewBySlug(slug: string) {
  await prisma.post.updateMany({
    where: {
      slug,
      published: true,
    },
    data: {
      viewCount: { increment: 1 },
    },
  });
}
