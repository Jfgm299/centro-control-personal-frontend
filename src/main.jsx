import './i18n/index.js'  // ← debe ser el primer import después de React
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/home/HomePage'
import GymPage from './pages/gym/GymPage'
import ExpensesPage from './pages/expenses/ExpensesPage'
import FlightsPage from './pages/flights/FlightsPage'
import MacroPage from './pages/macro/MacroPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/gym" element={<GymPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/flights" element={<FlightsPage />} />
              <Route path='/macro' element={<MacroPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
)