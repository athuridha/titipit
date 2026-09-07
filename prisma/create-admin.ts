import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

/**
 * Buat / update operator admin. Kredensial disimpan di database,
 * bukan di .env.
 *
 * Pakai: npm run admin:create -- <username> <password> [nama]
 * Contoh: npm run admin:create -- operator rahasia-kuat-123 "Operator titip.it"
 */

async function main() {
  const [, , rawUsername, password, name] = process.argv;
  const username = (rawUsername ?? "").trim().toLowerCase();

  if (!username || !/^[a-z0-9_]{3,32}$/.test(username)) {
    throw new Error("username wajib: 3-32 karakter, huruf kecil/angka/garis bawah");
  }
  if (!password || password.length < 8) {
    throw new Error("password wajib minimal 8 karakter");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.adminUser.upsert({
    where: { username },
    create: { username, name: name ?? "Operator titip.it", passwordHash },
    update: { passwordHash, ...(name ? { name } : {}) },
  });

  console.log(`Operator siap: ${user.username}`);
}

main()
  .catch((error) => {
    console.error((error as Error).message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
