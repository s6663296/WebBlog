import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BCRYPT_HASH_PREFIX = /^\$2[aby]\$/;

async function main() {
  const rawEmail = process.argv[2];
  const rawPasswordOrHash = process.argv[3];

  if (!rawEmail || !rawPasswordOrHash) {
    console.error('Usage: npm run admin:upsert -- <email> <password-or-bcrypt-hash>');
    process.exit(1);
  }

  const email = rawEmail.trim().toLowerCase();
  if (!email) {
    console.error("Email cannot be empty.");
    process.exit(1);
  }

  const passwordHash = BCRYPT_HASH_PREFIX.test(rawPasswordOrHash)
    ? rawPasswordOrHash
    : await bcrypt.hash(rawPasswordOrHash, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      passwordHash,
    },
  });

  console.info(`Admin user upserted: ${email}`);
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
