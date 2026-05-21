// import dotenv from "dotenv";
// dotenv.config();
// import { PrismaClient } from "@prisma/client";
// import { PrismaPg } from "@prisma/adapter-pg";

// const adapter = new PrismaPg({
//   connectionString: process.env.DATABASE_URL,
// });

// const prisma = new PrismaClient({
//   adapter,
//   log:
//     process.env.NODE_ENV === "development"
//       ? ["query", "error", "warn"]
//       : ["error"],
// });

// const connectDatabase = async () => {
//   try {
//     await prisma.$connect();
//     console.log("Database connect via prisma");
//   } catch (error) {
//     console.error(`Database connection error: ${error.message}`);
//     process.exit(1);
//   }
// };

// const disconnectDatabase = async () => {
//   await prisma.$disconnect();
// };
// export { prisma, connectDatabase, disconnectDatabase };
// import dotenv from "dotenv";
// dotenv.config();

// import { PrismaClient } from "@prisma/client";

// const globalForPrisma = globalThis;

// const prisma =
//   globalForPrisma.prisma ||
//   new PrismaClient({
//     log:
//       process.env.NODE_ENV === "development"
//         ? ["query", "error", "warn"]
//         : ["error"],
//   });

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = prisma;
// }

// const connectDatabase = async () => {
//   try {
//     await prisma.$connect();
//     console.log("Database connected via Prisma");
//   } catch (error) {
//     console.error(`Database connection error: ${error.message}`);
//     process.exit(1);
//   }
// };

// const disconnectDatabase = async () => {
//   await prisma.$disconnect();
// };

// export { prisma, connectDatabase, disconnectDatabase };
import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected via Prisma");
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDatabase = async () => {
  await prisma.$disconnect();
  await pool.end();
};

export { prisma, connectDatabase, disconnectDatabase };
