import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import ChantiersList from './pages/ChantiersList'
import ChantierDetail from './pages/ChantierDetail'
import ChantierForm from './pages/ChantierForm'
import InterventionsList from './pages/InterventionsList'
import InterventionForm from './pages/InterventionForm'
import Settings from './pages/Settings.jsx'
import NotFound from './pages/NotFound'

// Layout
import Layout from './components/layout/Layout'
import Loader from './components/ui/Loader';

// Composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuthStore()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />
}

// Composant pour rediriger si déjà connecté
const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuthStore()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }
  
  return !user ? children : <Navigate to="/dashboard" replace />
}

function App() {
  const { initializeAuth, isLoading } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    
    initAuth();
  }, [initializeAuth]);

  // Afficher un loader pendant l'initialisation
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          {/* Routes protégées */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/chantiers/nouveau" element={
            <ProtectedRoute>
              <Layout>
                <ChantierForm />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/chantiers" element={
            <ProtectedRoute>
              <Layout>
                <ChantiersList />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/chantiers/:id" element={
            <ProtectedRoute>
              <Layout>
                <ChantierDetail />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/chantiers/:id/modifier" element={
            <ProtectedRoute>
              <Layout>
                <ChantierForm />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/interventions" element={
            <ProtectedRoute>
              <Layout>
                <InterventionsList />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/chantiers/:chantierId/interventions/nouvelle" element={
            <ProtectedRoute>
              <Layout>
                <InterventionForm />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/chantiers/:chantierId/interventions/:id/modifier" element={
            <ProtectedRoute>
              <Layout>
                <InterventionForm />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Redirection racine */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App 