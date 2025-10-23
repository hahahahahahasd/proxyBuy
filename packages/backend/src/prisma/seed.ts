import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Create a merchant with menu items and specifications/options
  const merchant1 = await prisma.merchant.create({
    data: {
      name: '深夜拉面馆',
      menuItems: {
        create: [
          {
            name: '标准美式',
            price: 26,
            description: '浓郁的猪骨汤底',
            isAvailable: true,
            specifications: {
              create: [
                {
                  name: '温度',
                  options: {
                    create: [
                      { name: '冰', price: 0 },
                      { name: '热', price: 0 },
                      // 如果需要，可继续添加更多 option
                    ],
                  },
                },
                {
                  name: '糖度',
                  options: {
                    create: [
                      { name: '标准甜', price: 0 },
                      { name: '少甜', price: 0 },
                      { name: '少少甜', price: 0 },
                      { name: '微甜', price: 0 },
                      { name: '不另外加糖', price: 0 },
                      // 如果需要，可继续添加更多 option
                    ],
                  },
                },
                {
                  name: '奶',
                  options: {
                    create: [
                      { name: '双份奶', price: 5 },
                      { name: '单份奶', price: 0 },
                      { name: '无奶', price: -5 },
                      // 如果需要，可继续添加更多 option
                    ],
                  },
                }
                // 如果需要，可继续添加更多 specification
              ],
            },
          },
          {
            name: '加浓美式',
            price: 29,
            isAvailable: true,
            specifications: {
              create: [
                {
                  name: '温度',
                  options: {
                    create: [
                      { name: '冰', price: 0 },
                      { name: '热', price: 0 },
                      // 如果需要，可继续添加更多 option
                    ],
                  },
                },
                {
                  name: '糖度',
                  options: {
                    create: [
                      { name: '标准甜', price: 0 },
                      { name: '少甜', price: 0 },
                      { name: '少少甜', price: 0 },
                      { name: '微甜', price: 0 },
                      { name: '不另外加糖', price: 0 },
                      // 如果需要，可继续添加更多 option
                    ],
                  },
                },
                {
                  name: '奶',
                  options: {
                    create: [
                      { name: '双份奶', price: 5 },
                      { name: '单份奶', price: 0 },
                      { name: '无奶', price: -5 },
                      // 如果需要，可继续添加更多 option
                    ],
                  },
                }
                // 如果需要，可继续添加更多 specification
              ],
            },
          },
          {
            name: '双椰拿铁',
            price: 28,
            isAvailable: true,
            specifications: {
              create: [
                {
                  name: '温度',
                  options: {
                    create: [
                      { name: '冰', price: 0 },
                      { name: '热', price: 0 },
                      // 如果需要，可继续添加更多 option
                    ],
                  },
                },
                // 如果需要，可继续添加更多 specification
              ],
            }
          },
          // {
          //   name: '朝日啤酒',
          //   price: 15,
          //   isAvailable: true,
          // },
          // {
          //   name: '可乐',
          //   price: 8,
          // },
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
