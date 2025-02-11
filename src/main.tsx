import ReactDOM from 'react-dom/client'
import { NextUIProvider } from '@nextui-org/react'
import { Toaster } from 'react-hot-toast';
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <NextUIProvider>
    <Toaster/>
    <App />
  </NextUIProvider>
)
