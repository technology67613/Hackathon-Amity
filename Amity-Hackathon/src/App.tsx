import { Routes, Route, Navigate } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Toast } from './components/Toast'
import { HomePage } from './pages/HomePage'
import { ReportPage } from './pages/ReportPage'
import { SearchPage } from './pages/SearchPage'
import { ItemDetailsPage } from './pages/ItemDetailsPage'
import { MyReportsPage } from './pages/MyReportsPage'
import './App.css'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/item/:id" element={<ItemDetailsPage />} />
          <Route path="/my-reports" element={<MyReportsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
      <Toast />
    </div>
  )
}
