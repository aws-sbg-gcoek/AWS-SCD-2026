import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import TeamPage from './pages/TeamPage.tsx';
import BadgePage from './pages/BadgePage.tsx';
import RegistrationPage from './pages/RegistrationPage.tsx';
import DirectPaymentPage from './pages/DirectPaymentPage.tsx';
import TicketAdminPage from './pages/TicketAdminPage.tsx';
import './index.css';

const appMode = import.meta.env.VITE_APP_MODE; // 'admin' | 'site' | undefined

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    {appMode === 'admin' ? (
      <Routes>
        <Route path="/" element={<TicketAdminPage />} />
        <Route path="/admin" element={<TicketAdminPage />} />
        <Route path="/admin/tickets" element={<TicketAdminPage />} />
        <Route path="*" element={<TicketAdminPage />} />
      </Routes>
    ) : (
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/booking" element={<RegistrationPage />} />
        <Route path="/tickets" element={<RegistrationPage />} />
        <Route path="/book" element={<RegistrationPage />} />
        <Route path="/pay" element={<DirectPaymentPage />} />
        <Route path="/pay149" element={<DirectPaymentPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/badge" element={<BadgePage />} />
        {/* Only enable /admin in shared/dev mode when VITE_APP_MODE is not strictly 'site' */}
        {appMode !== 'site' && (
          <>
            <Route path="/admin" element={<TicketAdminPage />} />
            <Route path="/admin/tickets" element={<TicketAdminPage />} />
          </>
        )}
      </Routes>
    )}
  </BrowserRouter>
);
