import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function readSeedEnv(name: string) {
  const value = process.env[name];
  return value?.trim() ? value.trim() : "";
}

async function main() {
  await prisma.profile.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      name: "Alex Chen",
      role: "Full-Stack Developer",
      bio: "I build performant web products and write practical engineering notes.",
      school: "National Taiwan University",
      location: "Taipei, Taiwan",
      email: "alex@example.com",
      avatarUrl:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80",
      githubUrl: "https://github.com/example",
      linkedinUrl: "https://linkedin.com/in/example",
      skills: [
        "Next.js",
        "TypeScript",
        "Node.js",
        "PostgreSQL",
        "System Design",
        "Motion UI",
      ],
      projects: [
        {
          name: "Realtime Analytics Dashboard",
          description:
            "A live metrics dashboard with streaming charts and anomaly alerts.",
          url: "https://example.com/analytics",
        },
        {
          name: "Design Token Pipeline",
          description:
            "Automated design token sync from Figma to web and mobile apps.",
          url: "https://example.com/tokens",
        },
      ],
      homepageTexts: {
        heroBadge: "MODERN DARK BLOG SYSTEM",
        primaryCtaLabel: "閱讀最新文章",
        secondaryCtaLabel: "進入後台管理",
        skillsTitle: "技能",
        skillsHint: "可於後台隨時更新",
        projectsTitle: "精選專案",
        postsTitle: "最新文章",
        viewAllPostsLabel: "查看全部",
      },
    },
  });

  await prisma.post.upsert({
    where: { slug: "welcome-to-nebula-notes" },
    update: {},
    create: {
      title: "Welcome to Nebula Notes",
      slug: "welcome-to-nebula-notes",
      excerpt:
        "A personal corner about shipping product, writing code, and building with care.",
      content: `## Hello there\n\nThis blog is powered by **Next.js + Prisma** and built with a modern dark aesthetic.\n\n- Admin-managed posts\n- Secure login flow\n- Fully editable profile section\n\nStay tuned for more deep dives.`,
      tags: ["intro", "engineering", "design"],
      published: true,
      coverImage:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    },
  });

  const adminEmail =
    readSeedEnv("SEED_ADMIN_EMAIL").toLowerCase() || readSeedEnv("ADMIN_EMAIL").toLowerCase();
  const adminPasswordHash =
    readSeedEnv("SEED_ADMIN_PASSWORD_HASH") || readSeedEnv("ADMIN_PASSWORD_HASH");

  if (adminEmail && adminPasswordHash) {
    await prisma.adminUser.upsert({
      where: { email: adminEmail },
      update: { passwordHash: adminPasswordHash },
      create: {
        email: adminEmail,
        passwordHash: adminPasswordHash,
      },
    });
    console.info(`Seeded admin user: ${adminEmail}`);
  } else {
    console.warn("Skip admin seed: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD_HASH in .env");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
