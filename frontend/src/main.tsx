import {  StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { store } from './store/reduxstore.ts'
import { Provider } from 'react-redux'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <ThemeProvider > */}
      <Provider store={store}>
        <App />
      </Provider>
    {/* </ThemeProvider > */}

  </StrictMode>,
)
