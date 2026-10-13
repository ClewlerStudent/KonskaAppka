import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../src/theme/theme.css';
import '../../src/theme/fonts.css';
import '../../src/theme/base.css';
import { brand } from '../../src/theme';

// Szkielet panelu; ekrany logowania i router dochodzą w kolejnym kroku.
const root = document.getElementById('root');
if (!root) throw new Error('#root not found');

createRoot(root).render(
  <StrictMode>
    <main>
      <p className="eq-wordmark">{brand.wordmark}</p>
      <p className="eq-tagline" lang="en">
        {brand.tagline}
      </p>
    </main>
  </StrictMode>,
);
