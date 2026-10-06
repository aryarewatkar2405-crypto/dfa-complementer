import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { runSanityTests } from './core/__tests__/dfaOperations.test';

// Run mathematical core verification in console
runSanityTests();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
