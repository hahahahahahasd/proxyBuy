import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Create a merchant
  const merchant1 = await prisma.merchant.create({
    data: {
      name: '深夜拉面馆',
      tables: {
        create: [{ name: 'A1' }, { name: 'A2' }, { name: '吧台-3' }],
      },
      menuItems: {
        create: [
          { name: '豚骨拉面', price: 48.5, description: '浓郁的猪骨汤底' },
          { name: '酱油拉面', price: 45, isAvailable: true },
          { name: '日式炸鸡', price: 28, isAvailable: true },
          { name: '朝日啤酒', price: 15, isAvailable: true },
          { name: '可乐', price: 8, isAvailable: false },
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
