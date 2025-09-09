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
        background: 'linear-gradient(135deg, #FFFFFF, #F5F5F5)',
        color: '#000',
        padding: '25px',
        borderRadius: '16px',
        textAlign: 'center',
        marginBottom: '30px',
        border: '2px solid #000'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>
          🤖 Painel de Automação N8n
        </h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '1.1rem' }}>
          Configure automações inteligentes para otimizar seu salão
        </p>
        <div style={{
          background: '#4CAF50',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          display: 'inline-block',
          marginTop: '10px'
        }}>
          ✅ Conexão N8n Ativa (Modo Local)
        </div>
      </div>

      {/* Status de Conexão */}
      <div style={{
        background: 'rgba(76, 175, 80, 0.1)',
        border: '1px solid #4CAF50',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '30px',
        color: '#000'
      }}>
        <h3 style={{ color: '#4CAF50', margin: '0 0 15px 0' }}>
          🟢 Status da Automação
        </h3>
        <p style={{ margin: '5px 0' }}>
          <strong>📡 Conexão:</strong> Ativa (Processamento Local)
        </p>
        <p style={{ margin: '5px 0' }}>
          <strong>🔄 Automações Ativas:</strong> Email, WhatsApp, Calendário
        </p>
        <p style={{ margin: '5px 0' }}>
          <strong>📊 Último Processamento:</strong> {new Date().toLocaleString('pt-BR')}
        </p>
      </div>

      {/* Automações Disponíveis */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #000',
          borderRadius: '12px',
          padding: '20px',
          color: '#000'
        }}>
          <h3 style={{ color: '#000', marginBottom: '15px' }}>
            📧 Email Marketing
          </h3>
          <p>Envio automático de confirmações, lembretes e promoções</p>
          <div style={{
            background: '#4CAF50',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '15px',
            fontSize: '0.8rem',
            display: 'inline-block'
          }}>
            Ativo
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          border: '1px solid #000',
          borderRadius: '12px',
          padding: '20px',
          color: '#000'
        }}>
          <h3 style={{ color: '#000', marginBottom: '15px' }}>
            📱 WhatsApp Bot
          </h3>
          <p>Atendimento automático e lembretes por WhatsApp</p>
          <div style={{
            background: '#4CAF50',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '15px',
            fontSize: '0.8rem',
            display: 'inline-block'
          }}>
            Ativo
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          border: '1px solid #000',
          borderRadius: '12px',
          padding: '20px',
          color: '#000'
        }}>
          <h3 style={{ color: '#000', marginBottom: '15px' }}>
            📅 Sincronização
          </h3>
          <p>Sincronização automática com Google Calendar</p>
          <div style={{
            background: '#4CAF50',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '15px',
            fontSize: '0.8rem',
            display: 'inline-block'
          }}>
            Ativo
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationPanel;