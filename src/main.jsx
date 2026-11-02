import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'
import App from './App.jsx';
import Appareils from './Appareils.jsx';
import TransactionsList from './TransactionsList.jsx'
import TransactionForm from './TransactionForm.jsx';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <BrowserRouter>
         <Routes>
           {/* Route for the Home page */}
           <Route path="/" element={<App />} />

           {/* Route for the Appareils page */}
           <Route path="/appareils" element={<Appareils />} />
           <Route path="/transaction-form" element={<TransactionForm />} />
           <Route path="/transactions-list" element={<TransactionsList />} />
         </Routes>
       </BrowserRouter>
  </StrictMode>,
)
