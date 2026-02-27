import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { DEFAULT_HOME_PAGE_TEXTS } from "@/lib/types";

function readSiteTitle(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return DEFAULT_HOME_PAGE_TEXTS.siteTitle;
  }

  const title = (value as Record<string, unknown>).siteTitle;
  if (typeof title !== "string") {
    return DEFAULT_HOME_PAGE_TEXTS.siteTitle;
  }

  const trimmed = title.trim();
  return trimmed || DEFAULT_HOME_PAGE_TEXTS.siteTitle;
}

export const getSiteTitle = cache(async () => {
  const profile = await prisma.profile.findUnique({ where: { id: "main" } });
  return readSiteTitle((profile as { homepageTexts?: unknown } | null)?.homepageTexts);
});
