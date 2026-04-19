import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@admin.com";
  const password = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      name: "Admin",
      password,
      role: "admin",
      phone: "0000000000",
    },
    create: {
      name: "Admin",
      email,
      phone: "0000000000",
      password,
      role: "admin",
    },
  });

  console.log("Seeded admin user:", email, "/ admin123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
