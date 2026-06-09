import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import React from 'react'
import store from './redux/store.jsx'
import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from './lib/queryClient.js'
import './index.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/utils.css'
import './functions/fontAwesomeIconSetup.js'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </Provider>,
)
