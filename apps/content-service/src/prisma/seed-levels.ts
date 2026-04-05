import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';

// Load .env manual nếu chạy bằng ts-node đơn lẻ
require('dotenv').config();

const connectionString = process.env.CONTENT_DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const dataPath = path.join(__dirname, 'data', 'level.json');
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ Data file not found at: ${dataPath}`);
    return;
  }

  const fileContent = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(fileContent);

  console.log('--- 🌱 Starting seeding levels from level.json ---');

  for (const item of data.levels) {
    // Upsert để có thể chạy lại nhiều lần mà không bị trùng dữ liệu
    const level = await prisma.level.upsert({
      where: { levelNumber: item.level },
      update: {
        code: item.code,
        description: item.description,
        passThresholdScore: item.passThresholdScore || 60, // Mặc định 60 nếu ko có trong JSON
        outputRequirements: item.outputRequirements,
        examples: item.examples || [],
      },
      create: {
        levelNumber: item.level,
        code: item.code,
        description: item.description,
        passThresholdScore: item.passThresholdScore || 60,
        outputRequirements: item.outputRequirements,
        examples: item.examples || [],
      },
    });
    console.log(`✅ Upserted Level ${level.levelNumber}: ${level.code}`);
  }

  console.log('--- ✨ Seeding completed successfully! ---');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding levels:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
