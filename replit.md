# Beauty Salon Booking App - Salon Beleza Dourada

## Overview

Este é um aplicativo completo de agendamento para salão de beleza especializado em manicure e pedicure. O aplicativo possui um sistema de acesso duplo com interfaces separadas para clientes e profissionais do salão. Utiliza um tema sofisticado preto e dourado e oferece recursos abrangentes de gestão de agendamentos, fidelidade e análises.

## User Preferences

Estilo de comunicação preferido: Linguagem simples e cotidiana em português.

## Recursos Principais

### Sistema de Autenticação
- **Login Duplo**: Fluxos de autenticação separados para clientes e administradores
- **Credenciais do Admin**: Acesso administrativo (Usuário: "Erides Souza", Senha: "301985")  
- **Controle de Acesso**: Componentes e permissões baseados no tipo de usuário

### Para Clientes
- **Dashboard Personalizado**: Visão geral dos agendamentos e estatísticas pessoais
- **Sistema de Agendamento**: Seleção de data, horário e tipo de serviço com validação
- **Catálogo de Serviços**: Cards com imagens, valores, duração e descrições detalhadas
- **Desconto de Aniversário**: 10% de desconto automático no dia do aniversário
- **Sistema de Avaliação**: Avaliação em tempo real dos serviços concluídos
- **Programa de Fidelidade**: Pontos, níveis (Bronze, Prata, Ouro, Diamante) e benefícios
- **Sorteio Mensal**: Sistema de prêmios baseado na interação e fidelidade

### Para Administradores (Erides Souza)
- **Painel Administrativo**: Visão completa da operação do salão
- **Gestão de Agendamentos**: Visualização, edição e controle de status dos agendamentos
- **Relatórios Financeiros**: Faturamento por dia, mês e ano
- **Gestão de Clientes**: Informações detalhadas e histórico de cada cliente
- **Analytics**: Taxa de ocupação, médias e estatísticas operacionais
- **Top Clientes**: Ranking dos clientes mais fiéis e que mais gastam

## Arquitetura do Sistema

### Frontend
- **Framework**: React 19.1.1 com Vite
- **Tema**: Sistema de cores preto e dourado com gradientes e efeitos visuais
- **Componentes**: Arquitetura modular organizada por funcionalidade
- **Responsividade**: Design adaptativo para diferentes tamanhos de tela
- **Animações**: Efeitos visuais suaves e transições elegantes

### Sistema de Dados
- **Armazenamento**: LocalStorage para persistência de dados
- **Estrutura**: JSON para agendamentos, usuários, avaliações e estatísticas
- **Backup**: Dados mantidos localmente com estrutura organizada

### Funcionalidades Avançadas
- **Horário de Funcionamento**: Segunda a sábado, 8:00 às 18:00
- **Validação de Conflitos**: Prevenção de agendamentos duplos
- **Sistema de Pontos**: Acúmulo automático baseado em gastos
- **Cálculo de Níveis**: Progressão automática no programa de fidelidade
- **Geração de Relatórios**: Análises em tempo real

## Dependências Externas

### UI e Estilização
- **@mui/material**: Componentes Material-UI personalizados
- **@mui/icons-material**: Biblioteca de ícones
- **@mui/x-date-pickers**: Seletores avançados de data e hora
- **@emotion/react & @emotion/styled**: Solução CSS-in-JS
- **lucide-react**: Ícones adicionais para interface

### Utilitários
- **date-fns**: Manipulação e formatação de datas
- **dayjs**: Biblioteca leve para operações de data
- **uuid**: Geração de identificadores únicos
- **react-router-dom**: Navegação e roteamento

### Desenvolvimento
- **vite**: Ferramenta de build e servidor de desenvolvimento
- **eslint**: Linting e padronização de código

## Estrutura de Componentes

```
src/
├── components/
│   ├── Auth/           # Autenticação (Login/Registro)
│   ├── Dashboard/      # Dashboards (Cliente)
│   ├── Admin/          # Painel Administrativo
│   ├── Services/       # Catálogo de Serviços
│   ├── Booking/        # Sistema de Agendamento
│   ├── Rating/         # Sistema de Avaliação
│   ├── Loyalty/        # Programa de Fidelidade
│   └── Layout/         # Layout e Header
├── contexts/           # Contextos React (Autenticação)
├── utils/              # Utilitários (Tema, Helpers)
└── App.jsx            # Componente Principal
```

