import { PrismaClient, PackStatus } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';

require('dotenv').config();

const connectionString = process.env.CONTENT_DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- 🌱 Seeding Lesson Packs & Exercises (Category Type: EVERYDAY) ---');

  // 1. Lấy tất cả Category có type = EVERYDAY
  const categories = await prisma.category.findMany({
    where: { type: 'EVERYDAY' },
  });

  if (categories.length === 0) {
    console.warn('⚠️ Không tìm thấy Category nào có type = EVERYDAY. Vui lòng chạy seed Category trước.');
    return;
  }

  // 2. Lấy danh sách Level
  const levels = await prisma.level.findMany();
  
  const creatorId = 'SYSTEM_ADMIN'; // Định danh cho các bài tập hệ thống
  const dataPath = path.join(__dirname, 'data/exercise/everyday');

  for (const category of categories) {
    if (!category.code) continue;

    console.log(`\n📂 Đang xử lý Category: ${category.name} (${category.code})`);

    for (const level of levels) {
      const fileName = `${category.code}_level_${level.id}.json`;
      const filePath = path.join(dataPath, fileName);

      if (!fs.existsSync(filePath)) {
        // console.log(`⏩ Bỏ qua: Không tìm thấy file ${fileName}`);
        continue;
      }

      console.log(`📖 Đọc file: ${fileName}`);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const jsonData = JSON.parse(fileContent);

      // Lấy Topic cho Category và Level này
      const topic = await prisma.topic.findUnique({
        where: {
          categoryId_levelId: {
            categoryId: category.id,
            levelId: level.id,
          },
        },
      });

      if (!topic) {
        console.warn(`⚠️ Không tìm thấy Topic cho Category ${category.id} và Level ${level.id}. Bỏ qua file này.`);
        continue;
      }

      const lessonPackData = jsonData.d || [];

      for (const packItem of lessonPackData) {
        const title = packItem.t;
        const exercises = packItem.e || [];

        // 3. Upsert LessonPack
        let lessonPack = await prisma.lessonPack.findFirst({
          where: {
            title: title,
            topicId: topic.id,
            categoryId: category.id,
            levelId: level.id,
          },
        });

        if (!lessonPack) {
          lessonPack = await prisma.lessonPack.create({
            data: {
              title: title,
              description: `Bộ bài tập [${title}] thuộc level ${level.id}`,
              topicId: topic.id,
              categoryId: category.id,
              levelId: level.id,
              creatorId: creatorId,
              isOfficial: true,
              status: PackStatus.PUBLISHED,
            },
          });
          console.log(`   ✨ Đã tạo LessonPack: ${title}`);
        } else {
          // Update thông tin cơ bản nếu cần
          lessonPack = await prisma.lessonPack.update({
            where: { id: lessonPack.id },
            data: {
              status: PackStatus.PUBLISHED,
              updatedAt: new Date(),
            },
          });
          // console.log(`   ✅ Đã cập nhật LessonPack: ${title}`);
        }

        // 4. Upsert Exercises
        let sequence = 1;
        for (const exItem of exercises) {
          await prisma.exercise.upsert({
            where: {
              lessonPackId_sequenceOrder: {
                lessonPackId: lessonPack!.id,
                sequenceOrder: sequence,
              },
            },
            update: {
              previousPrompt: exItem.p,
              myPrompt: exItem.m,
              levelHint: exItem.h,
            },
            create: {
              lessonPackId: lessonPack!.id,
              sequenceOrder: sequence,
              previousPrompt: exItem.p,
              myPrompt: exItem.m,
              levelHint: exItem.h,
            },
          });
          sequence++;
        }
      }
    }
  }

  console.log('\n--- ✨ Seed completed successfully! ---');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
