import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { theme, getCardStyle, getButtonStyle } from '../../utils/theme';
import './Auth.css';

const LoginForm = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password);
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="floating-elements">
          <div className="floating-circle"></div>
          <div className="floating-circle"></div>
          <div className="floating-circle"></div>
        </div>
      </div>
      
      <div className="auth-card" style={getCardStyle(true)}>
        <div className="auth-header">
          <h1 className="salon-title">ERIDES SOUZA ESTÚDIO</h1>
          <p className="salon-subtitle">Bem-vindo ao seu espaço de beleza</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Usuário</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Digite seu usuário"
              required
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Digite sua senha"
              required
              className="auth-input"
            />
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-button primary"
            style={getButtonStyle('primary')}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="auth-links">
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="link-button"
            >
              Não tem conta? Registre-se aqui
            </button>
          </div>

          <div className="admin-hint">
            <small>
              💼 Acesso administrativo disponível para profissionais
            </small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;