## Estado Atual

Aplicativo completo e funcional com todas as funcionalidades implementadas:
✅ Sistema de autenticação dual
✅ Dashboard para clientes  
✅ Painel administrativo completo
✅ Sistema de agendamento com validação e questionário médico
✅ Catálogo de serviços
✅ Sistema de avaliação em tempo real
✅ Programa de fidelidade com sorteios
✅ Relatórios e analytics
✅ Tema preto e dourado sofisticado
✅ Responsividade completa
✅ **NOVO:** Questionário de anamnese médica no agendamento
✅ **NOVO:** Formulário de técnica aplicada na finalização
✅ **NOVO:** Sistema de geração de PDF com termo de serviço
✅ **NOVO:** Assinatura digital integrada (cliente e profissional)
✅ **NOVO:** Opções de envio por email, WhatsApp e impressão

## Funcionalidades Médicas e Documentação

### Questionário de Anamnese
- **Localização**: Integrado no processo de agendamento (Etapa 2)
- **Campos**: Gravidez, hábitos, alergias, medicamentos, atividades físicas, condições das unhas
- **Validação**: Campos obrigatórios com respostas sim/não e opções múltiplas
- **Armazenamento**: Dados salvos junto com o agendamento no localStorage

### Finalização de Serviços pelo Profissional
- **Acesso**: Painel administrativo → Aba Agendamentos → Botão "Finalizar"
- **Formulário de Técnica**: Gel, Fibra de Vidro, Acrigel, Porcelana, cores, formatos
- **Campos**: Técnica aplicada, cor, formato, detalhes, datas de procedimento e manutenção
- **Autorização**: Termo de consentimento para registro fotográfico

### Sistema de PDF e Assinatura
- **Geração Automática**: PDF completo com dados do questionário e técnica aplicada
- **Assinatura Digital**: Componente react-signature-canvas para cliente e profissional
- **Conteúdo do PDF**: 
  - Dados do serviço e cliente
  - Questionário de anamnese completo
  - Técnica aplicada e detalhes
  - Termo de autorização
  - Assinaturas digitais

### Opções de Envio
- **Email**: Simulação de envio por email (integração futura)
- **WhatsApp**: Simulação de envio via WhatsApp API
- **Impressão**: Abertura do PDF para impressão direta
- **Download**: Download automático do arquivo PDF

## Dependências Adicionais

### Novas Bibliotecas
- **jspdf**: Geração de documentos PDF
- **html2canvas**: Captura de tela para PDF
- **react-signature-canvas**: Componente de assinatura digital
- **react-canvas-signature**: Alternativa para assinatura

### Estrutura de Arquivos Atualizada
```
src/
├── components/
│   ├── Auth/           # Autenticação
│   ├── Dashboard/      # Dashboard Cliente
│   ├── Admin/          # Painel Administrativo
│   │   ├── AdminDashboard.jsx  # Painel principal com finalização
│   │   └── TechniqueForm.jsx   # Formulário de técnica aplicada
│   ├── Booking/        # Sistema de Agendamento
│   │   ├── BookingForm.jsx        # Formulário com questionário
│   │   └── MedicalQuestionnaire.jsx  # Questionário médico
│   ├── Common/         # Componentes Compartilhados
│   │   └── SignaturePad.jsx    # Assinatura digital
│   └── ...
├── utils/
│   ├── theme.js        # Tema e estilos
│   └── pdfGenerator.js # Geração de PDF
└── ...
```

## Fluxo Completo do Processo

1. **Cliente faz agendamento**:
   - Etapa 1: Seleciona serviço, data e horário
   - Etapa 2: Preenche questionário de anamnese médica
   - Confirmação: Agendamento salvo com todos os dados

2. **Profissional realiza o serviço**:
   - Acessa painel administrativo
   - Clica em "Finalizar" no agendamento confirmado
   - Preenche formulário de técnica aplicada
   - Captura assinaturas (cliente obrigatória, profissional opcional)

3. **Geração e envio do termo**:
   - PDF gerado automaticamente com todos os dados
   - Download automático do arquivo
   - Opções de envio: email, WhatsApp ou impressão
   - Status do agendamento atualizado para "completed"