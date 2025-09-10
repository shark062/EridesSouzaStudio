import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

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

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem('user');
    const savedIsAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAdmin(savedIsAdmin);
    }
    setLoading(false);
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
    login,
    register,
    updateUserProfile,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};