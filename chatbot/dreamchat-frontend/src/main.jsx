import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// --- Web Component Wrapper ---
import React from 'react';

class DreamableChatbotElement extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
  }
  connectedCallback() {
    // Create a container for React to render into
    const mountPoint = document.createElement('div');
    this._root.appendChild(mountPoint);
    // Pass attributes as props
    const apiEndpoint = this.getAttribute('api-endpoint') || undefined;
    const projectName = this.getAttribute('project-name') || undefined;
    createRoot(mountPoint).render(
      <StrictMode>
        <App apiEndpoint={apiEndpoint} projectName={projectName} />
      </StrictMode>
    );
  }
}

if (!customElements.get('dreamable-chatbot')) {
  customElements.define('dreamable-chatbot', DreamableChatbotElement);
}

// For local dev/demo
if (document.getElementById('root')) {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
