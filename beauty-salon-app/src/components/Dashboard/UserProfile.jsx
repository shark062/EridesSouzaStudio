import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { theme, getCardStyle, getButtonStyle } from '../../utils/theme';

const UserProfile = ({ onClose }) => {
  const { user, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    occupation: '',
    indication: '',
    address: '',
    cep: '',
    cpf: '',
    rg: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        birthDate: user.birthDate || '',
        occupation: user.occupation || '',
        indication: user.indication || '',
        address: user.address || '',
        cep: user.cep || '',
        cpf: user.cpf || '',
        rg: user.rg || ''
      });
    }
  }, [user]);

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

    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateUserProfile(formData);
      if (result.success) {
        setSuccess('Perfil atualizado com sucesso!');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        ...getCardStyle(true),
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '15px',
          borderBottom: '1px solid rgba(255, 215, 0, 0.3)'
        }}>
          <h2 style={{ color: '#FFD700', margin: 0, fontSize: '1.5rem' }}>
            👤 Editar Perfil
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFD700',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Seção: Dados Pessoais */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#FFD700', margin: '0 0 15px 0', fontSize: '1.1rem' }}>👤 Dados Pessoais</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: 'white', marginBottom: '5px' }}>
                Nome Completo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome completo"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', color: 'white', marginBottom: '5px' }}>
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', color: 'white', marginBottom: '5px' }}>
                  Ocupação
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="Sua profissão"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: 'white', marginBottom: '5px' }}>
                Indicação
              </label>
              <input
                type="text"
                name="indication"
                value={formData.indication}
                onChange={handleChange}
                placeholder="Como nos conheceu? (opcional)"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  fontSize: '1rem'
                }}
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
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: 'white', marginBottom: '5px' }}>
                Endereço Completo
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Rua, número, bairro, cidade"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: 'white', marginBottom: '5px' }}>
                CEP
              </label>
              <input
                type="text"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                placeholder="00000-000"
                maxLength="9"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  fontSize: '1rem'
                }}
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
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', color: 'white', marginBottom: '5px' }}>
                  CPF
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                  maxLength="14"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', color: 'white', marginBottom: '5px' }}>
                  RG
                </label>
                <input
                  type="text"
                  name="rg"
                  value={formData.rg}
                  onChange={handleChange}
                  placeholder="00.000.000-0"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    fontSize: '1rem'
                  }}
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
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', color: 'white', marginBottom: '5px' }}>
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'white', marginBottom: '5px' }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(255, 0, 0, 0.1)',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px',
              color: '#FF6B6B'
            }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={{
              background: 'rgba(0, 255, 0, 0.1)',
              border: '1px solid rgba(0, 255, 0, 0.3)',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px',
              color: '#4CAF50'
            }}>
              ✅ {success}
            </div>
          )}

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                ...getButtonStyle('secondary'),
                padding: '12px 24px'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...getButtonStyle('primary'),
                padding: '12px 24px'
              }}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;