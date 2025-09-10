import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { theme, getCardStyle, getButtonStyle } from '../../utils/theme';
import './Auth.css';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    birthDate: '',
    occupation: '',
    indication: '',
    address: '',
    cep: '',
    cpf: '',
    rg: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const result = await register(formData);
      if (result.success) {
        setSuccess('Conta criada com sucesso! Você pode fazer login agora.');
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    let value = e.target.value;
    
    // Formatação automática para CPF
    if (e.target.name === 'cpf') {
      value = value.replace(/\D/g, '');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    
    // Formatação automática para CEP
    if (e.target.name === 'cep') {
      value = value.replace(/\D/g, '');
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }
    
    // Formatação automática para telefone
    if (e.target.name === 'phone') {
      value = value.replace(/\D/g, '');
      value = value.replace(/(\d{2})(\d)/, '($1) $2');
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }
    
    // Formatação automática para data de nascimento
    if (e.target.name === 'birthDate') {
      value = value.replace(/\D/g, '');
      value = value.replace(/(\d{2})(\d)/, '$1/$2');
      value = value.replace(/(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
    }

    setFormData({
      ...formData,
      [e.target.name]: value
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
          <h1 className="salon-title">📋 Ficha de Cadastro</h1>
          <p className="salon-subtitle">Complete suas informações pessoais</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Seção: Dados Pessoais */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#FFD700', margin: '0 0 15px 0', fontSize: '1.1rem' }}>👤 Dados Pessoais</h3>
            
            <div className="form-group">
              <label htmlFor="name">Nome Completo *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome completo"
                required
                className="auth-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="birthDate">Data de Nascimento *</label>
                <input
                  type="text"
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  placeholder="DD/MM/AAAA"
                  required
                  className="auth-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="occupation">Ocupação</label>
                <input
                  type="text"
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="Sua profissão"
                  className="auth-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="indication">Indicação</label>
              <input
                type="text"
                id="indication"
                name="indication"
                value={formData.indication}
                onChange={handleChange}
                placeholder="Como nos conheceu? (opcional)"
                className="auth-input"
              />
            </div>
          </div>

          {/* Seção: Endereço */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#FFD700', margin: '0 0 15px 0', fontSize: '1.1rem' }}>📍 Endereço</h3>
            
            <div className="form-group">
              <label htmlFor="address">Endereço Completo</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Rua, número, bairro, cidade"
                className="auth-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cep">CEP</label>
              <input
                type="text"
                id="cep"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                placeholder="00000-000"
                maxLength="9"
                className="auth-input"
              />
            </div>
          </div>

          {/* Seção: Documentos */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#FFD700', margin: '0 0 15px 0', fontSize: '1.1rem' }}>📄 Documentos</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cpf">CPF</label>
                <input
                  type="text"
                  id="cpf"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                  maxLength="14"
                  className="auth-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="rg">RG</label>
                <input
                  type="text"
                  id="rg"
                  name="rg"
                  value={formData.rg}
                  onChange={handleChange}
                  placeholder="00.000.000-0"
                  className="auth-input"
                />
              </div>
            </div>
          </div>

          {/* Seção: Contato */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#FFD700', margin: '0 0 15px 0', fontSize: '1.1rem' }}>📞 Contato</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Telefone *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                  required
                  className="auth-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  required
                  className="auth-input"
                />
              </div>
            </div>
          </div>

          {/* Seção: Acesso */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#FFD700', margin: '0 0 15px 0', fontSize: '1.1rem' }}>🔐 Dados de Acesso</h3>
            
            <div className="form-group">
              <label htmlFor="username">Usuário *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Escolha um nome de usuário"
                required
                className="auth-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Senha *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="auth-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Senha *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirme sua senha"
                  required
                  className="auth-input"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              ✅ {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-button primary"
            style={getButtonStyle('primary')}
          >
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>

          <div className="auth-links">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="link-button"
            >
              Já tem conta? Faça login aqui
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;