import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";
import * as bcrypt from "bcrypt";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const category1 = await prisma.category.upsert({
    where: { name: "Mathematics" },
    update: {},
    create: { name: "Mathematics", description: "Algebra, Calculus, and Geometry tutoring." },
  });

  const category2 = await prisma.category.upsert({
    where: { name: "Programming" },
    update: {},
    create: { name: "Programming", description: "Full-stack development, TypeScript, and Python." },
  });

  const adminEmail = "admin@skillbridge.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("Admin12345", 10);

    const adminUser = await prisma.user.create({
      data: {
        name: "Platform Admin",
        email: adminEmail,
        emailVerified: true,
        role: "ADMIN",
        accounts: {
          create: {
            providerId: "credential",
            accountId: adminEmail,
            password: hashedPassword,
          },
        },
      },
    });
    console.log("Admin user created:", adminUser.email);
  } else {
    console.log("Admin user already exists.");
  }

  console.log({ category1, category2 });
  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });