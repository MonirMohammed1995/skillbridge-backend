import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database categories...");

  // ১. প্রাথমিক সাবজেক্ট ক্যাটাগরিগুলো সিড করা
  const category1 = await prisma.category.upsert({
    where: { name: "Mathematics" },
    update: {},
    create: { 
      name: "Mathematics", 
      description: "Algebra, Calculus, and Geometry tutoring." 
    },
  });

  const category2 = await prisma.category.upsert({
    where: { name: "Programming" },
    update: {},
    create: { 
      name: "Programming", 
      description: "Full-stack development, TypeScript, and Python." 
    },
  });

  const category3 = await prisma.category.upsert({
    where: { name: "Physics" },
    update: {},
    create: { 
      name: "Physics", 
      description: "Mechanics, Thermodynamics, and Electromagnetism." 
    },
  });

  console.log("Seeded categories successfully:", { category1, category2, category3 });
  console.log("Database seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error("Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });