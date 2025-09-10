import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Configuração de sincronização de dados
const SYNC_CONFIG = {
  apiBase: `${window.location.protocol}//${window.location.hostname}:3000/api`,
  syncInterval: 60000, // 1 minuto
  maxRetries: 3,
  retryDelay: 5000, // 5 segundos
  timeout: 10000 // 10 segundos
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
  const [syncStatus, setSyncStatus] = useState('connected'); // Sync status initialized to 'connected' for silent background operation

  // Funções de sincronização melhoradas
  const syncWithServer = async (retryCount = 0) => {
    try {
      // Sincronização silenciosa em segundo plano
      if (retryCount === 0) {
        setSyncStatus('connected');
      }
      console.log('🔄 Iniciando sincronização...', { attempt: retryCount + 1 });

      // Primeiro, enviar dados locais para o servidor
      await pushLocalDataToServer();

      // Buscar dados do servidor com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), SYNC_CONFIG.timeout); // Use configured timeout

      const response = await fetch(`${SYNC_CONFIG.apiBase}/sync`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const serverData = await response.json();
        console.log('📡 Dados recebidos do servidor:', {
          users: serverData.users?.length || 0,
          bookings: serverData.bookings?.length || 0,
          services: serverData.services?.length || 0
        });

        // Sincronizar usuários
        if (serverData.users && Array.isArray(serverData.users)) {
          const localUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const mergedUsers = mergeArraysById(localUsers, serverData.users);
          localStorage.setItem('registeredUsers', JSON.stringify(mergedUsers));
          console.log('👥 Usuários sincronizados:', mergedUsers.length);
        }

        // Sincronizar agendamentos - garantir compatibilidade com múltiplas chaves
        if (serverData.bookings && Array.isArray(serverData.bookings)) {
          const sources = ['userBookings', 'bookings', 'allBookings'];
          let localBookings = [];

          // Coletar agendamentos de todas as fontes
          sources.forEach(source => {
            const sourceData = JSON.parse(localStorage.getItem(source) || '[]');
            if (sourceData.length > 0) {
              localBookings = localBookings.concat(sourceData);
            }
          });

          // Remover duplicatas baseado no ID
          const uniqueLocalBookings = localBookings.filter((booking, index, self) => 
            index === self.findIndex(b => b.id === booking.id)
          );

          const mergedBookings = mergeArraysById(uniqueLocalBookings, serverData.bookings);

          // Salvar em todas as chaves para compatibilidade
          localStorage.setItem('userBookings', JSON.stringify(mergedBookings));
          localStorage.setItem('bookings', JSON.stringify(mergedBookings));
          localStorage.setItem('allBookings', JSON.stringify(mergedBookings));

          console.log('📋 Agendamentos sincronizados:', mergedBookings.length);
        }

        // Sincronizar serviços
        if (serverData.services && Array.isArray(serverData.services)) {
          localStorage.setItem('services', JSON.stringify(serverData.services));
          console.log('💅 Serviços sincronizados:', serverData.services.length);
        }

        setSyncStatus('connected');
        console.log('✅ Sincronização completa com sucesso');

        // Disparar evento personalizado para notificar componentes
        window.dispatchEvent(new CustomEvent('dataSync', { 
          detail: { 
            users: true, 
            bookings: true, 
            services: true,
            timestamp: Date.now() 
          } 
        }));

        return true;

      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('⚠️ Erro na sincronização:', error.message);

      // Tentar novamente em caso de erro
      if (retryCount < SYNC_CONFIG.maxRetries) { // Use configured max retries
        console.log(`🔄 Tentando novamente em ${SYNC_CONFIG.retryDelay/1000}s... (${retryCount + 1}/${SYNC_CONFIG.maxRetries})`);
        setTimeout(() => {
          syncWithServer(retryCount + 1);
        }, SYNC_CONFIG.retryDelay); // Use configured retry delay
      } else {
        console.log('📱 Modo offline - dados locais mantidos');
        setSyncStatus('offline');
      }

      return false;
    }
  };

  // Função para mesclar arrays por ID, evitando duplicatas
  const mergeArraysById = (localArray, serverArray) => {
    const merged = [...localArray];
    const localIds = new Set(localArray.map(item => item.id));

    serverArray.forEach(item => {
      if (!localIds.has(item.id)) {
        merged.push(item);
      }
    });

    return merged;
  };

  // Função para enviar dados locais para servidor
  const pushLocalDataToServer = async () => {
    try {
      const results = {};

      // Enviar usuários
      const localUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      if (localUsers.length > 0) {
        results.users = await pushDataToServer('users', localUsers);
        console.log('📤 Enviando usuários:', localUsers.length);
      }

      // Enviar agendamentos
      const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      if (localBookings.length > 0) {
        results.bookings = await pushDataToServer('bookings', localBookings);
        console.log('📤 Enviando agendamentos:', localBookings.length);
      }

      // Enviar serviços
      const localServices = JSON.parse(localStorage.getItem('services') || '[]');
      if (localServices.length > 0) {
        results.services = await pushDataToServer('services', localServices);
        console.log('📤 Enviando serviços:', localServices.length);
      }

      return results;
    } catch (error) {
      console.warn('📱 Erro ao enviar dados locais:', error.message);
      throw error;
    }
  };

  const pushDataToServer = async (dataType, data) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), SYNC_CONFIG.timeout); // Use configured timeout

      const response = await fetch(`${SYNC_CONFIG.apiBase}/sync/${dataType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ${dataType} enviados com sucesso:`, result);
        return { success: true, data: result };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn(`📱 Erro ao enviar ${dataType}:`, error.message);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    let syncIntervalId;
    let retryTimeoutId;

    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem('user');
    const savedIsAdmin = localStorage.getItem('isAdmin') === 'true';

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAdmin(savedIsAdmin);
    }

    // Função para iniciar sincronização com retry
    const startSync = async () => {
      const success = await syncWithServer();

      if (success) {
        // Se sincronização foi bem-sucedida, configurar intervalo regular
        syncIntervalId = setInterval(syncWithServer, SYNC_CONFIG.syncInterval); // Use configured sync interval
      } else {
        // Se falhou, tentar novamente em breve
        retryTimeoutId = setTimeout(startSync, SYNC_CONFIG.retryDelay); // Use configured retry delay
      }
    };

    // Iniciar sincronização
    startSync();

    // Listener para detectar quando a aba fica ativa
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Aba ficou ativa - sincronizando dados');
        syncWithServer();
      }
    };

    // Listener para mudanças no localStorage de outros dispositivos/abas
    const handleStorageChange = (e) => {
      const watchedKeys = ['userBookings', 'bookings', 'allBookings', 'registeredUsers', 'services'];
      if (watchedKeys.includes(e.key)) {
        console.log('🔄 Dados alterados em outro dispositivo/aba:', e.key);
        setTimeout(syncWithServer, 1000); // Delay para evitar conflitos
      }
    };

    // Listener para conexão de rede
    const handleOnline = () => {
      console.log('🌐 Conexão restaurada - sincronizando...');
      setSyncStatus('syncing');
      setTimeout(syncWithServer, 500);
    };

    // Listener para perda de conexão
    const handleOffline = () => {
      console.log('📱 Conexão perdida - modo offline');
      setSyncStatus('offline');
    };

    // Listener personalizado para forçar sincronização
    const handleForceSync = () => {
      console.log('🔄 Sincronização forçada solicitada');
      syncWithServer();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('forceSync', handleForceSync);

    setLoading(false);

    return () => {
      if (syncIntervalId) clearInterval(syncIntervalId);
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('forceSync', handleForceSync);
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