import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create Categories
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

  console.log({ category1, category2 });
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });