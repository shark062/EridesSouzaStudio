import { useState, useEffect } from 'react';
import { getButtonStyle, getCardStyle } from '../../utils/theme';
import n8nService from '../../services/n8nService';

const AutomationPanel = () => {
  const [automationSettings, setAutomationSettings] = useState({
    booking: {
      enabled: true,
      sendConfirmationEmail: true,
      sendWhatsAppReminder: true,
      scheduleReminders: true,
      reminderHours: [24, 2], // horas antes do agendamento
      notifyProfessional: true
    },
    chat: {
      enabled: true,
      useAI: true,
      autoResponse: true,
      businessHours: {
        enabled: true,
        start: '08:00',
        end: '18:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      }
    },
    notifications: {
      enabled: true,
      birthday: true,
      loyaltyRewards: true,
      feedbackRequest: true,
      promotional: true,
      channels: {
        email: true,
        whatsapp: true,
        sms: false
      }
    },
    professional: {
      dailyReports: true,
      inventoryAlerts: true,
      bookingAlerts: true,
      paymentNotifications: true,
      customerFeedbackAlerts: true
    }
  });

  const [n8nStatus, setN8nStatus] = useState('checking');
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Carregar configurações salvas
    const savedSettings = localStorage.getItem('automationSettings');
    if (savedSettings) {
      setAutomationSettings(JSON.parse(savedSettings));
    }

    // Verificar status do N8n
    checkN8nConnection();
  }, []);

  const checkN8nConnection = async () => {
    setN8nStatus('checking');
    const isConnected = await n8nService.checkN8nStatus();
    setN8nStatus(isConnected ? 'connected' : 'offline');
  };

  const saveSettings = () => {
    localStorage.setItem('automationSettings', JSON.stringify(automationSettings));
    alert('✅ Configurações de automação salvas com sucesso!');
  };

  const updateSetting = (category, setting, value) => {
    setAutomationSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const updateNestedSetting = (category, subcategory, setting, value) => {
    setAutomationSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subcategory]: {
          ...prev[category][subcategory],
          [setting]: value
        }
      }
    }));
  };

  const testAutomation = async (type) => {
    setIsLoading(true);
    setTestResults(prev => ({ ...prev, [type]: 'testing' }));

    try {
      let result;
      const testData = {
        id: 'test_' + Date.now(),
        serviceName: 'Teste Manicure',
        date: '2025-01-15',
        time: '14:00',
        price: 25.00
      };

      const testUser = {
        id: 'test_user',
        name: 'Cliente Teste',
        email: 'test@email.com',
        phone: '+5511999999999'
      };

      switch (type) {
        case 'booking':
          result = await n8nService.automate_newBooking(testData, testUser);
          break;
        case 'chat':
          result = await n8nService.sendChatMessage('Teste de automação', testUser.id);
          break;
        case 'notification':
          result = await n8nService.automate_birthdayReminder(testUser);
          break;
        case 'professional':
          result = await n8nService.sendProfessionalAutomation('test_alert', testData);
          break;
        default:
          result = { success: false, error: 'Tipo de teste inválido' };
      }

      setTestResults(prev => ({
        ...prev,
        [type]: result.success ? 'success' : 'failed'
      }));

    } catch (error) {
      setTestResults(prev => ({ ...prev, [type]: 'failed' }));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return '#4CAF50';
      case 'offline': return '#F44336';
      case 'checking': return '#FF9800';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return '🟢 Conectado';
      case 'offline': return '🔴 Offline';
      case 'checking': return '🟡 Verificando...';
      default: return '❓ Desconhecido';
    }
  };

  return (
    <div className="automation-panel" style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #FFD700, #FFF8DC)',
        color: '#000',
        padding: '25px',
        borderRadius: '16px',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>
          🤖 Painel de Automação N8n
        </h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '1.1rem' }}>
          Configure automações inteligentes para otimizar seu salão
        </p>
      </div>

      {/* Status N8n */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid rgba(255, 215, 0, 0.3)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ color: '#FFD700', margin: '0 0 10px 0' }}>Status da Conexão N8n</h3>
          <p style={{ 
            color: getStatusColor(n8nStatus), 
            fontSize: '1.2rem', 
            fontWeight: 'bold',
            margin: 0 
          }}>
            {getStatusText(n8nStatus)}
          </p>
        </div>
        <button
          onClick={checkN8nConnection}
          style={{
            ...getButtonStyle('secondary'),
            padding: '10px 20px'
          }}
        >
          🔄 Verificar Conexão
        </button>
      </div>

      {/* Configurações */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        {/* Automação de Agendamentos */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{ color: '#FFD700', marginBottom: '20px' }}>📅 Automação de Agendamentos</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', color: 'white', marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={automationSettings.booking.enabled}
                onChange={(e) => updateSetting('booking', 'enabled', e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              Habilitar automação de agendamentos
            </label>
          </div>

          {automationSettings.booking.enabled && (
            <>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: 'white', marginBottom: '5px' }}>
                  <input
                    type="checkbox"
                    checked={automationSettings.booking.sendConfirmationEmail}
                    onChange={(e) => updateSetting('booking', 'sendConfirmationEmail', e.target.checked)}
                    style={{ marginRight: '10px' }}
                  />
                  Enviar email de confirmação
                </label>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: 'white', marginBottom: '5px' }}>
                  <input
                    type="checkbox"
                    checked={automationSettings.booking.sendWhatsAppReminder}
                    onChange={(e) => updateSetting('booking', 'sendWhatsAppReminder', e.target.checked)}
                    style={{ marginRight: '10px' }}
                  />
                  Enviar lembrete via WhatsApp
                </label>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: 'white', marginBottom: '5px' }}>
                  <input
                    type="checkbox"
                    checked={automationSettings.booking.notifyProfessional}
                    onChange={(e) => updateSetting('booking', 'notifyProfessional', e.target.checked)}
                    style={{ marginRight: '10px' }}
                  />
                  Notificar profissional
                </label>
              </div>
            </>
          )}

          <button
            onClick={() => testAutomation('booking')}
            style={{
              ...getButtonStyle('primary'),
              width: '100%',
              marginTop: '15px'
            }}
            disabled={isLoading}
          >
            {testResults.booking === 'testing' ? '⏳ Testando...' : 
             testResults.booking === 'success' ? '✅ Teste OK' :
             testResults.booking === 'failed' ? '❌ Falhou' : '🧪 Testar Automação'}
          </button>
        </div>

        {/* Chat Inteligente */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{ color: '#FFD700', marginBottom: '20px' }}>💬 Chat Inteligente</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', color: 'white', marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={automationSettings.chat.enabled}
                onChange={(e) => updateSetting('chat', 'enabled', e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              Habilitar chat automático
            </label>
          </div>

          {automationSettings.chat.enabled && (
            <>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: 'white', marginBottom: '5px' }}>
                  <input
                    type="checkbox"
                    checked={automationSettings.chat.useAI}
                    onChange={(e) => updateSetting('chat', 'useAI', e.target.checked)}
                    style={{ marginRight: '10px' }}
                  />
                  Usar inteligência artificial
                </label>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: 'white', display: 'block', marginBottom: '5px' }}>
                  Horário de funcionamento:
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="time"
                    value={automationSettings.chat.businessHours.start}
                    onChange={(e) => updateNestedSetting('chat', 'businessHours', 'start', e.target.value)}
                    style={{
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      borderRadius: '6px',
                      color: 'white',
                      padding: '5px'
                    }}
                  />
                  <span style={{ color: 'white' }}>até</span>
                  <input
                    type="time"
                    value={automationSettings.chat.businessHours.end}
                    onChange={(e) => updateNestedSetting('chat', 'businessHours', 'end', e.target.value)}
                    style={{
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      borderRadius: '6px',
                      color: 'white',
                      padding: '5px'
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <button
            onClick={() => testAutomation('chat')}
            style={{
              ...getButtonStyle('primary'),
              width: '100%',
              marginTop: '15px'
            }}
            disabled={isLoading}
          >
            {testResults.chat === 'testing' ? '⏳ Testando...' : 
             testResults.chat === 'success' ? '✅ Teste OK' :
             testResults.chat === 'failed' ? '❌ Falhou' : '🧪 Testar Chat IA'}
          </button>
        </div>

        {/* Notificações */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{ color: '#FFD700', marginBottom: '20px' }}>🔔 Notificações Inteligentes</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', color: 'white', marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={automationSettings.notifications.enabled}
                onChange={(e) => updateSetting('notifications', 'enabled', e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              Habilitar notificações automáticas
            </label>
          </div>

          {automationSettings.notifications.enabled && (
            <>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: 'white', marginBottom: '5px' }}>
                  <input
                    type="checkbox"
                    checked={automationSettings.notifications.birthday}
                    onChange={(e) => updateSetting('notifications', 'birthday', e.target.checked)}
                    style={{ marginRight: '10px' }}
                  />
                  🎂 Parabéns de aniversário
                </label>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: 'white', marginBottom: '5px' }}>
                  <input
                    type="checkbox"
                    checked={automationSettings.notifications.loyaltyRewards}
                    onChange={(e) => updateSetting('notifications', 'loyaltyRewards', e.target.checked)}
                    style={{ marginRight: '10px' }}
                  />
                  🏆 Recompensas de fidelidade
                </label>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ color: '#FFD700', fontSize: '1rem', marginBottom: '10px' }}>Canais de comunicação:</h4>
                <label style={{ display: 'flex', alignItems: 'center', color: 'white', marginBottom: '5px' }}>
                  <input
                    type="checkbox"
                    checked={automationSettings.notifications.channels.email}
                    onChange={(e) => updateNestedSetting('notifications', 'channels', 'email', e.target.checked)}
                    style={{ marginRight: '10px' }}
                  />
                  📧 Email
                </label>
                <label style={{ display: 'flex', alignItems: 'center', color: 'white', marginBottom: '5px' }}>
                  <input
                    type="checkbox"
                    checked={automationSettings.notifications.channels.whatsapp}
                    onChange={(e) => updateNestedSetting('notifications', 'channels', 'whatsapp', e.target.checked)}
                    style={{ marginRight: '10px' }}
                  />
                  📱 WhatsApp
                </label>
              </div>
            </>
          )}

          <button
            onClick={() => testAutomation('notification')}
            style={{
              ...getButtonStyle('primary'),
              width: '100%',
              marginTop: '15px'
            }}
            disabled={isLoading}
          >
            {testResults.notification === 'testing' ? '⏳ Testando...' : 
             testResults.notification === 'success' ? '✅ Teste OK' :
             testResults.notification === 'failed' ? '❌ Falhou' : '🧪 Testar Notificações'}
          </button>
        </div>

        {/* Automação Profissional */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{ color: '#FFD700', marginBottom: '20px' }}>👩‍💼 Automação Profissional</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', color: 'white', marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={automationSettings.professional.dailyReports}
                onChange={(e) => updateSetting('professional', 'dailyReports', e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              📊 Relatórios diários automáticos
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', color: 'white', marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={automationSettings.professional.bookingAlerts}
                onChange={(e) => updateSetting('professional', 'bookingAlerts', e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              🔔 Alertas de novos agendamentos
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', color: 'white', marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={automationSettings.professional.customerFeedbackAlerts}
                onChange={(e) => updateSetting('professional', 'customerFeedbackAlerts', e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              ⭐ Alertas de feedback de clientes
            </label>
          </div>

          <button
            onClick={() => testAutomation('professional')}
            style={{
              ...getButtonStyle('primary'),
              width: '100%',
              marginTop: '15px'
            }}
            disabled={isLoading}
          >
            {testResults.professional === 'testing' ? '⏳ Testando...' : 
             testResults.professional === 'success' ? '✅ Teste OK' :
             testResults.professional === 'failed' ? '❌ Falhou' : '🧪 Testar Automação'}
          </button>
        </div>
      </div>

      {/* Botão Salvar */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          onClick={saveSettings}
          style={{
            ...getButtonStyle('primary'),
            padding: '15px 40px',
            fontSize: '1.1rem',
            marginRight: '15px'
          }}
        >
          💾 Salvar Configurações
        </button>
        
        <button
          onClick={() => {
            Promise.all([
              testAutomation('booking'),
              testAutomation('chat'),
              testAutomation('notification'),
              testAutomation('professional')
            ]);
          }}
          style={{
            ...getButtonStyle('secondary'),
            padding: '15px 40px',
            fontSize: '1.1rem'
          }}
          disabled={isLoading}
        >
          🧪 Testar Tudo
        </button>
      </div>
    </div>
  );
};

export default AutomationPanel;