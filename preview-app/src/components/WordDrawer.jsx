import React from 'react';
import { X, Play } from 'lucide-react';

function WordDrawer({ word, onClose }) {
  if (!word) return null;

  const playAudio = () => {
    if (word.audio_url) {
      const audio = new Audio(`https://verses.quran.com/${word.audio_url}`);
      audio.play();
    }
  };

  return (
    <div className="word-drawer-overlay" onClick={onClose}>
      <div className="word-drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="word-drawer-header">
          <h3>Word Details</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="word-drawer-content">
          <div className="word-drawer-arabic">
            {word.displayWord || word.text_uthmani || word.text}
          </div>
          
          <div className="word-drawer-details">
            <div className="detail-row">
              <span className="detail-label">Transliteration:</span>
              <span className="detail-value">{word.transliteration?.text || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Translation:</span>
              <span className="detail-value">{word.translation?.text || '-'}</span>
            </div>
          </div>

          {word.audio_url && (
            <button className="play-btn" onClick={playAudio}>
              <Play size={20} /> Play Audio
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default WordDrawer;
