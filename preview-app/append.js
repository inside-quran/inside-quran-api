const fs = require('fs');
const css = \
/* Mushaf Mode Styles */
.mushaf-mode-container {
  padding-bottom: 2rem;
}

.mushaf-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem auto;
  max-width: 700px;
  padding: 0 1rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: var(--bg-color);
  color: var(--primary-color);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.nav-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-indicator {
  font-weight: 600;
  color: var(--text-color);
}

.mushaf-page-wrapper {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.mushaf-page {
  background-color: #FDF9F1;
  border: 1px solid #D9C3A3;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border-radius: 4px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 700px;
  min-height: 900px;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  position: relative;
}

.mushaf-page::before {
  content: '';
  position: absolute;
  top: 12px; left: 12px; right: 12px; bottom: 12px;
  border: 2px solid #D9C3A3;
  border-radius: 2px;
  pointer-events: none;
}

.mushaf-line {
  display: flex;
  direction: rtl;
  width: 100%;
  font-size: var(--arabic-size, 32px);
  line-height: 2.2;
  white-space: nowrap;
}

.mushaf-line-full {
  justify-content: space-between;
}

.mushaf-line-short {
  justify-content: center;
  gap: 1.5rem;
}

.mushaf-word {
  display: inline-block;
  transition: color 0.2s ease;
}

.mushaf-end-mark {
  color: var(--secondary-color);
  margin: 0 0.3rem;
  display: inline-block;
}

.mushaf-surah-header {
  margin: 1.5rem 0 1rem 0;
  text-align: center;
  z-index: 1;
}

.surah-header-inner {
  background: repeating-linear-gradient(45deg, #FDF9F1, #FDF9F1 5px, #f5ebd9 5px, #f5ebd9 10px);
  border: 2px solid #D9C3A3;
  padding: 0.5rem 3rem;
  display: inline-block;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 4px;
  color: #5a4a35;
}

.mushaf-bismillah {
  font-family: 'KFGQPC Uthmanic Script HAFS', serif;
  font-size: var(--arabic-size, 32px);
  text-align: center;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

@media (max-width: 600px) {
  .mushaf-page {
    padding: 1.5rem 1rem;
    min-height: auto;
  }
  .mushaf-page::before {
    top: 6px; left: 6px; right: 6px; bottom: 6px;
  }
  .mushaf-line {
    font-size: calc(var(--arabic-size) * 0.75);
    line-height: 2;
  }
}
\;
fs.appendFileSync('src/index.css', css);

