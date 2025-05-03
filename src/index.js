import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import AdminLayout from 'layouts/Admin/Admin.js';
import RTLLayout from 'layouts/RTL/RTL.js';

import 'assets/scss/black-dashboard-react.scss';
import 'assets/demo/demo.css';
import 'assets/css/nucleo-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import ThemeContextWrapper from './components/ThemeWrapper/ThemeWrapper';
import BackgroundColorWrapper from './components/BackgroundColorWrapper/BackgroundColorWrapper';

const App = () => {
  return (
    <ThemeContextWrapper>
      <BackgroundColorWrapper>
        <BrowserRouter>
          <Routes>
            <Route path="/admin/*" element={<AdminLayout />} />
            <Route path="/login/*" element={<RTLLayout />} />
            <Route path="*" element={<Navigate to={'/admin'} replace />} />
          </Routes>
        </BrowserRouter>
      </BackgroundColorWrapper>
    </ThemeContextWrapper>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
