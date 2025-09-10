
import { useState } from 'react';
import { getCardStyle, getButtonStyle } from '../../utils/theme';
import PDFGenerator from '../../utils/pdfGenerator';

const PDFPreview = ({ 
  booking, 
  questionnaireData, 
  techniqueData, 
  onConfirm, 
  onCancel 
}) => {
  const [previewData, setPreviewData] = useState(null);

  const generatePreviewData = () => {
    const data = {
      // Informações do serviço
      serviceInfo: {
        clientName: booking.clientName || 'N/A',
        serviceName: booking.serviceName,
        date: booking.date,
        time: booking.time,
        price: booking.price?.toFixed(2) || '0,00'
      },
      
      // Questionário de anamnese
      questionnaire: questionnaireData ? {
        pregnancy: questionnaireData.pregnancy || 'Não informado',
        nailBiting: questionnaireData.nailBiting || 'Não informado',
        allergies: questionnaireData.allergies || 'Não informado',
        cuticleRemoval: questionnaireData.cuticleRemoval || 'Não informado',
        fungalProblems: questionnaireData.fungalProblems || 'Não informado',
        medications: questionnaireData.medications || 'Não informado',
        physicalActivity: questionnaireData.physicalActivity || 'Não informado',
        poolBeach: questionnaireData.poolBeach || 'Não informado',
        diabetes: questionnaireData.diabetes || 'Não informado',
        ingrownNails: questionnaireData.ingrownNails || 'Não informado',
        nailCondition: questionnaireData.nailCondition || [],
        nailConditionOther: questionnaireData.nailConditionOther || ''
      } : null,
      
      // Técnica aplicada
      technique: techniqueData ? {
        technique: techniqueData.technique === 'outra' ? techniqueData.otherTechnique : techniqueData.technique,
        color: techniqueData.color || 'Não informado',
        format: techniqueData.format || 'Não informado',
        details: techniqueData.details || '',
        procedureDate: techniqueData.procedureDate || 'Não informado',
        maintenanceDate: techniqueData.maintenanceDate || 'Não informado',
        photographicConsent: techniqueData.photographicConsent ? 'Autorizado' : 'Não autorizado',
        city: techniqueData.city || 'Cidade Brasileira'
      } : null
    };
    
    setPreviewData(data);
  };

  useState(() => {
    generatePreviewData();
  }, []);

  const handleConfirm = () => {
    onConfirm();
  };

  if (!previewData) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: 'white' }}>Carregando preview...</p>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        ...getCardStyle(true),
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div className="card-header">
          <span className="card-icon">📄</span>
          <h3 className="card-title">Preview do Termo de Serviço</h3>
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

        <div style={{ 
          padding: '20px',
          background: 'white',
          color: '#000',
          borderRadius: '12px',
          margin: '20px 0',
          fontFamily: 'Arial, sans-serif'
        }}>
          {/* Cabeçalho do documento */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ 
              color: '#FFD700', 
              fontSize: '24px',
              margin: '0 0 10px 0',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              TERMO DE SERVIÇO - NAIL DESIGNER
            </h1>
            <div style={{
              width: '100%',
              height: '2px',
              background: 'linear-gradient(to right, transparent, #FFD700, transparent)',
              margin: '10px 0'
            }}></div>
          </div>

          {/* Informações do serviço */}
          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ 
              color: '#333', 
              fontSize: '16px',
              borderBottom: '2px solid #FFD700',
              paddingBottom: '5px',
              marginBottom: '15px'
            }}>
              INFORMAÇÕES DO SERVIÇO
            </h2>
            <div style={{ lineHeight: '1.6' }}>
              <p><strong>Cliente:</strong> {previewData.serviceInfo.clientName}</p>
              <p><strong>Serviço:</strong> {previewData.serviceInfo.serviceName}</p>
              <p><strong>Data:</strong> {previewData.serviceInfo.date} às {previewData.serviceInfo.time}</p>
              <p><strong>Valor:</strong> R$ {previewData.serviceInfo.price}</p>
            </div>
          </section>

          {/* Questionário de anamnese */}
          {previewData.questionnaire && (
            <section style={{ marginBottom: '25px' }}>
              <h2 style={{ 
                color: '#333', 
                fontSize: '16px',
                borderBottom: '2px solid #FFD700',
                paddingBottom: '5px',
                marginBottom: '15px'
              }}>
                QUESTIONÁRIO DE ANAMNESE
              </h2>
              <div style={{ lineHeight: '1.4', fontSize: '12px' }}>
                <p><strong>Está em gestação?</strong> {previewData.questionnaire.pregnancy === 'sim' ? '✓ Sim' : previewData.questionnaire.pregnancy === 'nao' ? '✓ Não' : previewData.questionnaire.pregnancy}</p>
                <p><strong>Hábito de roer unhas?</strong> {previewData.questionnaire.nailBiting === 'sim' ? '✓ Sim' : previewData.questionnaire.nailBiting === 'nao' ? '✓ Não' : previewData.questionnaire.nailBiting}</p>
                <p><strong>Alergia a esmaltes ou cosméticos?</strong> {previewData.questionnaire.allergies === 'sim' ? '✓ Sim' : previewData.questionnaire.allergies === 'nao' ? '✓ Não' : previewData.questionnaire.allergies}</p>
                <p><strong>Costuma retirar a cutícula?</strong> {previewData.questionnaire.cuticleRemoval === 'sim' ? '✓ Sim' : previewData.questionnaire.cuticleRemoval === 'nao' ? '✓ Não' : previewData.questionnaire.cuticleRemoval}</p>
                <p><strong>Problema com micose ou fungo?</strong> {previewData.questionnaire.fungalProblems === 'sim' ? '✓ Sim' : previewData.questionnaire.fungalProblems === 'nao' ? '✓ Não' : previewData.questionnaire.fungalProblems}</p>
                <p><strong>Faz uso de algum medicamento?</strong> {previewData.questionnaire.medications === 'sim' ? '✓ Sim' : previewData.questionnaire.medications === 'nao' ? '✓ Não' : previewData.questionnaire.medications}</p>
                <p><strong>Pratica atividade física?</strong> {previewData.questionnaire.physicalActivity === 'sim' ? '✓ Sim' : previewData.questionnaire.physicalActivity === 'nao' ? '✓ Não' : previewData.questionnaire.physicalActivity}</p>
                <p><strong>Frequenta piscina ou praia?</strong> {previewData.questionnaire.poolBeach === 'sim' ? '✓ Sim' : previewData.questionnaire.poolBeach === 'nao' ? '✓ Não' : previewData.questionnaire.poolBeach}</p>
                <p><strong>Tem diabetes?</strong> {previewData.questionnaire.diabetes === 'sim' ? '✓ Sim' : previewData.questionnaire.diabetes === 'nao' ? '✓ Não' : previewData.questionnaire.diabetes}</p>
                <p><strong>Unha encravada?</strong> {previewData.questionnaire.ingrownNails === 'sim' ? '✓ Sim' : previewData.questionnaire.ingrownNails === 'nao' ? '✓ Não' : previewData.questionnaire.ingrownNails}</p>
                
                {previewData.questionnaire.nailCondition && previewData.questionnaire.nailCondition.length > 0 && (
                  <p><strong>A lâmina ungueal apresenta:</strong> {previewData.questionnaire.nailCondition.join(', ')}
                    {previewData.questionnaire.nailConditionOther && ` (${previewData.questionnaire.nailConditionOther})`}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Técnica aplicada */}
          {previewData.technique && (
            <section style={{ marginBottom: '25px' }}>
              <h2 style={{ 
                color: '#333', 
                fontSize: '16px',
                borderBottom: '2px solid #FFD700',
                paddingBottom: '5px',
                marginBottom: '15px'
              }}>
                TÉCNICA APLICADA
              </h2>
              <div style={{ lineHeight: '1.6' }}>
                <p><strong>Técnica:</strong> {previewData.technique.technique}</p>
                <p><strong>Cor:</strong> {previewData.technique.color}</p>
                <p><strong>Formato:</strong> {previewData.technique.format}</p>
                {previewData.technique.details && (
                  <p><strong>Detalhes:</strong> {previewData.technique.details}</p>
                )}
                <p><strong>Data do Procedimento:</strong> {previewData.technique.procedureDate}</p>
                <p><strong>Data da Manutenção:</strong> {previewData.technique.maintenanceDate}</p>
              </div>
            </section>
          )}

          {/* Termo de autorização */}
          {previewData.technique && (
            <section style={{ marginBottom: '25px' }}>
              <h2 style={{ 
                color: '#333', 
                fontSize: '16px',
                borderBottom: '2px solid #FFD700',
                paddingBottom: '5px',
                marginBottom: '15px'
              }}>
                TERMO DE AUTORIZAÇÃO
              </h2>
              <div style={{ lineHeight: '1.6', fontSize: '12px' }}>
                <p style={{ textAlign: 'justify' }}>
                  Autorizo a realização do procedimento e o registro fotográfico do antes e depois, para documentação e divulgação da profissional. As declarações acima são verdadeiras, não cabendo à profissional a responsabilidade por informações omitidas nesta avaliação. Me comprometo a seguir todas as recomendações necessárias após o procedimento.
                </p>
                <p><strong>Registro fotográfico:</strong> {previewData.technique.photographicConsent}</p>
              </div>
            </section>
          )}

          {/* Área de assinaturas */}
          <section style={{ marginTop: '40px' }}>
            <p style={{ textAlign: 'center', marginBottom: '30px' }}>
              {previewData.technique?.city}, {previewData.technique?.procedureDate || new Date().toLocaleDateString('pt-BR')}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px' }}>
              <div style={{ width: '45%', textAlign: 'center' }}>
                <div style={{ 
                  borderBottom: '1px solid #000', 
                  height: '60px',
                  marginBottom: '10px'
                }}></div>
                <p style={{ margin: 0, fontSize: '12px' }}>Assinatura do Cliente</p>
              </div>
              
              <div style={{ width: '45%', textAlign: 'center' }}>
                <div style={{ 
                  borderBottom: '1px solid #000', 
                  height: '60px',
                  marginBottom: '10px'
                }}></div>
                <p style={{ margin: 0, fontSize: '12px' }}>Assinatura do Profissional</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '10px' }}>Erides Souza</p>
              </div>
            </div>
          </section>
        </div>

        {/* Aviso importante */}
        <div style={{
          background: 'rgba(255, 215, 0, 0.1)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '8px',
          padding: '15px',
          margin: '20px 0'
        }}>
          <p style={{ 
            color: '#FFD700', 
            fontSize: '0.9rem', 
            margin: 0,
            lineHeight: '1.4'
          }}>
            ℹ️ <strong>Importante:</strong> Verifique todas as informações antes de prosseguir para a assinatura. Após gerar o PDF final, não será possível fazer alterações.
          </p>
        </div>

        {/* Botões de ação */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          justifyContent: 'flex-end',
          padding: '20px 0'
        }}>
          <button
            onClick={onCancel}
            style={{
              ...getButtonStyle('secondary'),
              padding: '12px 24px'
            }}
          >
            ← Voltar e Editar
          </button>
          <button
            onClick={handleConfirm}
            style={{
              ...getButtonStyle('primary'),
              padding: '12px 24px'
            }}
          >
            Continuar para Assinatura →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;
