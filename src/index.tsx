import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Auth from "./components/pages/Auth/Auth";
import ProtectedRoute from './components/ui/ProtectedRoute/ProtectedRoute';

import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter basename="/auth/dashboard">
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<h1>Dashboard Home</h1>} />
        </Route>
        <Route element={<p>Not found</p>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
