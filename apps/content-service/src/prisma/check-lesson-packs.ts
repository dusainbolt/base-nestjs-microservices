import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

require('dotenv').config();

const connectionString = process.env.CONTENT_DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const INPUT_DIR = path.join(__dirname, 'input');
const DATA_DIR = path.join(__dirname, 'data/category');

// Slugify function cloned from seed-categories.ts
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

interface ExpectedCategory {
  title: string;
  type: string;
  subCategory: string | null;
}

function getExpectedCategories(): ExpectedCategory[] {
  const categories: ExpectedCategory[] = [];

  // Everyday
  const everydayFile = path.join(DATA_DIR, 'every_day.json');
  if (fs.existsSync(everydayFile)) {
    const data = JSON.parse(fs.readFileSync(everydayFile, 'utf-8'));
    (data.DAILY_LIFE || []).forEach((item: any) => {
      categories.push({ title: item.title, type: 'EVERYDAY', subCategory: null });
    });
  }

  // Office
  const officeFile = path.join(DATA_DIR, 'office_foundation.json');
  if (fs.existsSync(officeFile)) {
    const data = JSON.parse(fs.readFileSync(officeFile, 'utf-8'));
    (data.WORK_GENERAL || []).forEach((item: any) => {
      categories.push({ title: item.title, type: 'OFFICE', subCategory: null });
    });
  }

  // Niche
  const nicheFile = path.join(DATA_DIR, 'niche_master.json');
  if (fs.existsSync(nicheFile)) {
    const data = JSON.parse(fs.readFileSync(nicheFile, 'utf-8'));
    for (const [subCat, items] of Object.entries(data)) {
      (items as any[]).forEach((item: any) => {
        categories.push({ title: item.title, type: 'NICHE', subCategory: subCat });
      });
    }
  }

  return categories;
}

function resolveDataPath(type: string, subCategory: string | null): string {
  if (type === 'EVERYDAY') return path.join(INPUT_DIR, 'Everyday');
  if (type === 'OFFICE') return path.join(INPUT_DIR, 'Office');
  if (type === 'NICHE' && subCategory)
    return path.join(INPUT_DIR, 'Niche', subCategory.toLowerCase());
  return INPUT_DIR;
}

async function checkDatabaseConsistency(expected: ExpectedCategory[]) {
  console.log('--- 🗄️ Checking Metadata vs Database Consistency ---');
  
  const dbCategories = await prisma.category.findMany({
    select: { name: true, type: true, subCategory: true, code: true }
  });

  const discrepancies: string[] = [];
  
  // 1. Check if everything in JSON exists in DB
  expected.forEach(ex => {
    const found = dbCategories.find(db => 
      db.name === ex.title && 
      db.type === ex.type && 
      (db.subCategory === ex.subCategory || (db.subCategory === null && ex.subCategory === null))
    );
    
    if (!found) {
      discrepancies.push(`MISSING in DB: [${ex.type}${ex.subCategory ? '/' + ex.subCategory : ''}] - ${ex.title}`);
    }
  });

  // 2. Check if everything in DB exists in JSON
  dbCategories.forEach(db => {
    const found = expected.find(ex => 
      ex.title === db.name && 
      ex.type === db.type && 
      (ex.subCategory === db.subCategory || (ex.subCategory === null && db.subCategory === null))
    );

    if (!found) {
      discrepancies.push(`EXTRA in DB (Not in JSON): [${db.type}${db.subCategory ? '/' + db.subCategory : ''}] - ${db.name} (Code: ${db.code})`);
    }
  });

  if (discrepancies.length === 0) {
    console.log('✅ Metadata và Database hoàn toàn khớp nhau.');
    return true;
  } else {
    console.log('❌ Phát hiện sự sai lệch giữa Metadata và Database:');
    discrepancies.forEach(d => console.log(`   - ${d}`));
    return false;
  }
}

async function main() {
  try {
    const expected = getExpectedCategories();
    
    // Step 1: Check DB Consistency
    const isConsistent = await checkDatabaseConsistency(expected);
    
    console.log('\n--- 📂 Proceeding to Step 2: Lesson Packs Check ---');
    
    // Step 2: Check Lesson Packs (Regardless of consistency, but warning shown above)
    const levels = [1, 2, 3];
    const results: any[] = [];

    expected.forEach(cat => {
      const subCode = cat.subCategory ? `${cat.subCategory.toLowerCase()}-` : '';
      const categoryCode = `${cat.type.toLowerCase()}-${subCode}${slugify(cat.title)}`;
      const dataPath = resolveDataPath(cat.type, cat.subCategory);

      levels.forEach(lvl => {
        const fileName = `${categoryCode}_level_${lvl}.json`;
        const filePath = path.join(dataPath, fileName);
        
        let count = 0;
        let status = '❌ MISSING';

        if (fs.existsSync(filePath)) {
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(content);
            count = (data.d || []).length;
            
            if (count >= 14) {
              status = '✅ OK';
            } else {
              status = '⚠️ LACK';
            }
          } catch (err) {
            status = '🔥 ERROR';
          }
        }

        results.push({
          'Category Code': categoryCode,
          'Level': lvl,
          'Packs': count,
          'Status': status,
          '_type': cat.type,
          '_sub': cat.subCategory || ''
        });
      });
    });

    console.log(`Tổng dự kiến: ${results.length} category-level`);
    
    const stats = {
      OK: results.filter(r => r.Status === '✅ OK').length,
      LACK: results.filter(r => r.Status === '⚠️ LACK').length,
      MISSING: results.filter(r => r.Status === '❌ MISSING').length,
    };

    console.table(results.map(r => ({
      Type: r._type,
      Sub: r._sub,
      Code: r['Category Code'],
      Lvl: r['Level'],
      Packs: r['Packs'],
      Status: r['Status']
    })));

    console.log('\n--- 📊 Statistics ---');
    console.log(`✅ OK:      ${stats.OK}`);
    console.log(`⚠️ LACK:    ${stats.LACK}`);
    console.log(`❌ MISSING: ${stats.MISSING}`);

    const problems = results.filter(r => r.Status !== '✅ OK');
    if (problems.length > 0) {
      console.log('\n⚠️  Các Category-Level cần hoàn thiện (MISSING hoặc < 14 packs):');
      const grouped = problems.reduce((acc, p) => {
        const key = `${p._type}${p._sub ? '/' + p._sub : ''}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(p);
        return acc;
      }, {} as any);

      for (const [group, items] of Object.entries(grouped)) {
        console.log(`\n📂 ${group}:`);
        (items as any[]).forEach(item => {
          console.log(`  - Level ${item.Level} | ${item['Category Code']} | ${item.Packs} packs [${item.Status}]`);
        });
      }
    } else {
      console.log('\n✨ Tuyệt vời! Tất cả đã đầy đủ và đạt chuẩn >= 14 packs.');
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
