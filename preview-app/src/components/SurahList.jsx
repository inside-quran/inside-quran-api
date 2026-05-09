import { useState } from 'react';
import { Settings } from 'lucide-react';

function SurahList({ chapters, onSelectSurah, onOpenSettings }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChapters = chapters.filter(c => 
    c.name_simple.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.id.toString() === searchTerm
  );

  return (
    <div>
      <div className="app-header">
        <div style={{ flex: 1 }}></div>
        <div className="surah-title-header">
          <h1 style={{ color: 'var(--accent-color)' }}>Inside Quran</h1>
          <p>114 Surahs</p>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <button className="settings-btn" onClick={onOpenSettings} aria-label="Settings">
            <Settings size={24} />
          </button>
        </div>
      </div>

      <input 
        type="text" 
        className="search-bar" 
        placeholder="Search surah name or number..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="surah-list">
        {filteredChapters.map(chapter => (
          <div 
            key={chapter.id} 
            className="surah-item"
            onClick={() => onSelectSurah(chapter)}
          >
            <div className="surah-item-left">
              <div className="surah-item-number">{chapter.id}</div>
              <div className="surah-item-name">
                <h3>{chapter.name_simple}</h3>
                <p>{chapter.translated_name.name} • {chapter.revelation_place}</p>
              </div>
            </div>
            <div className="surah-item-right">
              <div className="surah-item-arabic">{chapter.name_arabic}</div>
              <div className="surah-item-verses">{chapter.verses_count} verses</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SurahList;
