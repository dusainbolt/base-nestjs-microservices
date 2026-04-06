import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';

require('dotenv').config();

const connectionString = process.env.CONTENT_DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Hàm tạo slug cho Category Code
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function main() {
  const dataPath = path.join(__dirname, 'data/category');

  // Đọc dữ liệu
  const everyDayData = JSON.parse(
    fs.readFileSync(path.join(dataPath, 'every_day.json'), 'utf-8'),
  );
  const officeData = JSON.parse(
    fs.readFileSync(path.join(dataPath, 'office_foundation.json'), 'utf-8'),
  );
  const nicheData = JSON.parse(
    fs.readFileSync(path.join(dataPath, 'niche_master.json'), 'utf-8'),
  );

  // Lấy danh sách Level hiện có
  const levels = await prisma.level.findMany();
  if (levels.length === 0) {
    throw new Error(
      '❌ Không tìm thấy dữ liệu Level. Vui lòng chạy seed:svc content:levels trước.',
    );
  }

  console.log(
    '--- 🌱 Seeding Categories & Topics (UUID Category / Int Level) ---',
  );

  const processItems = async (
    items: any[],
    type: 'EVERYDAY' | 'OFFICE' | 'NICHE',
    subCategory: string | null,
  ) => {
    let index = 0;
    for (const item of items) {
      // Tạo code định danh (nhàm mục đích lưu trữ thêm)
      const subCode = subCategory ? `${subCategory.toLowerCase()}-` : '';
      const categoryCode = `${type.toLowerCase()}-${subCode}${slugify(item.title)}`;

      // 1. Thủ công find first -> create/update
      let category = await prisma.category.findFirst({
        where: {
          name: item.title,
          type: type,
          subCategory: subCategory,
        },
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            code: categoryCode,
            name: item.title,
            type: type,
            subCategory: subCategory,
            description: item.description,
            order: index,
          },
        });
      } else {
        category = await prisma.category.update({
          where: { id: category.id },
          data: {
            code: categoryCode,
            description: item.description,
            order: index,
          },
        });
      }

      // 2. Tạo Topic cho cả 4 Level cho mỗi Category này
      for (const level of levels) {
        await prisma.topic.upsert({
          where: {
            categoryId_levelId: {
              categoryId: category.id, // categoryId là UUID
              levelId: level.id, // levelId bây giờ là Int
            },
          },
          update: { order: level.id },
          create: {
            categoryId: category.id,
            levelId: level.id,
            order: level.id,
          },
        });
      }
      console.log(`✅ Category [${category.id}]: ${item.title}`);
      index++;
    }
  };

  // Nạp dữ liệu Everyday
  await processItems(everyDayData.DAILY_LIFE, 'EVERYDAY', null);

  // Nạp dữ liệu Office
  await processItems(officeData.WORK_GENERAL, 'OFFICE', null);

  // Nạp dữ liệu Niche
  for (const [subKey, items] of Object.entries(nicheData)) {
    await processItems(items as any[], 'NICHE', subKey);
  }

  console.log('--- ✨ Seed completed successfully! ---');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
