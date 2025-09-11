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
- **Gestão de Planos Mensais**: Criação, visualização e gerenciamento de planos de assinatura

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
✅ **NOVO:** Ficha de cadastro completa com dados pessoais, endereço e documentos
✅ **NOVO:** Sistema de edição de perfil para clientes
✅ **CORRIGIDO:** Problema crítico de congelamento do menu hambúrguer resolvido (Set/2024)
✅ **NOVO:** Sistema completo de planos mensais com CRUD (Set/2024)
✅ **CORRIGIDO:** Navegação do menu hambúrguer para clientes e administradores (Set/2024)

## Correções Realizadas

### Problema de Sincronização Excessiva (Set/2024)
- **Problema**: Loop de sincronização no AuthContext.jsx causando centenas de requisições por minuto
- **Sintoma**: Menu hambúrguer travando e interface congelando
- **Solução**: Desabilitação temporária do sistema de sincronização automática
- **Status**: ✅ Resolvido - Interface funcionando normalmente
- **Ação futura**: Reimplementar sincronização com controles adequados quando necessário

### Correção da Navegação do Menu Hambúrguer (Set/2024)
- **Problema**: Menu hambúrguer não navegava corretamente para funcionalidades
- **Sintoma**: Botões do menu apenas fechavam o menu sem navegar para a seção
- **Solução**: 
  - Clientes: Implementação de eventos CustomEvent com payload correto
  - Admin: Sistema de navegação baseado em hash (#admin-section)
- **Status**: ✅ Resolvido - Navegação funcionando para todas as seções
- **Resultado**: Menu agora navega corretamente para Dashboard, Serviços, Agendamentos, etc.

## Sistema de Planos Mensais (Set/2024)

### Funcionalidades Implementadas
- **Criação de Planos**: Modal completo com validação de campos obrigatórios
- **Visualização**: Interface em grid mostrando todos os planos criados
- **Persistência**: Armazenamento em localStorage com sincronização automática
- **Navegação**: Integração completa com menu hambúrguer administrativo
- **Validação**: Campos obrigatórios (nome, preço, benefícios) com validação numérica

### Estrutura de Dados dos Planos
```json
{
  "id": "timestamp_string",
  "name": "Nome do Plano",
  "monthlyPrice": 99.99,
  "benefits": ["Benefício 1", "Benefício 2"],
  "includedServiceIds": [1, 2, 3],
  "active": true,
  "createdAt": "2024-09-11T02:30:00.000Z"
}
```

### Interface do Usuario
- **Acesso Admin**: Menu hambúrguer → "📋 Planos Mensais"
- **Criação**: Menu hambúrguer → "➕ Criar Plano Mensal"
- **Visualização**: Grid de cards com informações completas de cada plano
- **Estado Vazio**: Mensagem informativa quando não há planos criados

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

### Ficha de Cadastro Completa
- **Localização**: Processo de registro de novo usuário
- **Seções organizadas**: Dados pessoais, endereço, documentos, contato e acesso
- **Formatação automática**: CPF, CEP e telefone com máscaras de entrada
- **Campos da ficha de anamnese**: Nome, idade, ocupação, indicação, endereço, CEP, CPF, RG, contato
- **Validação**: Campos obrigatórios marcados e validação de formulário

### Sistema de Edição de Perfil
- **Acesso**: Dashboard do cliente → Botão "Editar Perfil"
- **Modal completo**: Permite edição de todos os dados pessoais
- **Atualização em tempo real**: Dados salvos no localStorage e contexto de autenticação
- **Interface intuitiva**: Seções organizadas com formatação automática

## Fluxo Completo do Processo

1. **Cliente se cadastra**:
   - Preenche ficha completa de anamnese no registro
   - Dados organizados em seções: pessoais, endereço, documentos, contato
   - Conta criada com todos os dados salvos

2. **Cliente faz agendamento**:
   - Etapa 1: Seleciona serviço, data e horário
   - Etapa 2: Preenche questionário de anamnese médica
   - Confirmação: Agendamento salvo com todos os dados

3. **Cliente pode editar perfil**:
   - Acessa dashboard e clica em "Editar Perfil"
   - Atualiza informações pessoais quando necessário
   - Alterações salvas automaticamente

4. **Profissional realiza o serviço**:
   - Acessa painel administrativo
   - Clica em "Finalizar" no agendamento confirmado
   - Preenche formulário de técnica aplicada
   - Captura assinaturas (cliente obrigatória, profissional opcional)

5. **Geração e envio do termo**:
   - PDF gerado automaticamente com todos os dados
   - Download automático do arquivo
   - Opções de envio: email, WhatsApp ou impressão
   - Status do agendamento atualizado para "completed"