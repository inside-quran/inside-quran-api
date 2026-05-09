const fs = require('fs');
const css = fs.readFileSync('src/index.css', 'utf8');
const start = css.indexOf('/* Mushaf Mode Styles */');
if (start !== -1) {
  const newCss = css.substring(0, start) + \/* Mushaf Mode Styles */
.mushaf-mode-container {
  padding-bottom: 2rem;
  background-color: #FCF6EC;
  min-height: 100vh;
}

.mushaf-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  max-width: 700px;
  padding: 0 1rem;
}

.mushaf-page-header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem 2rem 1rem 2rem;
  font-family: 'Inter', sans-serif;
  color: #a8885c;
  font-weight: 700;
  font-size: 1.1rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: #a8885c;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(168, 136, 92, 0.1);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mushaf-page-wrapper {
  display: flex;
  justify-content: center;
  padding: 0 1rem 2rem 1rem;
}

.mushaf-page {
  background-color: #FCF6EC;
  width: 100%;
  max-width: 700px;
  min-height: 900px;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  position: relative;
  padding: 0 1.5rem;
}

.mushaf-line {
  display: flex;
  direction: rtl;
  width: 100%;
  font-size: var(--arabic-size, 32px);
  line-height: 2.2;
  white-space: nowrap;
  color: #1d1c1a;
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
  color: #b5966c;
  margin: 0 0.3rem;
  display: inline-block;
}

.mushaf-surah-header {
  margin: 2rem 0;
  text-align: center;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.surah-header-svg {
  position: absolute;
  width: 100%;
  height: 100%;
  max-width: 500px;
  z-index: 0;
}

.surah-header-inner {
  position: relative;
  z-index: 1;
  font-size: 2.2rem;
  color: #1d1c1a;
  padding: 0.8rem 0;
}

.mushaf-bismillah {
  font-family: 'KFGQPC Uthmanic Script HAFS', serif;
  font-size: calc(var(--arabic-size, 32px) * 1.1);
  text-align: center;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
  color: #1d1c1a;
}

.mushaf-page-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: auto;
  padding-top: 3rem;
  position: relative;
  height: 50px;
}

.page-number-svg {
  position: absolute;
  height: 100%;
  z-index: 0;
}

.mushaf-page-number {
  position: relative;
  z-index: 1;
  font-weight: 700;
  font-size: 1.2rem;
  color: #1d1c1a;
}

@media (max-width: 600px) {
  .mushaf-page {
    padding: 0 0.5rem;
    min-height: auto;
  }
  .mushaf-line {
    font-size: calc(var(--arabic-size) * 0.75);
    line-height: 2;
  }
  .mushaf-page-header {
    padding: 1rem 1rem 0.5rem 1rem;
  }
}
\;
  fs.writeFileSync('src/index.css', newCss);
}

