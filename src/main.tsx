import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for offline caching and PWA installation
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Nova versão do Valorum BRL disponível.');
  },
  onOfflineReady() {
    console.log('Valorum BRL pronto para funcionar offline.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);

