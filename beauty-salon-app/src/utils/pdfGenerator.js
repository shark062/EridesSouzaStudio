import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

class PDFGenerator {
  constructor() {
    this.doc = new jsPDF();
    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.margin = 20;
    this.currentY = this.margin;
  }

  addHeader(title) {
    this.doc.setFontSize(20);
    this.doc.setTextColor(255, 215, 0); // Dourado
    this.doc.text(title, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 15;

    // Linha decorativa
    this.doc.setDrawColor(255, 215, 0);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;
  }

  addSubHeader(text) {
    this.doc.setFontSize(14);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += 10;
  }

  addText(text, fontSize = 12) {
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(0, 0, 0);
    
    const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin);
    this.doc.text(lines, this.margin, this.currentY);
    this.currentY += lines.length * 6;
  }

  addQuestionnaireSection(data) {
    this.addSubHeader('QUESTIONÁRIO DE ANAMNESE');
    this.currentY += 5;

    const questions = [
      { key: 'pregnancy', label: 'Está em gestação?' },
      { key: 'nailBiting', label: 'Hábito de roer unhas?' },
      { key: 'allergies', label: 'Alergia a esmaltes ou cosméticos?' },
      { key: 'cuticleRemoval', label: 'Costuma retirar a cutícula?' },
      { key: 'fungalProblems', label: 'Problema com micose ou fungo?' },
      { key: 'medications', label: 'Faz uso de algum medicamento?' },
      { key: 'physicalActivity', label: 'Pratica atividade física?' },
      { key: 'poolBeach', label: 'Frequenta piscina ou praia?' },
      { key: 'diabetes', label: 'Tem diabetes?' },
      { key: 'ingrownNails', label: 'Unha encravada?' }
    ];

    questions.forEach(q => {
      const answer = data[q.key] || 'Não informado';
      this.addText(`${q.label} ${answer === 'sim' ? '✓ Sim' : answer === 'nao' ? '✓ Não' : answer}`, 10);
    });

    if (data.nailCondition && Array.isArray(data.nailCondition) && data.nailCondition.length > 0) {
      let conditionText = 'A lâmina ungueal apresenta: ' + data.nailCondition.join(', ');
      if (data.nailConditionOther) {
        conditionText += ` (${data.nailConditionOther})`;
      }
      this.addText(conditionText, 10);
    }

    this.currentY += 10;
  }

  addTechniqueSection(data) {
    this.addSubHeader('TÉCNICA APLICADA');
    this.currentY += 5;

    const technique = data.technique === 'outra' ? data.otherTechnique : data.technique;
    this.addText(`Técnica: ${technique || 'Não informado'}`, 10);
    this.addText(`Cor: ${data.color || 'Não informado'}`, 10);
    this.addText(`Formato: ${data.format || 'Não informado'}`, 10);
    
    if (data.details) {
      this.addText(`Detalhes: ${data.details}`, 10);
    }

    this.addText(`Data do Procedimento: ${data.procedureDate || 'Não informado'}`, 10);
    this.addText(`Data da Manutenção: ${data.maintenanceDate || 'Não informado'}`, 10);
    
    this.currentY += 10;
  }

  addConsentSection(data) {
    this.addSubHeader('TERMO DE AUTORIZAÇÃO');
    this.currentY += 5;

    const consentText = `Autorizo a realização do procedimento e o registro fotográfico do antes e depois, para documentação e divulgação da profissional. As declarações acima são verdadeiras, não cabendo à profissional a responsabilidade por informações omitidas nesta avaliação. Me comprometo a seguir todas as recomendações necessárias após o procedimento.`;
    
    this.addText(consentText, 10);
    this.currentY += 5;

    const photoConsent = data.photographicConsent ? 'Autorizado' : 'Não autorizado';
    this.addText(`Registro fotográfico: ${photoConsent}`, 10);
    
    this.currentY += 10;
  }

  addSignatureSection(clientSignature, professionalSignature, city, date) {
    // Verificar se há espaço suficiente na página
    if (this.currentY > this.pageHeight - 100) {
      this.doc.addPage();
      this.currentY = this.margin;
    }

    this.addText(`${city || 'Cidade Brasileira'}, ${date || new Date().toLocaleDateString('pt-BR')}`, 10);
    this.currentY += 20;

    // Área para assinaturas
    const signatureWidth = (this.pageWidth - 3 * this.margin) / 2;
    const signatureHeight = 40;

    // Assinatura do cliente
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, this.currentY + signatureHeight, this.margin + signatureWidth, this.currentY + signatureHeight);
    
    if (clientSignature) {
      try {
        this.doc.addImage(clientSignature, 'PNG', this.margin, this.currentY, signatureWidth, signatureHeight);
      } catch (error) {
        console.warn('Erro ao adicionar assinatura do cliente:', error);
      }
    }
    
    this.doc.setFontSize(10);
    this.doc.text('Assinatura do Cliente', this.margin, this.currentY + signatureHeight + 8);

    // Assinatura do profissional
    const profX = this.margin + signatureWidth + this.margin;
    this.doc.line(profX, this.currentY + signatureHeight, profX + signatureWidth, this.currentY + signatureHeight);
    
    if (professionalSignature) {
      try {
        this.doc.addImage(professionalSignature, 'PNG', profX, this.currentY, signatureWidth, signatureHeight);
      } catch (error) {
        console.warn('Erro ao adicionar assinatura do profissional:', error);
      }
    }
    
    this.doc.text('Assinatura do Profissional', profX, this.currentY + signatureHeight + 8);
    this.doc.text('Erides Souza', profX, this.currentY + signatureHeight + 15);
  }

  async generateServiceTermPDF(bookingData, questionnaireData, techniqueData, clientSignature, professionalSignature) {
    // Cabeçalho
    this.addHeader('TERMO DE SERVIÇO - NAIL DESIGNER');
    this.currentY += 5;

    // Informações do cliente e serviço
    this.addSubHeader('INFORMAÇÕES DO SERVIÇO');
    this.currentY += 5;
    
    this.addText(`Cliente: ${bookingData.clientName || 'N/A'}`, 10);
    this.addText(`Serviço: ${bookingData.serviceName}`, 10);
    this.addText(`Data: ${bookingData.date} às ${bookingData.time}`, 10);
    this.addText(`Valor: R$ ${bookingData.price?.toFixed(2) || '0,00'}`, 10);
    this.currentY += 10;

    // Questionário de anamnese
    if (questionnaireData) {
      this.addQuestionnaireSection(questionnaireData);
    }

    // Técnica aplicada
    if (techniqueData) {
      this.addTechniqueSection(techniqueData);
      
      // Termo de autorização
      this.addConsentSection(techniqueData);
    }

    // Assinaturas
    this.addSignatureSection(
      clientSignature,
      professionalSignature,
      techniqueData?.city,
      techniqueData?.procedureDate
    );

    return this.doc;
  }

  save(filename = 'termo-servico.pdf') {
    this.doc.save(filename);
  }

  getBlob() {
    return this.doc.output('blob');
  }

  getDataURL() {
    return this.doc.output('dataurlstring');
  }
}

export { PDFGenerator };
export default PDFGenerator;