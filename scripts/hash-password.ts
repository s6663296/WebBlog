import bcrypt from "bcryptjs";

async function main() {
  const rawPassword = process.argv[2];

  if (!rawPassword) {
    console.error("Usage: npm run hash:admin -- <password>");
    process.exit(1);
  }

  const hash = await bcrypt.hash(rawPassword, 12);
  console.log(hash);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
