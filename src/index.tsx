import "./index.css";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DarkModeProvider } from './context/DarkModeContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("No root element found");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <DarkModeProvider>
      <App />
    </DarkModeProvider>
  </React.StrictMode>
);
