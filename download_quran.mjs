import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://api.quran.com/api/v4';
const OUTPUT_DIR = 'quran_verses';
const FIELDS = 'text_uthmani,text_indopak,text_uthmani_simple,text_qpc_hafs,text_indopak_nastaleeq,text_qpc_nastaleeq'; // You can add more fields if needed

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

async function fetchVerses(chapterNumber) {
  let allVerses = [];
  let currentPage = 1;
  let totalPages = 1;

  console.log(`Fetching Surah ${chapterNumber}...`);

  do {
    const url = `${BASE_URL}/verses/by_chapter/${chapterNumber}?fields=${FIELDS}&page=${currentPage}&per_page=50`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      allVerses = allVerses.concat(data.verses);
      totalPages = data.pagination.total_pages;
      currentPage++;
    } catch (error) {
      console.error(`Error fetching Surah ${chapterNumber}, Page ${currentPage}:`, error);
      break;
    }
  } while (currentPage <= totalPages);

  return allVerses;
}

async function downloadAll() {
  for (let i = 1; i <= 114; i++) {
    const verses = await fetchVerses(i);
    const fileName = path.join(OUTPUT_DIR, `surah_${i}.json`);
    fs.writeFileSync(fileName, JSON.stringify(verses, null, 2));
    console.log(`Saved Surah ${i} to ${fileName} (${verses.length} verses)`);
    // Adding a small delay to be polite to the API
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  console.log('Finished downloading all surahs!');
}

downloadAll();
