import * as bcrypt from 'bcrypt';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const saltRounds = 10;

async function main() {
  const adminCredentials = {
    username: 'admin',
    email: 'admin@vandelay-labs.com',
    password: '12345678',
  };

  const hashedPassword = await bcrypt.hash(
    adminCredentials.password,
    saltRounds,
  );

  await prisma.user.upsert({
    where: { email: adminCredentials.email },
    update: {},
    create: {
      username: adminCredentials.username,
      email: adminCredentials.email,
      password: hashedPassword,
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
