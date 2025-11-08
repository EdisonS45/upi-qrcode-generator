import React from 'react';
import ReactDOM from 'react-dom/client';

// 1. Import the Tailwind CSS file
import './index.css'; 


import AppWrapper from './App'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);