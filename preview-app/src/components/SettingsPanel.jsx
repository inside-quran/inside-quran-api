import React from 'react';
import { X } from 'lucide-react';

export const textVariants = [
  { id: 'text_uthmani', label: 'Uthmani', font: "'KFGQPC Uthmanic Script HAFS', 'Amiri Quran', serif" },
  { id: 'text_uthmani_simple', label: 'Uthmani Simple', font: "'Amiri', serif" },
  { id: 'text_indopak', label: 'IndoPak', font: "'Lateef', serif" },
  { id: 'text_noorehuda', label: 'Noorehuda', font: "'Noorehuda', serif" },
  { id: 'text_qpc_hafs', label: 'QPC Hafs', font: "'KFGQPC Uthmanic Script HAFS', serif" }
];

function SettingsPanel({ settings, onUpdate, onClose }) {
  const handleVariantChange = (e) => {
    onUpdate({ ...settings, arabicTextVariant: e.target.value });
  };

  const changeArabicSize = (delta) => {
    onUpdate({ ...settings, arabicSize: Math.max(16, Math.min(64, settings.arabicSize + delta)) });
  };

  const changeTranslationSize = (delta) => {
    onUpdate({ ...settings, translationSize: Math.max(12, Math.min(32, settings.translationSize + delta)) });
  };

  const toggleTranslation = () => {
    onUpdate({ ...settings, showTranslation: !settings.showTranslation });
  };

  const toggleWordByWord = () => {
    onUpdate({ ...settings, wordByWord: !settings.wordByWord });
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="setting-group">
          <label>Arabic Text Variant</label>
          <select 
            className="font-select" 
            value={settings.arabicTextVariant}
            onChange={handleVariantChange}
          >
            {textVariants.map(v => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
        </div>

        <div className="setting-group">
          <label>Arabic Text Size</label>
          <div className="size-controls">
            <button className="size-btn" onClick={() => changeArabicSize(-2)}>-</button>
            <div className="size-value">{settings.arabicSize}px</div>
            <button className="size-btn" onClick={() => changeArabicSize(2)}>+</button>
          </div>
        </div>

        <div className="setting-group">
          <label>Translation Size</label>
          <div className="size-controls">
            <button className="size-btn" onClick={() => changeTranslationSize(-2)}>-</button>
            <div className="size-value">{settings.translationSize}px</div>
            <button className="size-btn" onClick={() => changeTranslationSize(2)}>+</button>
          </div>
        </div>
        
        <div className="setting-group">
          <label style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'}} onClick={toggleTranslation}>
            <span>Show Translation</span>
            <input 
              type="checkbox" 
              checked={settings.showTranslation} 
              onChange={toggleTranslation}
              style={{width: '20px', height: '20px', cursor: 'pointer'}}
            />
          </label>
        </div>

        <div className="setting-group">
          <label style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'}} onClick={toggleWordByWord}>
            <span>Word By Word Mode</span>
            <input 
              type="checkbox" 
              checked={settings.wordByWord} 
              onChange={toggleWordByWord}
              style={{width: '20px', height: '20px', cursor: 'pointer'}}
            />
          </label>
        </div>

      </div>
    </div>
  );
}

export default SettingsPanel;
