import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middleware
app.use(helmet());
app.use(express.json());

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173', // Vite default
  'https://insidequran.in',
  'https://www.insidequran.in',
  'https://inside-quran-yowx.vercel.app', // Vercel deployment URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT'],
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 login attempts per hour
  message: 'Too many login attempts, please try again after an hour'
});

app.use('/api/', limiter);
app.use('/api/admin/login', loginLimiter);

const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY && process.env.NODE_ENV === 'production') {
  console.error('CRITICAL: JWT_SECRET must be set in production!');
  process.exit(1);
}

const FINAL_SECRET = SECRET_KEY || 'dev_fallback_secret_321';

const DATA_DIR = path.join(__dirname, 'data');

// Middleware to verify JWT token for admin routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, FINAL_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTH ROUTE ---
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin'; // Fallback for dev only

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username: ADMIN_USER, role: 'admin' }, FINAL_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// --- PUBLIC ROUTES (Read-Only) ---

// Get list of surahs
// Note: You can also serve `Inside-Quran_All-Surah.txt` or a parsed JSON version if available
app.get('/api/surahs', async (req, res) => {
  try {
    // Assuming you have quranMeta.ts or similar, or just return 1 to 114
    // We can also just read the data directory to see available files
    const arabicDir = path.join(DATA_DIR, 'arabic');
    const files = await fs.readdir(arabicDir);
    const surahs = files.filter(f => f.endsWith('.json')).map(f => {
      const match = f.match(/surah_(\d+)\.json/);
      return match ? parseInt(match[1]) : null;
    }).filter(n => n !== null).sort((a, b) => a - b);
    
    res.json({ surahs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read surahs' });
  }
});

// Helper to format slug from surah number since Inside-Quran format uses slugs (e.g. "001-al-fatihah.json")
async function findSlugFile(dir, surahNumber) {
  try {
    const files = await fs.readdir(dir);
    const prefix = String(surahNumber).padStart(3, '0') + '-';
    const found = files.find(f => f.startsWith(prefix));
    if (found) {
       return await fs.readFile(path.join(dir, found), 'utf-8');
    }
  } catch (err) {
    // Directory might not exist or file missing
  }
  return null;
}

// Get all data for a specific surah (combined verses, tajweed, translations, etc.)
app.get('/api/surahs/:id/verses', async (req, res) => {
  const surahId = parseInt(req.params.id);
  if (isNaN(surahId) || surahId < 1 || surahId > 114) {
    return res.status(400).json({ error: 'Invalid Surah ID' });
  }
  
  try {
    // 1. Load Arabic (from new 'updated_noorehuda' structure)
    let arabicData = [];
    try {
      const arabicContent = await fs.readFile(path.join(DATA_DIR, 'arabic', `surah_${surahId}.json`), 'utf-8');
      arabicData = JSON.parse(arabicContent);
    } catch (e) {
      return res.status(404).json({ error: 'Surah not found' });
    }

    // 2. Load Tajweed
    let tajweedData = null;
    const tajweedContent = await findSlugFile(path.join(DATA_DIR, 'tajweed'), surahId);
    if (tajweedContent) {
      tajweedData = JSON.parse(tajweedContent).verses;
    }

    // 3. Load Translations (en, bn, hi, ur)
    const translations = {};
    const langs = ['en', 'bn', 'hi', 'ur'];
    for (const lang of langs) {
      const transContent = await findSlugFile(path.join(DATA_DIR, 'translations', lang), surahId);
      if (transContent) {
        translations[lang] = JSON.parse(transContent).verses;
      }
    }

    // 4. Load Transliterations
    let translitData = null;
    const translitContent = await findSlugFile(path.join(DATA_DIR, 'transliterations', 'en'), surahId);
    if (translitContent) {
        translitData = JSON.parse(translitContent).verses;
    }

    // 5. Load Word-by-Word
    let wbwData = null;
    const wbwContent = await findSlugFile(path.join(DATA_DIR, 'word-by-word'), surahId);
    if (wbwContent) {
      wbwData = JSON.parse(wbwContent).verses;
    }

    // Map the supplemental data by verse number
    const tajweedMap = {};
    if (tajweedData) tajweedData.forEach(v => tajweedMap[v.numberInSurah] = v.text);

    const transMaps = {};
    for (const lang of langs) {
      transMaps[lang] = {};
      if (translations[lang]) translations[lang].forEach(v => transMaps[lang][v.numberInSurah] = v.text);
    }
    
    const translitMap = {};
    if (translitData) translitData.forEach(v => translitMap[v.numberInSurah] = v.text);

    const wbwMap = {};
    if (wbwData) wbwData.forEach(v => wbwMap[v.numberInSurah] = v.words);

    // Combine data
    const combinedVerses = arabicData.map(v => {
      // The updated_noorehuda json seems to have verse_number as the field
      const verseNum = v.verse_number || v.id; 

      return {
        ...v,
        tajweedText: tajweedMap[verseNum] || null,
        translations: {
          en: transMaps['en'][verseNum] || null,
          bn: transMaps['bn'][verseNum] || null,
          hi: transMaps['hi'][verseNum] || null,
          ur: transMaps['ur'][verseNum] || null,
        },
        transliteration: translitMap[verseNum] || null,
        wbw: wbwMap[verseNum] || []
      };
    });

    res.json({ verses: combinedVerses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// --- DISCOVER AND MORPHOLOGY ROUTES ---
app.get('/api/morphology/glossary', (req, res) => {
  res.sendFile(path.join(DATA_DIR, 'morphology-glossary.json'));
});

app.get('/api/morphology', (req, res) => {
  res.sendFile(path.join(DATA_DIR, 'quran-morphology.txt'));
});

app.get('/api/discover/shane-nuzul', (req, res) => {
  res.sendFile(path.join(DATA_DIR, 'discover', 'shane-nuzul.json'));
});

app.get('/api/discover/topics', (req, res) => {
  res.sendFile(path.join(DATA_DIR, 'discover', 'topics.json'));
});

app.get('/api/discover/duas', (req, res) => {
  res.sendFile(path.join(DATA_DIR, 'discover', 'duas.json'));
});

// --- PROTECTED DISCOVER ROUTES (Admin Only) ---
const ALLOWED_DISCOVER = ['duas', 'topics', 'shane-nuzul'];

app.put('/api/admin/discover/:type', authenticateToken, async (req, res) => {
  const { type } = req.params;

  // Only allow known types
  if (!ALLOWED_DISCOVER.includes(type)) {
    return res.status(400).json({ error: 'Invalid discover type' });
  }

  const filename = `${type}.json`;
  const filePath = path.join(DATA_DIR, 'discover', filename);

  try {
    await fs.writeFile(filePath, JSON.stringify(req.body, null, 2), 'utf-8');
    res.json({ success: true, message: `${type} updated` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Failed to update ${type}` });
  }
});

// --- PROTECTED ROUTES (Admin Only) ---

// Example protected route for updating a verse's translation
app.put('/api/surahs/:surahId/verses/:verseId/translation', authenticateToken, async (req, res) => {
  const { surahId, verseId } = req.params;
  const { lang, newTranslation } = req.body;
  
  // Basic Input Validation
  if (!lang || !newTranslation) return res.status(400).json({ error: 'Missing lang or newTranslation' });
  
  // Sanitize lang to prevent path traversal (allow only alphanumeric + dash)
  if (!/^[a-z]{2}(-[a-z]{2,})?$/.test(lang)) {
    return res.status(400).json({ error: 'Invalid language format' });
  }
  
  try {
    const dir = path.join(DATA_DIR, 'translations', lang);
    const files = await fs.readdir(dir);
    const prefix = String(surahId).padStart(3, '0') + '-';
    const filename = files.find(f => f.startsWith(prefix));
    
    if (!filename) return res.status(404).json({ error: 'Translation file not found' });
    
    const filePath = path.join(dir, filename);
    const content = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    
    const verse = content.verses.find(v => v.numberInSurah === parseInt(verseId));
    if (verse) {
      verse.text = newTranslation;
      await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf-8');
      res.json({ success: true, message: 'Translation updated' });
    } else {
      res.status(404).json({ error: 'Verse not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update translation' });
  }
});

app.listen(PORT, () => {
  console.log(`Quran API running on http://localhost:${PORT}`);
});
