import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import TeamPage from './pages/TeamPage.tsx';
import BadgePage from './pages/BadgePage.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/team" element={<TeamPage />} />
      <Route path="/badge" element={<BadgePage />} />
    </Routes>
  </BrowserRouter>
);
