import { useState, useEffect } from 'react';
import { ArrowLeft, Settings, MoreVertical, Copy, Share2 } from 'lucide-react';
import WordDrawer from './WordDrawer';

function SurahReading({ surah, onBack, onOpenSettings, settings }) {
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);

  useEffect(() => {
    setLoading(true);
    
    const fetchArabic = fetch(`/local-data/updated_noorehuda/surah_${surah.id}.json`)
      .then(res => {
        if (!res.ok) throw new Error('Local JSON not found. Make sure the files are in updated_noorehuda');
        return res.json();
      });

    const fetchTranslation = fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surah.id}?translations=20&per_page=300&words=true&word_fields=text_uthmani,text_indopak,text_qpc_hafs`)
      .then(res => res.json());

    Promise.all([fetchArabic, fetchTranslation])
      .then(([arabicData, translationData]) => {
        const transMap = {};
        const wordsMap = {};
        if (translationData.verses) {
          translationData.verses.forEach(v => {
            if (v.translations && v.translations.length > 0) {
              let text = v.translations[0].text;
              text = text.replace(/<sup.*?<\/sup>/g, '');
              transMap[v.verse_number] = text;
            }
            if (v.words) {
              wordsMap[v.verse_number] = v.words;
            }
          });
        }

        const combined = arabicData.map(v => ({
          ...v,
          translation: transMap[v.verse_number] || '',
          words: wordsMap[v.verse_number] || []
        }));
        setVerses(combined);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [surah.id]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setActiveMenu(null);
    alert('Copied to clipboard');
  };

  const shareVerse = (verse, arabicText) => {
    if (navigator.share) {
      navigator.share({
        title: `Quran ${surah.name_simple} ${surah.id}:${verse.verse_number}`,
        text: `${arabicText}\n\n${verse.translation}\n- Surah ${surah.name_simple}, Ayah ${verse.verse_number}`
      }).catch(console.error);
    } else {
      copyToClipboard(`${arabicText}\n\n${verse.translation}`);
    }
    setActiveMenu(null);
  };

  return (
    <div onClick={() => setActiveMenu(null)}>
      <div className="app-header">
        <button className="back-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <div className="surah-title-header">
          <h1>{surah.name_simple}</h1>
          <p>{surah.translated_name.name}</p>
        </div>
        <button className="settings-btn" onClick={onOpenSettings} aria-label="Settings">
           <Settings size={24} />
        </button>
      </div>

      <div className="bismillah">
        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
      </div>

      {loading && <div style={{textAlign: 'center', padding: '2rem'}}>Loading verses...</div>}
      {error && <div style={{textAlign: 'center', padding: '2rem', color: 'red'}}>{error}</div>}

      <div className="verses-container">
        {verses.map(verse => {
          let arabicText = verse[settings.arabicTextVariant] || verse.text_uthmani;
          // Clean PUA characters that render as boxes
          arabicText = arabicText.replace(/[\uE000-\uF8FF]/g, '');
          
          // Fix dataset anomalies where single-letter prefixes (Waw, Fa, Ba, Ka, Li, etc.) are separated by spaces
          arabicText = arabicText.replace(/(^|\s)([وفبكلساأ][\u064B-\u065F]*)\s+(?=\S)/g, (match, p1, p2) => p1 + p2);
          const isMenuOpen = activeMenu === verse.id;

          // Split local text to best-effort map to words if using local non-standard variants.
          const rawLocalWords = arabicText.split(/ +/);
          const localWords = [];
          for (let w of rawLocalWords) {
            // If the word consists entirely of marks/numbers/waqf signs, append it to the previous word
            if (/^[\u0600-\u061C\u064B-\u065F\u0660-\u066D\u0670\u06D6-\u06ED\u06F0-\u06F9٪]+$/.test(w) && localWords.length > 0) {
              localWords[localWords.length - 1] += ' ' + w;
            } else {
              localWords.push(w);
            }
          }

          return (
            <div key={verse.id} className="verse-card">
              <div className="verse-header">
                <div className="verse-number">{verse.verse_number}</div>
                <div style={{ position: 'relative' }}>
                  <div 
                    className="verse-options" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(isMenuOpen ? null : verse.id);
                    }}
                  >
                    <MoreVertical size={20} />
                  </div>
                  {isMenuOpen && (
                    <div className="verse-menu" style={{
                      position: 'absolute', right: 0, top: '24px', background: 'white', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', zIndex: 10,
                      minWidth: '180px', overflow: 'hidden', border: '1px solid var(--border-color)'
                    }}>
                      <button className="menu-item" onClick={() => copyToClipboard(arabicText)}>
                        <Copy size={16} /> Copy Arabic
                      </button>
                      {settings.showTranslation && (
                        <button className="menu-item" onClick={() => copyToClipboard(verse.translation)}>
                          <Copy size={16} /> Copy Translation
                        </button>
                      )}
                      <button className="menu-item" onClick={() => shareVerse(verse, arabicText)}>
                        <Share2 size={16} /> Share Verse
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {settings.wordByWord ? (
                <div className="word-by-word-container">
                  {verse.words.map((word, index) => {
                    if (word.char_type_name === 'end') return null;
                    
                    // Best effort mapping to local word string if it's not a standard variant
                    let displayWord = word.text_uthmani || word.text;
                    
                    if (settings.arabicTextVariant === 'text_qpc_hafs' || settings.arabicTextVariant === 'text_uthmani') {
                      displayWord = word.text_qpc_hafs || displayWord;
                    } else if (settings.arabicTextVariant.includes('indopak')) {
                      displayWord = word.text_indopak || displayWord;
                    } else if (settings.arabicTextVariant === 'text_noorehuda' && localWords[index]) {
                      displayWord = localWords[index];
                    }

                    // Strip Private Use Area (PUA) characters which cause missing character boxes
                    displayWord = displayWord.replace(/[\uE000-\uF8FF]/g, '');

                    return (
                      <div 
                        key={word.id} 
                        className="word-block"
                        onClick={() => setSelectedWord({ ...word, displayWord })}
                      >
                        <div className="word-arabic">{displayWord}</div>
                        {settings.showTranslation && word.translation && (
                          <div className="word-translation">{word.translation.text}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="arabic-text">
                  {localWords.map((wordStr, index) => {
                    const wordData = verse.words[index];
                    return (
                      <span 
                        key={index}
                        onClick={() => {
                          if (wordData && wordData.char_type_name !== 'end') {
                            setSelectedWord({ ...wordData, displayWord: wordStr });
                          }
                        }}
                        className={wordData && wordData.char_type_name !== 'end' ? 'clickable-word' : ''}
                        style={{ cursor: (wordData && wordData.char_type_name !== 'end') ? 'pointer' : 'default' }}
                      >
                        {wordStr}{' '}
                      </span>
                    );
                  })}
                </div>
              )}
              
              {settings.showTranslation && !settings.wordByWord && (
                <div 
                  className="translation-text" 
                  dangerouslySetInnerHTML={{ __html: verse.translation }} 
                />
              )}
            </div>
          );
        })}
      </div>

      <WordDrawer word={selectedWord} onClose={() => setSelectedWord(null)} />
    </div>
  );
}

export default SurahReading;
