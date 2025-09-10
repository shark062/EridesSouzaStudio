import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { theme, getCardStyle, getButtonStyle } from '../../utils/theme';
import AutomationPanel from './AutomationPanel';
import TechniqueForm from './TechniqueForm';
import SignaturePad from '../Common/SignaturePad';
import { PDFGenerator } from '../../utils/pdfGenerator';
import PDFPreview from './PDFPreview';
import n8nService from '../../services/n8nService';
import '../Layout/Layout.css';

const AdminDashboard = () => {
  const { user, syncStatus, syncWithServer } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedService, setSelectedService] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || null);
  const [showTechniqueForm, setShowTechniqueForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [pendingTechniqueData, setPendingTechniqueData] = useState(null);
  const [clientSignature, setClientSignature] = useState(null);
  const [professionalSignature, setProfessionalSignature] = useState(null);
  const [stats, setStats] = useState({
    todayBookings: 0,
    todayRevenue: 0,
    monthBookings: 0,
    monthRevenue: 0,
    yearRevenue: 0,
    totalClients: 0
  });

  useEffect(() => {
    loadData();
    loadServices();

    // Controlar seção ativa baseado no hash da URL
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#admin-', '');
      if (['overview', 'services', 'bookings', 'clients', 'automation'].includes(hash)) {
        setActiveTab(hash);
      } else {
        setActiveTab('overview');
      }
    };

    // Definir seção inicial baseada no hash atual
    handleHashChange();

    // Listener para sincronização automática
    const handleDataSync = (event) => {
      console.log('🔄 Dados sincronizados - recarregando dashboard admin');
      setLastSyncTime(new Date());
      loadData();
      loadServices();
    };

    // Listener para mudanças no localStorage
    const handleStorageChange = (e) => {
      const watchedKeys = ['userBookings', 'bookings', 'allBookings', 'registeredUsers', 'services'];
      if (watchedKeys.includes(e.key)) {
        console.log('📱 Dados atualizados:', e.key);
        setTimeout(() => {
          loadData();
          loadServices();
        }, 100); // Pequeno delay para garantir que os dados foram salvos
      }
    };

    // Listener para quando a aba fica ativa
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Aba ficou ativa - recarregando dados');
        loadData();
        loadServices();
      }
    };

    // Recarregar dados a cada 10 segundos
    const dataRefreshInterval = setInterval(() => {
      loadData();
    }, 10000);

    window.addEventListener('dataSync', handleDataSync);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('hashchange', handleHashChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('dataSync', handleDataSync);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('hashchange', handleHashChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(dataRefreshInterval);
    };
  }, []);

  const loadData = () => {
    try {
      // Carregar agendamentos de múltiplas fontes para garantir compatibilidade
      let allBookings = [];

      // Tentar carregar de diferentes chaves do localStorage
      const sources = ['userBookings', 'bookings', 'allBookings'];
      for (const source of sources) {
        const sourceData = JSON.parse(localStorage.getItem(source) || '[]');
        if (sourceData.length > 0) {
          allBookings = sourceData;
          break;
        }
      }

      console.log('📋 Agendamentos carregados:', allBookings.length);
      setBookings(allBookings);

      // Carregar clientes
      const allClients = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const clientsOnly = allClients.filter(user => user.role !== 'admin');
      console.log('👥 Clientes carregados:', clientsOnly.length);
      setClients(clientsOnly);

      // Calcular estatísticas
      calculateStats(allBookings, clientsOnly);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setBookings([]);
      setClients([]);
    }
  };

  const loadServices = () => {
    const defaultServices = [
      {
        id: 1,
        name: 'Manicure Simples',
        description: 'Cuidado básico das unhas das mãos',
        price: 25.00,
        duration: '45 min',
        image: '💅'
      },
      {
        id: 2,
        name: 'Pedicure Completa',
        description: 'Cuidado completo dos pés',
        price: 35.00,
        duration: '60 min',
        image: '🦶'
      },
      {
        id: 3,
        name: 'Esmaltação em Gel',
        description: 'Esmaltação com esmalte em gel',
        price: 40.00,
        duration: '90 min',
        image: '✨'
      },
      {
        id: 4,
        name: 'Unha Decorada',
        description: 'Nail art personalizada',
        price: 50.00,
        duration: '120 min',
        image: '🎨'
      }
    ];

    const savedServices = JSON.parse(localStorage.getItem('services') || JSON.stringify(defaultServices));
    setServices(savedServices);
  };

  const calculateStats = (bookings, clients) => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    const todayStr = today.toISOString().split('T')[0];

    const todayBookings = bookings.filter(b => b.date === todayStr && b.status !== 'cancelled');
    const monthBookings = bookings.filter(b => {
      const bookingDate = new Date(b.date);
      return bookingDate.getMonth() === thisMonth && 
             bookingDate.getFullYear() === thisYear &&
             b.status !== 'cancelled';
    });
    const yearBookings = bookings.filter(b => {
      const bookingDate = new Date(b.date);
      return bookingDate.getFullYear() === thisYear && b.status !== 'cancelled';
    });

    setStats({
      todayBookings: todayBookings.length,
      todayRevenue: todayBookings.reduce((sum, b) => sum + b.price, 0),
      monthBookings: monthBookings.length,
      monthRevenue: monthBookings.reduce((sum, b) => sum + b.price, 0),
      yearRevenue: yearBookings.reduce((sum, b) => sum + b.price, 0),
      totalClients: clients.length
    });
  };

  const openModal = (type, data = {}) => {
    setShowModal(type);
    setFormData(data);
    if (type === 'editService' && data.id) {
      setSelectedService(data);
    }
  };

  const closeModal = () => {
    setShowModal(null);
    setFormData({});
    setSelectedService(null);
  };

  const handleFinishService = (booking) => {
    const client = clients.find(c => c.id === booking.userId);
    const bookingWithClient = {
      ...booking,
      clientName: client?.name || 'Cliente'
    };
    setSelectedBooking(bookingWithClient);
    setShowTechniqueForm(true);
  };

  const handleTechniqueFormComplete = (techniqueData) => {
    setPendingTechniqueData(techniqueData);
    setShowTechniqueForm(false);
    setShowPDFPreview(true);
  };

  const handlePreviewConfirm = () => {
    setShowPDFPreview(false);
    setShowTechniqueForm(true);
  };

  const handlePreviewCancel = () => {
    setShowPDFPreview(false);
    setShowTechniqueForm(true);
  };

  const handleSignaturesComplete = async () => {
    if (!pendingTechniqueData || !clientSignature) {
      alert('Por favor, capture a assinatura do cliente.');
      return;
    }

    try {
      // Gerar PDF
      const pdfGenerator = new PDFGenerator();
      const pdf = await pdfGenerator.generateServiceTermPDF(
        selectedBooking,
        selectedBooking.questionnaireData,
        pendingTechniqueData,
        clientSignature,
        professionalSignature
      );

      // Atualizar status do agendamento
      const updatedBookings = bookings.map(booking => 
        booking.id === selectedBooking.id 
          ? { 
              ...booking, 
              status: 'completed',
              completedAt: new Date().toISOString(),
              techniqueData: pendingTechniqueData,
              clientSignature,
              professionalSignature
            }
          : booking
      );
      setBookings(updatedBookings);
      localStorage.setItem('userBookings', JSON.stringify(updatedBookings));

      // Salvar dados completos do serviço
      const completedServices = JSON.parse(localStorage.getItem('completedServices') || '[]');
      const serviceData = {
        id: Date.now().toString(),
        bookingId: selectedBooking.id,
        clientId: selectedBooking.userId,
        clientName: selectedBooking.clientName,
        serviceName: selectedBooking.serviceName,
        date: selectedBooking.date,
        time: selectedBooking.time,
        price: selectedBooking.price,
        questionnaireData: selectedBooking.questionnaireData,
        techniqueData: pendingTechniqueData,
        clientSignature,
        professionalSignature,
        pdfGenerated: true,
        completedAt: new Date().toISOString()
      };
      completedServices.push(serviceData);
      localStorage.setItem('completedServices', JSON.stringify(completedServices));

      // Fechar modais e resetar estados
      setShowSignatureModal(false);
      setShowPDFPreview(false);
      setSelectedBooking(null);
      setPendingTechniqueData(null);
      setClientSignature(null);
      setProfessionalSignature(null);

      // Baixar PDF automaticamente
      pdf.save(`termo-servico-${selectedBooking.clientName}-${selectedBooking.date}.pdf`);

      // Mostrar opções de envio
      setShowModal('sendOptions');
      setFormData({
        serviceData,
        pdfData: pdf.getDataURL()
      });

      alert('Serviço finalizado com sucesso! O termo foi gerado e está sendo baixado.');

    } catch (error) {
      console.error('Erro ao finalizar serviço:', error);
      alert('Erro ao gerar o termo. Tente novamente.');
    }
  };

  const handleSendPDF = async (method) => {
    const { serviceData, pdfData } = formData;

    try {
      switch (method) {
        case 'email':
          // Simulação de envio por email
          await sendByEmail(serviceData, pdfData);
          break;
        case 'whatsapp':
          // Simulação de envio por WhatsApp
          await sendByWhatsApp(serviceData, pdfData);
          break;
        case 'print':
          // Abrir para impressão
          printPDF(pdfData);
          break;
      }
      alert(`Termo enviado via ${method} com sucesso!`);
      closeModal();
    } catch (error) {
      alert(`Erro ao enviar via ${method}. Tente novamente.`);
    }
  };

  const sendByEmail = async (serviceData, pdfData) => {
    // Integração com serviço de email seria implementada aqui
    console.log('Enviando por email:', serviceData);
    // Simulação de delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const sendByWhatsApp = async (serviceData, pdfData) => {
    // Integração com WhatsApp API seria implementada aqui
    console.log('Enviando por WhatsApp:', serviceData);
    // Simulação de delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const printPDF = (pdfData) => {
    const win = window.open();
    win.document.write(`<iframe src="${pdfData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoData = e.target.result;
        setProfilePhoto(photoData);

        // Atualizar no localStorage
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const updatedUsers = users.map(u => 
          u.id === user.id ? { ...u, profilePhoto: photoData } : u
        );
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

        alert('Foto de perfil atualizada com sucesso!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    switch(showModal) {
      case 'changeAdminCredentials':
        // Alterar credenciais do admin
        const adminUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const updatedAdmins = adminUsers.map(user => 
          user.role === 'admin' ? 
          { ...user, name: formData.name || user.name, username: formData.username || user.username, password: formData.password || user.password } : 
          user
        );
        localStorage.setItem('registeredUsers', JSON.stringify(updatedAdmins));
        alert('Credenciais administrativas atualizadas com sucesso!');
        break;

      case 'editClientData':
        // Editar dados do cliente
        const allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const updatedUsers = allUsers.map(user => 
          user.id === formData.clientId ? { ...user, name: formData.name || user.name, email: formData.email || user.email, phone: formData.phone || user.phone } : user
        );
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
        setClients(updatedUsers.filter(user => user.role !== 'admin'));
        alert('Dados do cliente atualizados com sucesso!');
        break;

      case 'addService':
        // Adicionar novo serviço
        const newService = {
          id: Date.now(),
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          duration: formData.duration,
          image: formData.image || '💅'
        };
        const updatedServices = [...services, newService];
        setServices(updatedServices);
        localStorage.setItem('services', JSON.stringify(updatedServices));
        alert('Serviço adicionado com sucesso!');
        break;

      case 'editService':
        // Editar serviço existente
        const editedServices = services.map(service => 
          service.id === selectedService.id ? 
          { ...service, name: formData.name || service.name, description: formData.description || service.description, price: formData.price ? parseFloat(formData.price) : service.price, duration: formData.duration || service.duration, image: formData.image || service.image } : 
          service
        );
        setServices(editedServices);
        localStorage.setItem('services', JSON.stringify(editedServices));
        alert('Serviço atualizado com sucesso!');
        break;

      case 'removeService':
        // Remover serviço
        const filteredServices = services.filter(service => service.id !== parseInt(formData.serviceId));
        setServices(filteredServices);
        localStorage.setItem('services', JSON.stringify(filteredServices));
        alert('Serviço removido com sucesso!');
        break;

      case 'createBooking':
        // Criar novo agendamento
        const newBooking = {
          id: Date.now().toString(),
          userId: formData.clientId,
          serviceId: formData.serviceId,
          serviceName: services.find(s => s.id === parseInt(formData.serviceId))?.name || 'Serviço',
          date: formData.date,
          time: formData.time,
          duration: services.find(s => s.id === parseInt(formData.serviceId))?.duration || '60 min',
          price: services.find(s => s.id === parseInt(formData.serviceId))?.price || 0,
          notes: formData.notes || '',
          status: 'confirmed',
          createdAt: new Date().toISOString(),
          afterHours: formData.afterHours || false
        };
        const updatedBookings = [...bookings, newBooking];
        setBookings(updatedBookings);
        localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
        calculateStats(updatedBookings, clients);
        alert('Agendamento criado com sucesso!');
        break;

      case 'editBooking':
        // Editar agendamento
        const editedBookings = bookings.map(booking => 
          booking.id === formData.bookingId ? 
          { ...booking, date: formData.date || booking.date, time: formData.time || booking.time, status: formData.status || booking.status, notes: formData.notes || booking.notes } : 
          booking
        );
        setBookings(editedBookings);
        localStorage.setItem('userBookings', JSON.stringify(editedBookings));
        calculateStats(editedBookings, clients);
        alert('Agendamento atualizado com sucesso!');
        break;
    }

    closeModal();
    loadData();
  };

  const getAllTimeSlots = () => {
    // Horários comerciais
    const regularSlots = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
      '17:00', '17:30'
    ];

    // Horários pós-expediente
    const afterHoursSlots = [
      '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
    ];

    return [...regularSlots, ...afterHoursSlots];
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: { background: '#4CAF50', color: 'white' },
      pending: { background: '#FF9800', color: 'white' },
      cancelled: { background: '#F44336', color: 'white' },
      completed: { background: '#2196F3', color: 'white' }
    };

    const labels = {
      confirmed: 'Confirmado',
      pending: 'Pendente',
      cancelled: 'Cancelado',
      completed: 'Concluído'
    };

    return (
      <span style={{
        ...styles[status],
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: 'bold'
      }}>
        {labels[status]}
      </span>
    );
  };

  // Função para regenerar o termo de agendamentos concluídos
  const handleGenerateCompletedTerm = async (booking) => {
    console.log('🚀 Iniciando geração de termo PDF...');

    if (!booking) {
      console.error('❌ Booking não fornecido');
      alert('Dados do agendamento não encontrados.');
      return;
    }

    console.log('🔍 Gerando termo para agendamento:', booking);

    try {
      // Buscar dados do serviço concluído
      const completedServices = JSON.parse(localStorage.getItem('completedServices') || '[]');
      let serviceRecord = completedServices.find(s => s.bookingId === booking.id);

      // Se não encontrar nos serviços concluídos, verificar se o booking tem os dados necessários
      if (!serviceRecord && booking.status === 'completed') {
        serviceRecord = {
          bookingId: booking.id,
          clientId: booking.userId,
          clientName: booking.clientName || clients.find(c => c.id === booking.userId)?.name || 'Cliente',
          serviceName: booking.serviceName,
          questionnaireData: booking.questionnaireData || {
            pregnancy: 'Não informado',
            nailBiting: 'Não informado',
            allergies: 'Não informado',
            cuticleRemoval: 'Não informado',
            fungalProblems: 'Não informado',
            medications: 'Não informado',
            physicalActivity: 'Não informado',
            poolBeach: 'Não informado',
            diabetes: 'Não informado',
            ingrownNails: 'Não informado',
            nailCondition: []
          },
          techniqueData: booking.techniqueData || {
            technique: 'Técnica padrão',
            color: 'Não informado',
            format: 'Não informado',
            details: 'Sem detalhes adicionais',
            procedureDate: booking.date,
            maintenanceDate: 'A combinar',
            photographicConsent: false,
            city: 'Cidade'
          },
          clientSignature: booking.clientSignature || null,
          professionalSignature: booking.professionalSignature || null
        };
      }

      if (!serviceRecord) {
        // Criar dados básicos se não existirem
        serviceRecord = {
          bookingId: booking.id,
          clientName: booking.clientName || clients.find(c => c.id === booking.userId)?.name || 'Cliente',
          serviceName: booking.serviceName || 'Serviço',
          questionnaireData: {
            pregnancy: 'Não informado',
            nailBiting: 'Não informado',
            allergies: 'Não informado',
            cuticleRemoval: 'Não informado',
            fungalProblems: 'Não informado',
            medications: 'Não informado',
            physicalActivity: 'Não informado',
            poolBeach: 'Não informado',
            diabetes: 'Não informado',
            ingrownNails: 'Não informado',
            nailCondition: []
          },
          techniqueData: {
            technique: 'Técnica padrão aplicada',
            color: 'Cor padrão',
            format: 'Formato padrão',
            details: 'Serviço realizado conforme solicitado',
            procedureDate: booking.date,
            maintenanceDate: 'A combinar',
            photographicConsent: false,
            city: 'Cidade'
          },
          clientSignature: null,
          professionalSignature: null
        };
      }

      console.log('📄 Dados para geração do PDF:', serviceRecord);

      // Preparar dados do booking com informações completas
      const bookingData = {
        ...booking,
        clientName: serviceRecord.clientName,
        serviceName: serviceRecord.serviceName || booking.serviceName,
        date: booking.date,
        time: booking.time,
        price: booking.price || 0
      };

      console.log('🔧 Verificando PDFGenerator:', PDFGenerator);

      if (!PDFGenerator) {
        console.error('❌ PDFGenerator não encontrado!');
        alert('Erro: Gerador de PDF não carregado. Recarregue a página.');
        return;
      }

      console.log('🔨 Criando instância do PDFGenerator...');
      const pdfGenerator = new PDFGenerator();
      console.log('✅ PDFGenerator criado:', pdfGenerator);
      const pdf = await pdfGenerator.generateServiceTermPDF(
        bookingData,
        serviceRecord.questionnaireData,
        serviceRecord.techniqueData,
        serviceRecord.clientSignature,
        serviceRecord.professionalSignature
      );

      // Baixar PDF automaticamente
      const fileName = `termo-servico-${serviceRecord.clientName.replace(/\s+/g, '-')}-${booking.date}.pdf`;
      pdf.save(fileName);

      alert('✅ Termo gerado com sucesso e está sendo baixado!');

      // Mostrar opções de envio
      setShowModal('sendOptions');
      setFormData({
        serviceData: serviceRecord,
        pdfData: pdf.getDataURL()
      });

    } catch (error) {
      console.error('❌ Erro ao gerar o termo:', error);
      alert('Erro ao gerar o termo. Verifique os dados e tente novamente.');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Painel de Controle Administrativo */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 215, 0, 0.3)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '30px'
      }}>
        <h2 style={{
          color: '#FFD700',
          margin: '0 0 10px 0',
          fontSize: '1.4rem',
          textAlign: 'center'
        }}>
          ⚡ Painel Administrativo
        </h2>
        <p style={{
          color: 'rgba(255, 255, 255, 0.8)',
          margin: '0',
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          Gerencie todos os aspectos do seu salão de forma eficiente
        </p>
      </div>

      {/* Modais */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          overflow: 'auto'
        }}>
          <div style={{
            background: '#FFFFFF',
            padding: '30px',
            borderRadius: '16px',
            minWidth: '400px',
            maxWidth: '600px',
            color: '#000',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            {showModal === 'changeAdminCredentials' && (
              <form onSubmit={handleFormSubmit}>
                <h2 style={{ marginBottom: '20px' }}>🔐 Alterar Credenciais Admin</h2>
                <input
                  type="text"
                  placeholder="Novo nome do administrador"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                />
                <input
                  type="text"
                  placeholder="Novo usuário"
                  value={formData.username || ''}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                />
                <input
                  type="password"
                  placeholder="Nova senha"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '20px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{
                    padding: '12px 20px',
                    background: '#FFD700',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}>
                    Salvar
                  </button>
                  <button type="button" onClick={closeModal} style={{
                    padding: '12px 20px',
                    background: 'transparent',
                    color: '#FFFFFF',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {showModal === 'editClientData' && (
              <form onSubmit={handleFormSubmit}>
                <h2 style={{ marginBottom: '20px' }}>👤 Editar Dados do Cliente</h2>
                <select
                  value={formData.clientId || ''}
                  onChange={(e) => {
                    const client = clients.find(c => c.id === e.target.value);
                    setFormData({
                      ...formData, 
                      clientId: e.target.value,
                      name: client?.name || '',
                      email: client?.email || '',
                      phone: client?.phone || ''
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                >
                  <option value="">Selecionar cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Nome"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                />
                <input
                  type="tel"
                  placeholder="Telefone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '20px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{
                    padding: '12px 20px',
                    background: '#FFD700',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}>
                    Salvar
                  </button>
                  <button type="button" onClick={closeModal} style={{
                    padding: '12px 20px',
                    background: 'transparent',
                    color: '#FFFFFF',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {showModal === 'addService' && (
              <form onSubmit={handleFormSubmit}>
                <h2 style={{ marginBottom: '20px' }}>➕ Adicionar Novo Serviço</h2>
                <input
                  type="text"
                  placeholder="Nome do serviço"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                />
                <textarea
                  placeholder="Descrição do serviço"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Preço (R$)"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                />
                <input
                  type="text"
                  placeholder="Duração (ex: 60 min)"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                />
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <input
                    type="text"
                    placeholder="💅"
                    value={formData.image || ''}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    style={{
                      width: '80px',
                      padding: '12px',
                      border: '1px solid #FFD700',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.5)',
                      color: '#FFFFFF',
                      textAlign: 'center',
                      fontSize: '1.5rem'
                    }}
                    maxLength="2"
                  />
                  <div style={{ flex: 1 }}>
                    <small style={{ 
                      display: 'block', 
                      color: '#FFD700', 
                      marginBottom: '5px',
                      fontSize: '0.8rem'
                    }}>
                      Emoji do Serviço
                    </small>
                    <div style={{
                      display: 'flex',
                      gap: '5px',
                      flexWrap: 'wrap'
                    }}>
                      {['💅', '🦶', '✨', '🎨', '💎', '🌟', '💆', '🌺'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setFormData({...formData, image: emoji})}
                          style={{
                            background: formData.image === emoji ? '#FFD700' : 'rgba(255, 215, 0, 0.2)',
                            border: '1px solid #FFD700',
                            borderRadius: '6px',
                            padding: '8px',
                            cursor: 'pointer',
                            fontSize: '1.2rem'
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{
                    padding: '12px 20px',
                    background: '#FFD700',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}>
                    Adicionar
                  </button>
                  <button type="button" onClick={closeModal} style={{
                    padding: '12px 20px',
                    background: 'transparent',
                    color: '#FFFFFF',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {showModal === 'editService' && (
              <form onSubmit={handleFormSubmit}>
                <h2 style={{ marginBottom: '20px' }}>✏️ Editar Serviço</h2>
                <input
                  type="text"
                  placeholder="Nome do serviço"
                  value={formData.name || selectedService?.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                />
                <textarea
                  placeholder="Descrição do serviço"
                  value={formData.description || selectedService?.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Preço (R$)"
                  value={formData.price || selectedService?.price || ''}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                />
                <input
                  type="text"
                  placeholder="Duração (ex: 60 min)"
                  value={formData.duration || selectedService?.duration || ''}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                />
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <input
                    type="text"
                    placeholder="💅"
                    value={formData.image || selectedService?.image || ''}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    style={{
                      width: '80px',
                      padding: '12px',
                      border: '1px solid #FFD700',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.5)',
                      color: '#FFFFFF',
                      textAlign: 'center',
                      fontSize: '1.5rem'
                    }}
                    maxLength="2"
                  />
                  <div style={{ flex: 1 }}>
                    <small style={{ 
                      display: 'block', 
                      color: '#FFD700', 
                      marginBottom: '5px',
                      fontSize: '0.8rem'
                    }}>
                      Emoji do Serviço
                    </small>
                    <div style={{
                      display: 'flex',
                      gap: '5px',
                      flexWrap: 'wrap'
                    }}>
                      {['💅', '🦶', '✨', '🎨', '💎', '🌟', '💆', '🌺'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setFormData({...formData, image: emoji})}
                          style={{
                            background: (formData.image || selectedService?.image) === emoji ? '#FFD700' : 'rgba(255, 215, 0, 0.2)',
                            border: '1px solid #FFD700',
                            borderRadius: '6px',
                            padding: '8px',
                            cursor: 'pointer',
                            fontSize: '1.2rem'
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{
                    padding: '12px 20px',
                    background: '#FFD700',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}>
                    Salvar
                  </button>
                  <button type="button" onClick={closeModal} style={{
                    padding: '12px 20px',
                    background: 'transparent',
                    color: '#FFFFFF',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {showModal === 'removeService' && (
              <form onSubmit={handleFormSubmit}>
                <h2 style={{ marginBottom: '20px' }}>❌ Remover Serviço</h2>
                <select
                  value={formData.serviceId || ''}
                  onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '20px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                >
                  <option value="">Selecionar serviço para remover</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {formatCurrency(service.price)}
                    </option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{
                    padding: '12px 20px',
                    background: '#FF4444',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    Remover
                  </button>
                  <button type="button" onClick={closeModal} style={{
                    padding: '12px 20px',
                    background: 'transparent',
                    color: '#FFFFFF',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {showModal === 'createBooking' && (
              <form onSubmit={handleFormSubmit}>
                <h2 style={{ marginBottom: '20px' }}>📅 Criar Novo Agendamento</h2>
                <select
                  value={formData.clientId || ''}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                >
                  <option value="">Selecionar cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
                <select
                  value={formData.serviceId || ''}
                  onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                >
                  <option value="">Selecionar serviço</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {formatCurrency(service.price)} ({service.duration})
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                />
                <select
                  value={formData.time || ''}
                  onChange={(e) => {
                    const time = e.target.value;
                    const isAfterHours = time >= '18:00';
                    setFormData({...formData, time, afterHours: isAfterHours});
                  }}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                >
                  <option value="">Selecionar horário</option>
                  {getAllTimeSlots().map(time => (
                    <option key={time} value={time}>
                      {time} {time >= '18:00' ? '(Pós-expediente)' : ''}
                    </option>
                  ))}
                </select>
                <textarea
                  placeholder="Observações (opcional)"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '20px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{
                    padding: '12px 20px',
                    background: '#FFD700',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}>
                    Criar Agendamento
                  </button>
                  <button type="button" onClick={closeModal} style={{
                    padding: '12px 20px',
                    background: 'transparent',
                    color: '#FFFFFF',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {showModal === 'editBooking' && (
              <form onSubmit={handleFormSubmit}>
                <h2 style={{ marginBottom: '20px' }}>✏️ Editar Agendamento</h2>
                <select
                  value={formData.bookingId || ''}
                  onChange={(e) => {
                    const booking = bookings.find(b => b.id === e.target.value);
                    setFormData({
                      ...formData, 
                      bookingId: e.target.value,
                      date: booking?.date || '',
                      time: booking?.time || '',
                      status: booking?.status || '',
                      notes: booking?.notes || ''
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                >
                  <option value="">Selecionar agendamento</option>
                  {bookings.map(booking => {
                    const client = clients.find(c => c.id === booking.userId);
                    return (
                      <option key={booking.id} value={booking.id}>
                        {client?.name || 'Cliente'} - {booking.serviceName} - {formatDate(booking.date)} {booking.time}
                      </option>
                    );
                  })}
                </select>
                <input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                />
                <select
                  value={formData.time || ''}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                >
                  <option value="">Selecionar novo horário</option>
                  {getAllTimeSlots().map(time => (
                    <option key={time} value={time}>
                      {time} {time >= '18:00' ? '(Pós-expediente)' : ''}
                    </option>
                  ))}
                </select>
                <select
                  value={formData.status || ''}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                >
                  <option value="">Alterar status</option>
                  <option value="pending">Pendente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                <textarea
                  placeholder="Observações"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '20px',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#FFFFFF'
                  }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{
                    padding: '12px 20px',
                    background: '#FFD700',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}>
                    Salvar Alterações
                  </button>
                  <button type="button" onClick={closeModal} style={{
                    padding: '12px 20px',
                    background: 'transparent',
                    color: '#FFFFFF',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.todayBookings}</span>
          <span className="stat-label">Agendamentos Hoje</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatCurrency(stats.todayRevenue)}</span>
          <span className="stat-label">Faturamento Hoje</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.monthBookings}</span>
          <span className="stat-label">Agendamentos do Mês</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatCurrency(stats.monthRevenue)}</span>
          <span className="stat-label">Faturamento do Mês</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatCurrency(stats.yearRevenue)}</span>
          <span className="stat-label">Faturamento do Ano</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalClients}</span>
          <span className="stat-label">Total de Clientes</span>
        </div>
      </div>

      {/* Indicador da seção ativa */}
      <div style={{
        background: 'rgba(255, 215, 0, 0.1)',
        border: '1px solid rgba(255, 215, 0, 0.3)',
        borderRadius: '12px',
        padding: '15px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: 0, color: '#FFD700', fontSize: '1.2rem' }}>
          {activeTab === 'overview' && '📊 Visão Geral do Sistema'}
          {activeTab === 'services' && '💅 Gestão de Serviços'}
          {activeTab === 'bookings' && '📅 Gestão de Agendamentos'}
          {activeTab === 'clients' && '👥 Gestão de Clientes'}
          {activeTab === 'automation' && '🤖 Automação N8n'}
        </h2>
        <p style={{ margin: '5px 0 0 0', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
          Use o menu hambúrguer do cabeçalho para navegar entre as seções
        </p>
      </div>

      {/* Conteúdo das abas */}
      {activeTab === 'overview' && (
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <span className="card-icon">📅</span>
              <h3 className="card-title">Agendamentos Recentes</h3>
            </div>
            <div className="card-content">
              {bookings.slice(0, 5).map(booking => {
                const client = clients.find(c => c.id === booking.userId);
                return (
                  <div key={booking.id} style={{ 
                    padding: '10px 0', 
                    borderBottom: '1px solid rgba(255, 215, 0, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong>{client?.name || 'Cliente'}</strong><br />
                      <small>{booking.serviceName} - {formatDate(booking.date)} {booking.time}</small>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div>
          <h2 style={{ color: '#FFD700', marginBottom: '25px', textAlign: 'center' }}>
            💅 Gestão de Serviços
          </h2>

          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => openModal('addService')}
              style={{
                padding: '10px 20px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ➕ Adicionar Serviço
            </button>
            <button
              onClick={() => openModal('removeService')}
              style={{
                padding: '10px 20px',
                background: '#FF4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ❌ Remover Serviço
            </button>
          </div>

          <div className="dashboard-grid">
            {services.map(service => (
              <div key={service.id} className="dashboard-card">
                <div className="card-header">
                  <span className="card-icon">{service.image}</span>
                  <h3 className="card-title">{service.name}</h3>
                </div>
                <div className="card-content">
                  <p>{service.description}</p>
                  <p><strong>Preço:</strong> {formatCurrency(service.price)}</p>
                  <p><strong>Duração:</strong> {service.duration}</p>
                  <button
                    onClick={() => openModal('editService', service)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#FFD700',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginTop: '10px'
                    }}
                  >
                    ✏️ Editar Serviço
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div>
          <h2 style={{ color: '#FFD700', marginBottom: '25px', textAlign: 'center' }}>
            📅 Gestão de Agendamentos
          </h2>

          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => openModal('createBooking')}
              style={{
                padding: '10px 20px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ➕ Criar Agendamento
            </button>
            <button
              onClick={() => openModal('editBooking')}
              style={{
                padding: '10px 20px',
                background: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ✏️ Editar Agendamento
            </button>
            <button
              onClick={() => {
                console.log('🔄 Forçando recarga de dados...');
                loadData();
                loadServices();
              }}
              style={{
                padding: '10px 20px',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              🔄 Recarregar Dados
            </button>
          </div>

          {/* Debug Info */}
          <div style={{
            background: 'rgba(33, 150, 243, 0.1)',
            border: '1px solid rgba(33, 150, 243, 0.3)',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            fontSize: '0.9rem'
          }}>
            <p style={{ color: '#2196F3', margin: '5px 0' }}>
              📊 <strong>Debug Info:</strong> {bookings.length} agendamentos encontrados | {clients.length} clientes
            </p>
            <p style={{ color: '#2196F3', margin: '5px 0' }}>
              💾 <strong>Fontes de dados:</strong> localStorage (userBookings, bookings, registeredUsers)
            </p>
          </div>

          {bookings.length === 0 ? (
            <div style={{
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              color: '#FFC107'
            }}>
              <h3 style={{ margin: '0 0 15px 0' }}>📅 Nenhum agendamento encontrado</h3>
              <p style={{ margin: '0 0 20px 0', opacity: 0.8 }}>
                Os agendamentos aparecerão aqui quando forem criados pelos clientes ou pelo admin.
              </p>
              <button
                onClick={() => {
                  console.log('🔍 Verificando dados do localStorage...');
                  console.log('userBookings:', localStorage.getItem('userBookings'));
                  console.log('bookings:', localStorage.getItem('bookings'));
                  console.log('registeredUsers:', localStorage.getItem('registeredUsers'));
                  loadData();
                }}
                style={{
                  background: '#FFC107',
                  color: '#000',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🔍 Verificar Dados
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.8)',
                borderRadius: '12px',
                overflow: 'hidden',
                color: 'white'
              }}>
                <thead style={{ background: 'rgba(255, 215, 0, 0.2)' }}>
                  <tr>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Cliente</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Serviço</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Data/Hora</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Valor</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Tipo</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => {
                    const client = clients.find(c => c.id === booking.userId || c.id === booking.user_id);
                    return (
                      <tr key={booking.id} style={{ borderBottom: '1px solid rgba(255, 215, 0, 0.1)' }}>
                        <td style={{ padding: '15px' }}>
                          {client?.name || booking.clientName || booking.user_name || 'Cliente não encontrado'}
                        </td>
                        <td style={{ padding: '15px' }}>
                          {booking.serviceName || booking.service_name || 'Serviço'}
                        </td>
                        <td style={{ padding: '15px' }}>
                          {formatDate(booking.date)}<br />
                          <small>{booking.time}</small>
                        </td>
                        <td style={{ padding: '15px' }}>{formatCurrency(booking.price || 0)}</td>
                        <td style={{ padding: '15px' }}>{getStatusBadge(booking.status || 'pending')}</td>
                        <td style={{ padding: '15px' }}>
                          {booking.afterHours ? (
                            <span style={{ 
                              background: '#FF9800', 
                              color: 'white', 
                              padding: '4px 8px', 
                              borderRadius: '12px', 
                              fontSize: '0.8rem' 
                            }}>
                              Pós-expediente
                            </span>
                          ) : (
                            <span style={{ 
                              background: '#4CAF50', 
                              color: 'white', 
                              padding: '4px 8px', 
                              borderRadius: '12px', 
                              fontSize: '0.8rem' 
                            }}>
                              Comercial
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '15px' }}>
                          {(booking.status === 'confirmed' || !booking.status) && (
                            <button
                              onClick={() => handleFinishService(booking)}
                              style={{
                                background: '#FFD700',
                                color: '#000',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}
                            >
                              ✅ Finalizar
                            </button>
                          )}
                          {booking.status === 'completed' && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              marginTop: '10px',
                              flexWrap: 'wrap'
                            }}>
                              <span style={{
                                color: '#4CAF50',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                              }}>
                                ✅ Concluído em {new Date(booking.completedAt).toLocaleDateString('pt-BR')}
                              </span>
                              <button
                                onClick={() => handleGenerateCompletedTerm(booking)}
                                style={{
                                  ...getButtonStyle('primary'),
                                  padding: '6px 12px',
                                  fontSize: '0.8rem',
                                  marginLeft: 'auto'
                                }}
                              >
                                📄 Gerar Termo
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'clients' && (
        <div>
          <h2 style={{ color: '#FFD700', marginBottom: '25px', textAlign: 'center' }}>
            👥 Gestão de Clientes
          </h2>

          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => openModal('editClientData')}
              style={{
                padding: '10px 20px',
                background: '#FFD700',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ✏️ Editar Dados de Cliente
            </button>
          </div>

          <div className="dashboard-grid">
            {clients.map(client => (
              <div key={client.id} className="dashboard-card">
                <div className="card-header">
                  <span className="card-icon">👤</span>
                  <h3 className="card-title">{client.name}</h3>
                </div>
                <div className="card-content">
                  <p><strong>Email:</strong> {client.email}</p>
                  <p><strong>Telefone:</strong> {client.phone}</p>
                  <p><strong>Usuário:</strong> {client.username}</p>
                  {client.birthDate && (
                    <p><strong>Aniversário:</strong> {formatDate(client.birthDate)}</p>
                  )}
                  <p><strong>Cadastrado em:</strong> {formatDate(client.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'automation' && (
        <AutomationPanel />
      )}

      {/* Modal do Formulário de Técnica Aplicada */}
      {showTechniqueForm && selectedBooking && (
        <TechniqueForm
          booking={selectedBooking}
          onComplete={handleTechniqueFormComplete}
          onCancel={() => setShowTechniqueForm(false)}
        />
      )}

      {/* Modal de Preview do PDF */}
      {showPDFPreview && selectedBooking && pendingTechniqueData && (
        <PDFPreview
          booking={selectedBooking}
          questionnaireData={selectedBooking.questionnaireData}
          techniqueData={pendingTechniqueData}
          onConfirm={handlePreviewConfirm}
          onCancel={handlePreviewCancel}
        />
      )}

      {/* Modal de Assinaturas */}
      {showSignatureModal && (
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
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div className="card-header">
              <span className="card-icon">✍️</span>
              <h3 className="card-title">Assinaturas do Termo</h3>
              <button
                onClick={() => setShowSignatureModal(false)}
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

            <div style={{ padding: '20px 0' }}>
              <SignaturePad
                title="Assinatura do Cliente *"
                onSignatureChange={setClientSignature}
                initialSignature={clientSignature}
              />

              <SignaturePad
                title="Assinatura do Profissional"
                onSignatureChange={setProfessionalSignature}
                initialSignature={professionalSignature}
              />

              <div style={{
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '8px',
                padding: '15px',
                marginTop: '20px'
              }}>
                <p style={{ 
                  color: '#FFD700', 
                  fontSize: '0.9rem', 
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  ℹ️ <strong>Importante:</strong> A assinatura do cliente é obrigatória para gerar o termo. A assinatura do profissional é opcional mas recomendada.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  onClick={() => setShowSignatureModal(false)}
                  style={{
                    ...getButtonStyle('secondary'),
                    padding: '12px 24px'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSignaturesComplete}
                  disabled={!clientSignature}
                  style={{
                    ...getButtonStyle('primary'),
                    padding: '12px 24px',
                    opacity: !clientSignature ? 0.5 : 1
                  }}
                >
                  Gerar Termo PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Opções de Envio */}
      {showModal === 'sendOptions' && (
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
            maxWidth: '500px'
          }}>
            <div className="card-header">
              <span className="card-icon">📤</span>
              <h3 className="card-title">Enviar Termo para Cliente</h3>
              <button
                onClick={closeModal}
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

            <div style={{ padding: '20px 0' }}>
              <p style={{ 
                color: 'white', 
                marginBottom: '20px',
                lineHeight: '1.4'
              }}>
                O termo foi gerado com sucesso! Escolha como deseja enviar para o cliente:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <button
                  onClick={() => handleSendPDF('email')}
                  style={{
                    ...getButtonStyle('primary'),
                    padding: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    justifyContent: 'flex-start'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>📧</span>
                  Enviar por E-mail
                </button>

                <button
                  onClick={() => handleSendPDF('whatsapp')}
                  style={{
                    ...getButtonStyle('primary'),
                    padding: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    justifyContent: 'flex-start',
                    background: '#25D366'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>📱</span>
                  Enviar via WhatsApp
                </button>

                <button
                  onClick={() => handleSendPDF('print')}
                  style={{
                    ...getButtonStyle('secondary'),
                    padding: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    justifyContent: 'flex-start'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>🖨️</span>
                  Imprimir Termo
                </button>
              </div>

              <button
                onClick={closeModal}
                style={{
                  ...getButtonStyle('secondary'),
                  width: '100%',
                  padding: '12px',
                  marginTop: '20px'
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;