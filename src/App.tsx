import React from 'react'
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom'
import {AuthProvider, useAuth} from './contexts/AuthContext'
import {LanguageProvider} from './contexts/LanguageContext'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p>Restoring session...</p>
      </div>
    )
  }
  
  if (!isAuthenticated) return <Navigate to="/" />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes/>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}

export default App