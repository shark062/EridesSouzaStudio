import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Configuração de sincronização de dados
const SYNC_CONFIG = {
  apiBase: 'http://0.0.0.0:3000/api',
  syncInterval: 30000, // 30 segundos
  maxRetries: 3
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('disconnected');

  // Funções de sincronização
  const syncWithServer = async () => {
    try {
      setSyncStatus('syncing');
      
      // Buscar dados do servidor
      const response = await fetch(`${SYNC_CONFIG.apiBase}/sync`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const serverData = await response.json();
        
        // Sincronizar usuários
        if (serverData.users) {
          localStorage.setItem('registeredUsers', JSON.stringify(serverData.users));
        }
        
        // Sincronizar agendamentos
        if (serverData.bookings) {
          localStorage.setItem('bookings', JSON.stringify(serverData.bookings));
        }
        
        // Sincronizar serviços
        if (serverData.services) {
          localStorage.setItem('services', JSON.stringify(serverData.services));
        }
        
        setSyncStatus('connected');
        console.log('✅ Dados sincronizados com sucesso');
      } else {
        throw new Error('Falha na sincronização');
      }
    } catch (error) {
      console.log('📱 Modo offline - dados locais mantidos');
      setSyncStatus('offline');
    }
  };

  const pushDataToServer = async (dataType, data) => {
    try {
      const response = await fetch(`${SYNC_CONFIG.apiBase}/sync/${dataType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        await syncWithServer(); // Resincronizar após push
        return { success: true };
      }
    } catch (error) {
      console.log('📱 Dados salvos localmente, sincronizarão quando conectar');
    }
    return { success: false };
  };

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem('user');
    const savedIsAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAdmin(savedIsAdmin);
    }

    // Iniciar sincronização
    syncWithServer();
    
    // Configurar sincronização automática
    const syncInterval = setInterval(syncWithServer, SYNC_CONFIG.syncInterval);
    
    // Listener para detectar quando a aba fica ativa
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncWithServer();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    setLoading(false);

    return () => {
      clearInterval(syncInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const login = async (username, password) => {
    // Verificar se é o admin
    if (username === 'Erides Souza' && password === '301985') {
      const adminUser = {
        id: 'admin',
        name: 'Erides Souza',
        email: 'erides@salon.com',
        role: 'admin'
      };
      setUser(adminUser);
      setIsAdmin(true);
      localStorage.setItem('user', JSON.stringify(adminUser));
      localStorage.setItem('isAdmin', 'true');
      return { success: true, user: adminUser };
    }

    // Verificar usuários normais (simulado)
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const foundUser = users.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      const userObj = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        phone: foundUser.phone,
        role: 'client'
      };
      setUser(userObj);
      setIsAdmin(false);
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('isAdmin', 'false');
      return { success: true, user: userObj };
    }

    return { success: false, message: 'Usuário ou senha incorretos' };
  };

  const register = async (userData) => {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Verificar se o usuário já existe
    if (users.find(u => u.username === userData.username || u.email === userData.email)) {
      return { success: false, message: 'Usuário já existe' };
    }

    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
      loyaltyPoints: 0,
      totalVisits: 0
    };

    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    // Tentar sincronizar com servidor
    await pushDataToServer('users', users);
    
    return { success: true, message: 'Usuário registrado com sucesso' };
  };

  const updateUserProfile = async (updatedData) => {
    try {
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex === -1) {
        return { success: false, message: 'Usuário não encontrado' };
      }

      // Atualizar dados do usuário
      const updatedUser = {
        ...users[userIndex],
        ...updatedData
      };

      users[userIndex] = updatedUser;
      localStorage.setItem('registeredUsers', JSON.stringify(users));
      
      // Atualizar usuário logado
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true, message: 'Perfil atualizado com sucesso' };
    } catch (error) {
      return { success: false, message: 'Erro ao atualizar perfil' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
  };

  const value = {
    user,
    isAdmin,
    loading,
    syncStatus,
    login,
    register,
    updateUserProfile,
    logout,
    syncWithServer,
    pushDataToServer
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};