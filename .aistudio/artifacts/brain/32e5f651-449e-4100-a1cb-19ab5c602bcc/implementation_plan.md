# Plano de Implementação: Página de Apresentação e Autenticação Google com Nuvem

## 1. Visão Geral do Projeto
Atender à solicitação do usuário criando:
1. **Página de Apresentação Interativa (Landing Page):** Uma vitrine completa que resume de forma visual, elegante e interativa todas as funcionalidades da plataforma (Visão Geral de Indicadores, Mercado & Câmbio VET, Análise Técnica/Gráficos, Política Monetária Copom/BCB, Planejador 50/30/20 com Inteligência Financeira, Modo Privacidade e PWA para instalação em qualquer tela).
2. **Autenticação com Conta Google (Google Sign-In):** Permitir login direto com a conta Google para que o usuário acesse seus dados financeiros (receitas, despesas, alertas e metas) de qualquer lugar (celular, tablet ou computador).
3. **Sincronização em Nuvem (Firebase Auth + Firestore):** Conexão em tempo real salvando o perfil e orçamento familiar na nuvem com migração automática dos dados salvos no navegador (modo offline/local) para o Firestore ao entrar com a conta Google.
4. **Modo Visitante ("Explorar sem Login"):** Liberdade para qualquer usuário navegar e testar todas as ferramentas imediatamente antes ou sem fazer login.

---

## 2. Detalhamento dos Módulos

### Módulo A: Página de Apresentação (`LandingPresentation.tsx`)
- **Hero Section Atraente:**
  - Título de impacto: "Inteligência Macroeconômica & Planejamento Financeiro em Suas Mãos".
  - Subtítulo evidenciando a proposta de valor: cotações em tempo real, cálculo de juro real do Copom, simulador VET e controle orçamentário inteligente 50/30/20.
  - Botão de Ação Primário: **"Entrar com Google"** (com logo oficial do Google).
  - Botão de Ação Secundário: **"Explorar Plataforma sem Login"** (acesso instantâneo direto ao dashboard completo).
- **Painel Interativo de Funcionalidades (Showcase de Ferramentas):**
  - **1. Monitor de Indicadores em Tempo Real:** Dólar, Euro, Selic, IPCA e Ibovespa com mini-gráficos e alertas sonoros e visuais.
  - **2. Mercado & Câmbio VET:** Simulador de Custo Efetivo Total com IOF (cartão vs espécie/global), spread cambial e cotações multilaterais (GBP, JPY, CHF, BTC).
  - **3. Análise Técnica e Correlações:** Gráficos interativos com matriz de correlação histórica e volatilidade calculada.
  - **4. Política Monetária & Copom:** Termômetro dinâmico de Juro Real (equação de Fisher), atas resumidas do Banco Central e rentabilidade comparada de Renda Fixa (Tesouro Selic, CDB, LCI/LCA e Poupança).
  - **5. Planejador 50/30/20 & Inteligência Artificial:** Gestão familiar de receitas/despesas, gráficos de rosca interativos, diagnóstico de excessos e simulação de economia investida.
  - **6. Modo Privacidade Instantâneo:** Atalho para ocultar valores em locais públicos (*).
  - **7. Aplicativo Instalável (PWA):** Instalação nativa em Android, iPhone, iPad, Windows e Mac sem depender de lojas de aplicativos.
- **Seção de Diferenciais & Estatísticas:**
  - Dados em tempo real, sincronização multiplataforma segura, cálculo matemático rigoroso e design 100% responsivo.
- **Barra de Navegação Rápida:**
  - Opção no menu do topo para alternar entre a "Apresentação" e o "Dashboard" a qualquer momento.

---

## 3. Módulo B: Autenticação Google & Sincronização em Nuvem

### Fluxo de Provisionamento Firebase:
1. Execução do fluxo oficial de provisionamento:
   - Chamada à interface de confirmação do Firebase (`show_aistudio_ui` com `ui_type: "firebase_setup"`).
   - Verificação de aceite de termos via RPC (`GetFirebaseTos`).
   - Provisionamento do Firestore e Firebase Auth via RPC (`ProvisionFirebase`).
2. Configuração de Regras de Segurança (`firestore.rules`):
   - Isolamento de dados por usuário (`/users/{userId}/...`).
   - Apenas o usuário autenticado pode ler e gravar seus próprios orçamentos e preferências (`request.auth.uid == userId`).
   - Validações de schema rígidas e integridade de tipos.

### Gerenciador de Autenticação (`AuthContext.tsx`):
- Provedor React com `onAuthStateChanged`.
- Função `signInWithGoogle()` utilizando `signInWithPopup(auth, googleProvider)`.
- Função `logout()` segura.
- Estado global: `currentUser`, `userProfile`, `isLoading`, `isCloudSyncActive`.
- Sincronização de dados:
  - Ao autenticar pela primeira vez: se existirem dados no `localStorage`, salva e sincroniza automaticamente com o Firestore.
  - Listener em tempo real (`onSnapshot`) escutando o documento de orçamento do usuário no Firestore, sincronizando instantaneamente edições entre celular, tablet e computador.
  - Indicador visual no cabeçalho mostrando o status de nuvem: "Conectado como [Nome] - Sincronizado na Nuvem".

---

## 4. Estrutura de Arquivos e Alterações

1. `src/services/firebase.ts`:
   - Inicialização do Firebase App, Firestore (`getFirestore`) e Auth (`getAuth`).
   - Helpers de erro tipados e conformes (`handleFirestoreError`).
2. `src/context/AuthContext.tsx`:
   - Contexto de autenticação Google, sincronização do `plannerData` e preferências na nuvem.
3. `src/components/LandingPresentation.tsx`:
   - Componente completo e moderno da Página de Apresentação interativa com pré-visualizações, call-to-actions e explicações de todas as ferramentas.
4. `src/components/DashboardLayout.tsx`:
   - Adição do botão de perfil/login do Google no topo.
   - Botão para navegar para a Página de Apresentação ou voltar ao Dashboard.
   - Status visual de sincronização em nuvem.
5. `src/App.tsx`:
   - Controle de visualização: exibe a Página de Apresentação para visitantes não logados ou quando solicitado pelo usuário.
   - Conexão do `AuthContext` com o estado do `plannerData`.
6. `firestore.rules` & `firebase-blueprint.json`:
   - Definição da entidade `UserFinancialProfile` e regras seguras de ABAC.

---

## 5. Roteiro de Execução

1. **Fase 1: Preparação e Provisionamento do Firebase**
   - Iniciar o fluxo do Firebase Setup para Auth e Firestore.
   - Aguardar aceitação e concluir provisionamento via RPC Fax.
2. **Fase 2: Implementação do Serviço e Contexto de Autenticação**
   - Configurar `src/services/firebase.ts` e `src/context/AuthContext.tsx`.
   - Implementar login popup com Google e sincronizador bidirecional com Firestore.
3. **Fase 3: Construção da Página de Apresentação Interativa**
   - Criar `src/components/LandingPresentation.tsx` com todos os módulos e visual de alto padrão.
4. **Fase 4: Integração de Layout e Alternância de Telas**
   - Integrar visualização no `src/App.tsx` e botões de perfil no `src/components/DashboardLayout.tsx`.
5. **Fase 5: Regras de Segurança e Deploy**
   - Validar `firestore.rules`, testar sintaxe e publicar regras.
6. **Fase 6: Compilação e Validação Final**
   - Executar compilação TypeScript e build de produção (`npm run build`).
