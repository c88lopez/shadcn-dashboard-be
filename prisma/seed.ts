import * as bcrypt from 'bcrypt';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const saltRounds = 10;

async function main() {
  const adminCredentials = {
    username: 'admin',
    email: 'admin@vandelay-labs.com',
    password: '123123123',
  };

  const hashedPassword = await bcrypt.hash(
    adminCredentials.password,
    saltRounds,
  );

  const user = await prisma.user.upsert({
    where: { email: adminCredentials.email },
    update: {},
    create: {
      username: adminCredentials.username,
      email: adminCredentials.email,
      password: hashedPassword,
    },
  });

  const defaultGroupName = {
    name: 'default',
  };

  const [group] = await prisma.userGroup.findMany({
    where: { name: defaultGroupName.name },
  });

  if (!group) {
    await prisma.userGroup.create({
      data: {
        name: defaultGroupName.name,
        users: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }
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
