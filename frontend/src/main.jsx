import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import React from 'react'
import store from './redux/store.jsx'
import { Provider } from 'react-redux'
import './index.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/utils.css'


createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
