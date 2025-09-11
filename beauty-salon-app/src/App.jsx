import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Header from './components/Layout/Header';
import ClientDashboard from './components/Dashboard/ClientDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import backgroundImage from './assets/background-nails.jpg';
import './App.css';

function AppContent() {
  const { user, isAdmin, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  // Aplicar imagem de fundo com filtro branco de 30%
  useEffect(() => {
    document.body.style.background = `
      linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.3)),
      url(${backgroundImage}) center center/cover no-repeat fixed
    `;
    
    // Cleanup quando o componente for desmontado
    return () => {
      document.body.style.background = '';
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)',
        color: '#FFD700',
        fontSize: '1.5rem'
      }}>
        Carregando...
      </div>
    );
  }

  if (!user) {
    return showRegister ? (
      <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  return (
    <div className="app-container">
      <Header />
      <main className="main-layout">
        {isAdmin ? <AdminDashboard /> : <ClientDashboard />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
