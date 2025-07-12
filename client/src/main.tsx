import { createRoot } from 'react-dom/client'
import App from './App.tsx' // This is your main DreamIt App component
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);