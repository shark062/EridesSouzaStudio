import { useState } from 'react';
import { theme, getCardStyle, getButtonStyle } from '../../utils/theme';

const TechniqueForm = ({ booking, onComplete, onCancel }) => {
  const [formData, setFormData] = useState({
    technique: '',
    otherTechnique: '',
    color: '',
    format: '',
    details: '',
    procedureDate: new Date().toISOString().split('T')[0],
    maintenanceDate: '',
    photographicConsent: false,
    city: 'Cidade Brasileira',
    clientSignature: '',
    professionalSignature: 'Erides Souza'
  });

  const techniques = [
    { id: 'gel', label: 'Gel' },
    { id: 'fibra_vidro', label: 'Fibra de Vidro' },
    { id: 'acrigel', label: 'Acrigel' },
    { id: 'porcelana', label: 'Porcelana' },
    { id: 'outra', label: 'Outra' }
  ];

  const nailFormats = [
    { id: 'quadrado', label: '⬜ Quadrado', emoji: '🟦' },
    { id: 'redondo', label: '⭕ Redondo', emoji: '🔴' },
    { id: 'oval', label: '🥚 Oval', emoji: '🥚' },
    { id: 'amendoa', label: '🥜 Amêndoa', emoji: '🌰' },
    { id: 'stiletto', label: '📐 Stiletto', emoji: '🔺' }
  ];

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    if (!formData.technique || !formData.color || !formData.format || !formData.maintenanceDate) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const completedData = {
      ...formData,
      bookingId: booking.id,
      completedAt: new Date().toISOString(),
      clientName: booking.clientName || 'Cliente',
      serviceName: booking.serviceName
    };

    onComplete(completedData);
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
        <div className="card-header">
          <span className="card-icon">💅</span>
          <h3 className="card-title">Técnica Aplicada - Finalizar Serviço</h3>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFD700',
              fontSize: '1.5rem',
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 0' }}>
          {/* Informações do Agendamento */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <h4 style={{ color: '#FFD700', margin: '0 0 10px 0' }}>Informações do Agendamento</h4>
            <p style={{ margin: '5px 0', color: 'white' }}>
              <strong>Cliente:</strong> {booking.clientName || 'N/A'}
            </p>
            <p style={{ margin: '5px 0', color: 'white' }}>
              <strong>Serviço:</strong> {booking.serviceName}
            </p>
            <p style={{ margin: '5px 0', color: 'white' }}>
              <strong>Data/Hora:</strong> {booking.date} às {booking.time}
            </p>
          </div>

          {/* Técnica Aplicada */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#FFD700',
              fontWeight: '600'
            }}>
              Técnica Aplicada *
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '10px' }}>
              {techniques.map(tech => (
                <label key={tech.id} style={{ display: 'flex', alignItems: 'center', color: 'white', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="technique"
                    value={tech.id}
                    checked={formData.technique === tech.id}
                    onChange={(e) => handleChange('technique', e.target.value)}
                    style={{ marginRight: '8px', accentColor: '#FFD700' }}
                  />
                  {tech.label}
                </label>
              ))}
            </div>
            {formData.technique === 'outra' && (
              <input
                type="text"
                value={formData.otherTechnique}
                onChange={(e) => handleChange('otherTechnique', e.target.value)}
                placeholder="Especifique a técnica..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid rgba(255, 215, 0, 0.3)',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: 'white'
                }}
              />
            )}
          </div>

          {/* Cor */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#FFD700',
              fontWeight: '600'
            }}>
              Cor *
            </label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => handleChange('color', e.target.value)}
              placeholder="Descreva a cor utilizada..."
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'white'
              }}
            />
          </div>

          {/* Formato */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#FFD700',
              fontWeight: '600'
            }}>
              Formato *
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
              {nailFormats.map(format => (
                <label key={format.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: 'white', 
                  cursor: 'pointer',
                  padding: '8px 12px',
                  border: formData.format === format.id ? '2px solid #FFD700' : '1px solid rgba(255, 215, 0, 0.3)',
                  borderRadius: '8px',
                  background: formData.format === format.id ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
                }}>
                  <input
                    type="radio"
                    name="format"
                    value={format.id}
                    checked={formData.format === format.id}
                    onChange={(e) => handleChange('format', e.target.value)}
                    style={{ marginRight: '8px', accentColor: '#FFD700' }}
                  />
                  <span style={{ fontSize: '1.2rem', marginRight: '5px' }}>{format.emoji}</span>
                  {format.label.split(' ')[1]}
                </label>
              ))}
            </div>
          </div>

          {/* Detalhes */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#FFD700',
              fontWeight: '600'
            }}>
              Detalhes
            </label>
            <textarea
              value={formData.details}
              onChange={(e) => handleChange('details', e.target.value)}
              placeholder="Descreva detalhes adicionais do procedimento..."
              rows="3"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Datas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#FFD700',
                fontWeight: '600'
              }}>
                Data do Procedimento
              </label>
              <input
                type="date"
                value={formData.procedureDate}
                onChange={(e) => handleChange('procedureDate', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid rgba(255, 215, 0, 0.3)',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: 'white'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#FFD700',
                fontWeight: '600'
              }}>
                Data da Manutenção *
              </label>
              <input
                type="date"
                value={formData.maintenanceDate}
                onChange={(e) => handleChange('maintenanceDate', e.target.value)}
                min={formData.procedureDate}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid rgba(255, 215, 0, 0.3)',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: 'white'
                }}
              />
            </div>
          </div>

          {/* Termo de Autorização */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <h4 style={{ color: '#FFD700', margin: '0 0 15px 0' }}>Termo de Autorização</h4>
            <p style={{ 
              color: 'white', 
              fontSize: '0.9rem', 
              lineHeight: '1.5',
              margin: '0 0 15px 0'
            }}>
              Autorizo a realização do procedimento e o registro fotográfico do antes e depois, para 
              documentação e divulgação da profissional. As declarações acima são verdadeiras, não 
              cabendo à profissional a responsabilidade por informações omitidas nesta avaliação. 
              Me comprometo a seguir todas as recomendações necessárias após o procedimento.
            </p>
            <label style={{ display: 'flex', alignItems: 'center', color: 'white', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.photographicConsent}
                onChange={(e) => handleChange('photographicConsent', e.target.checked)}
                style={{ marginRight: '8px', accentColor: '#FFD700' }}
              />
              Autorizo o registro fotográfico e uso das imagens para divulgação profissional
            </label>
          </div>

          {/* Local e Data */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#FFD700',
              fontWeight: '600'
            }}>
              Cidade
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'white'
              }}
            />
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                ...getButtonStyle('secondary'),
                padding: '12px 24px'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                ...getButtonStyle('primary'),
                padding: '12px 24px'
              }}
            >
              Finalizar e Gerar Termo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TechniqueForm;