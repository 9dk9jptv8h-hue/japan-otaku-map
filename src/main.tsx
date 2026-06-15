import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register tile cache service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/japan-otaku-map/sw.js').catch(() => {})
}
