import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Create a merchant
  const merchant1 = await prisma.merchant.create({
    data: {
      name: '深夜拉面馆',
      menuItems: {
        create: [
          { name: '标准美式', price: 48.5, description: '浓郁的猪骨汤底' },
          { name: '加浓美式', price: 45, isAvailable: true },
        ],
      },
    },
  });

  console.log(`Created merchant with id: ${merchant1.id}`);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
