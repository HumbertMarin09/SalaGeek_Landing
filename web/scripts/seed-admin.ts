import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';

const email = process.env.ADMIN_SEED_EMAIL;
const name = process.env.ADMIN_SEED_NAME;
const passwordHash = process.env.ADMIN_SEED_PASSWORD_HASH;
if (!email || !name || !passwordHash) {
  throw new Error('Faltan ADMIN_SEED_EMAIL, ADMIN_SEED_NAME o ADMIN_SEED_PASSWORD_HASH');
}
const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT || 3306),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 1,
});
const prisma = new PrismaClient({ adapter });
await prisma.adminUser.upsert({
  where: { email },
  update: { name, passwordHash },
  create: { email, name, passwordHash },
});
await prisma.$disconnect();
console.log('admin listo');
