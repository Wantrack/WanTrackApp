import React, { useEffect, useState } from 'react';
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

import constants from './util/constans';
import { decode } from './util/base64';

const App = () => {
  const [destination, setDestination] = useState('');

  useEffect(() => {
    const _userinfoEncoded = localStorage.getItem(constants.userinfo);
    if (_userinfoEncoded) {
      try {
        const _userinfo = JSON.parse(decode(_userinfoEncoded));

        const _modules = _userinfo.modules?.replaceAll(' ', '').split(',') || [];
        if (_modules.length === 1 && _modules[0] === '21') {
          setDestination('/admin/documentsCheck');
        } else if (_modules.includes('11')) {
          setDestination('/admin/dashboardconversations');
        }
        if (_modules.includes('1')) {
          setDestination('/admin/dashboard');
        } else {

        }
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    }
  }, []);

  return (
    <ThemeContextWrapper>
      <BackgroundColorWrapper>
        <BrowserRouter>
          <Routes>
            <Route path="/admin/*" element={<AdminLayout />} />
            <Route path="/login/*" element={<RTLLayout />} />
            <Route path="*" element={<Navigate to={destination} replace />} />
          </Routes>
        </BrowserRouter>
      </BackgroundColorWrapper>
    </ThemeContextWrapper>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
