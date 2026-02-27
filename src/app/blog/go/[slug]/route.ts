import { NextResponse } from "next/server";
import { recordPostClickBySlug } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

type BlogGoRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: BlogGoRouteProps) {
  const { slug } = await params;
  const post = await prisma.post.findFirst({
    where: {
      slug,
      published: true,
    },
    select: { slug: true },
  });

  if (!post) {
    return NextResponse.redirect(new URL("/blog", request.url));
  }

  await recordPostClickBySlug(slug);
  return NextResponse.redirect(new URL(`/blog/${slug}`, request.url));
}
