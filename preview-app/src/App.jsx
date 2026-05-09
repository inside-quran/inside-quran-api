import { useState, useEffect } from 'react';
import SurahList from './components/SurahList';
import SurahReading from './components/SurahReading';
import SettingsPanel, { textVariants } from './components/SettingsPanel';
import './index.css';

function App() {
  const [currentSurah, setCurrentSurah] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [chapters, setChapters] = useState([]);
  
  const defaultSettings = {
    arabicTextVariant: 'text_uthmani',
    arabicSize: 32,
    translationSize: 16,
    showTranslation: true,
    wordByWord: false,
    readingMode: 'continuous'
  };

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('quranSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    fetch('https://api.quran.com/api/v4/chapters')
      .then(res => res.json())
      .then(data => setChapters(data.chapters))
      .catch(err => console.error(err));
      
    // Apply initial settings
    handleUpdateSettings(settings);
  }, []);

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('quranSettings', JSON.stringify(newSettings));
    
    // Update sizes
    document.documentElement.style.setProperty('--arabic-size', `${newSettings.arabicSize}px`);
    document.documentElement.style.setProperty('--translation-size', `${newSettings.translationSize}px`);
    
    // Find the variant and update the font family
    const variant = textVariants.find(v => v.id === newSettings.arabicTextVariant);
    if (variant && variant.font) {
      document.documentElement.style.setProperty('--arabic-font', variant.font);
    }
  };

  return (
    <div className="container">
      {currentSurah ? (
        <SurahReading 
          surah={currentSurah} 
          onBack={() => setCurrentSurah(null)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          settings={settings}
        />
      ) : (
        <SurahList 
          chapters={chapters} 
          onSelectSurah={setCurrentSurah}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {isSettingsOpen && (
        <SettingsPanel 
          settings={settings} 
          onUpdate={handleUpdateSettings} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}
    </div>
  );
}

export default App;
