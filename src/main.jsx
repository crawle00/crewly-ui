import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider
      theme={{
        primaryColor: 'blue',
        fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        headings: {
          fontFamily: "'Sora', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        },
      }}
    >
      <App />
    </MantineProvider>
  </StrictMode>,
)