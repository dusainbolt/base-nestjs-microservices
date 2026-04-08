import { PrismaClient, PackStatus } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';

require('dotenv').config();

const connectionString = process.env.CONTENT_DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ─── Path resolver theo type / subCategory ─────────────────────────────────

function resolveDataPath(type: string, subCategory: string | null): string {
  const base = path.join(__dirname, 'input');
  if (type === 'EVERYDAY') return path.join(base, 'Everyday');
  if (type === 'OFFICE') return path.join(base, 'Office');
  if (type === 'NICHE' && subCategory)
    return path.join(base, 'Niche', subCategory.toLowerCase());
  throw new Error(
    `Cannot resolve data path for type=${type}, subCategory=${subCategory}`,
  );
}

// ─── Seed một Category ─────────────────────────────────────────────────────

async function seedCategory(
  category: {
    id: string;
    code: string | null;
    name: string;
    type: string;
    subCategory: string | null;
  },
  levels: { id: number }[],
  creatorId: string,
) {
  if (!category.code) {
    console.warn(`⚠️ Category [${category.name}] thiếu code — bỏ qua.`);
    return;
  }

  const dataPath = resolveDataPath(category.type, category.subCategory);
  console.log(
    `\n📂 ${category.type}${category.subCategory ? `/${category.subCategory}` : ''} › ${category.name} (${category.code})`,
  );

  for (const level of levels) {
    const fileName = `${category.code}_level_${level.id}.json`;
    const filePath = path.join(dataPath, fileName);

    if (!fs.existsSync(filePath)) continue;

    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const topic = await prisma.topic.findUnique({
      where: {
        categoryId_levelId: {
          categoryId: category.id,
          levelId: level.id,
        },
      },
    });

    if (!topic) {
      console.warn(`  ⚠️ Không tìm thấy Topic cho Level ${level.id} — bỏ qua.`);
      continue;
    }

    console.log(`  📖 Level ${level.id} › ${fileName}`);

    const lessonPackData: Array<{ t: string; e: any[] }> = jsonData.d || [];

    for (const packItem of lessonPackData) {
      const title = packItem.t;
      const exercises = packItem.e || [];

      // Upsert LessonPack
      let lessonPack = await prisma.lessonPack.findFirst({
        where: {
          title,
          topicId: topic.id,
          categoryId: category.id,
          levelId: level.id,
        },
      });

      if (!lessonPack) {
        lessonPack = await prisma.lessonPack.create({
          data: {
            title,
            description: `Bộ bài tập [${title}] thuộc level ${level.id}`,
            topicId: topic.id,
            categoryId: category.id,
            levelId: level.id,
            creatorId,
            isOfficial: true,
            status: PackStatus.PUBLISHED,
          },
        });
        console.log(`     ✨ Tạo mới: ${title}`);
      } else {
        lessonPack = await prisma.lessonPack.update({
          where: { id: lessonPack.id },
          data: {
            status: PackStatus.PUBLISHED,
            updatedAt: new Date(),
          },
        });
      }

      // Upsert Exercises
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

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log(
    '--- 🌱 Seeding Lesson Packs & Exercises (EVERYDAY · OFFICE · NICHE) ---',
  );

  const levels = await prisma.level.findMany({ orderBy: { id: 'asc' } });
  if (levels.length === 0) {
    console.warn('⚠️ Không tìm thấy Level nào. Chạy seed:levels trước.');
    return;
  }

  const creatorId = 'SYSTEM_ADMIN';

  // ── EVERYDAY ────────────────────────────────────────────────────────────
  console.log('\n\n═══ EVERYDAY ═══');
  const everydayCategories = await prisma.category.findMany({
    where: { type: 'EVERYDAY' },
    orderBy: { order: 'asc' },
  });
  if (everydayCategories.length === 0) {
    console.warn('⚠️ Không có Category EVERYDAY — bỏ qua block này.');
  }
  for (const cat of everydayCategories) {
    await seedCategory(cat, levels, creatorId);
  }

  // ── OFFICE ──────────────────────────────────────────────────────────────
  console.log('\n\n═══ OFFICE ═══');
  const officeCategories = await prisma.category.findMany({
    where: { type: 'OFFICE' },
    orderBy: { order: 'asc' },
  });
  if (officeCategories.length === 0) {
    console.warn('⚠️ Không có Category OFFICE — bỏ qua block này.');
  }
  for (const cat of officeCategories) {
    await seedCategory(cat, levels, creatorId);
  }

  // ── NICHE ───────────────────────────────────────────────────────────────
  console.log('\n\n═══ NICHE ═══');
  const nicheCategories = await prisma.category.findMany({
    where: { type: 'NICHE' },
    orderBy: [{ subCategory: 'asc' }, { order: 'asc' }],
  });
  if (nicheCategories.length === 0) {
    console.warn('⚠️ Không có Category NICHE — bỏ qua block này.');
  }

  // Group by subCategory để log rõ hơn
  const nicheGroups = nicheCategories.reduce<
    Record<string, typeof nicheCategories>
  >((acc, cat) => {
    const key = cat.subCategory ?? 'unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(cat);
    return acc;
  }, {});

  for (const [subCat, cats] of Object.entries(nicheGroups)) {
    console.log(`\n  ▸ NICHE/${subCat} (${cats.length} categories)`);
    for (const cat of cats) {
      // Kiểm tra folder tồn tại trước khi seed
      const folder = path.join(
        __dirname,
        'input',
        'Niche',
        subCat.toLowerCase(),
      );
      if (!fs.existsSync(folder)) {
        console.warn(`  ⏩ Folder không tồn tại: ${folder} — bỏ qua.`);
        continue;
      }
      await seedCategory(cat, levels, creatorId);
    }
  }

  console.log('\n\n--- ✨ Seed completed successfully! ---');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
