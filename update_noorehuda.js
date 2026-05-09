const fs = require('fs');
const path = require('path');

const txtPath = path.join(__dirname, 'Inside-Quran_All-Surah.txt');
const jsonDir = path.join(__dirname, 'quran_verses');
const outputDir = path.join(__dirname, 'updated_noorehuda');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Reading text file...');
const lines = fs.readFileSync(txtPath, 'utf-8').split('\n');

const ayahs = [];
let regex = /^\((\d+)\)\s*(.+)$/;

for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;
    
    let match = line.match(regex);
    if (match) {
        ayahs.push({
            number: parseInt(match[1]),
            text: match[2].trim()
        });
    }
}

console.log(`Extracted ${ayahs.length} ayahs from text file.`);

if (ayahs.length !== 6236) {
    console.error(`ERROR: Expected 6236 ayahs, found ${ayahs.length}`);
    process.exit(1);
}

let totalProcessed = 0;
let successfullyUpdated = 0;
let errors = 0;

let ayahIndex = 0;

for (let surahNum = 1; surahNum <= 114; surahNum++) {
    let jsonPath = path.join(jsonDir, `surah_${surahNum}.json`);
    if (!fs.existsSync(jsonPath)) {
        console.error(`Missing JSON for Surah ${surahNum} at ${jsonPath}`);
        errors++;
        continue;
    }

    let surahData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    
    for (let i = 0; i < surahData.length; i++) {
        let verse = surahData[i];
        totalProcessed++;
        
        let txtAyah = ayahs[ayahIndex];
        
        if (!txtAyah) {
            console.error(`Mismatch: Ran out of ayahs in txt at ${verse.verse_key}`);
            errors++;
            continue;
        }
        
        if (txtAyah.number !== verse.verse_number) {
            console.error(`Mismatch at ${verse.verse_key}: txt number is ${txtAyah.number}, json number is ${verse.verse_number}`);
            errors++;
        }
        
        let newVerse = {};
        for (let key in verse) {
            if (key === 'text_noorehuda') continue;
            newVerse[key] = verse[key];
            if (key === 'text_indopak') {
                newVerse['text_noorehuda'] = txtAyah.text;
            }
        }
        surahData[i] = newVerse;
        
        successfullyUpdated++;
        ayahIndex++;
    }
    
    let outPath = path.join(outputDir, `surah_${surahNum}.json`);
    fs.writeFileSync(outPath, JSON.stringify(surahData, null, 2), 'utf-8');
}

console.log('--- Summary ---');
console.log(`Total processed: ${totalProcessed}`);
console.log(`Successfully updated: ${successfullyUpdated}`);
console.log(`Errors/mismatches: ${errors}`);
