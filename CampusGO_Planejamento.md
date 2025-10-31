# 🧭 CampusGO — Planejamento e Roadmap (2025)

## 🗂️ KANBAN DO PROJETO

### 🟢 Concluído
| Categoria | Tarefa | Responsável | Observações |
|------------|--------|--------------|-------------|
| Frontend (React) | Estrutura do projeto React + Vite | João | Projeto base funcional e organizado |
| Frontend (UI) | Login funcional com modo visitante | João | Simula login, exibe mapa após autenticação |
| Frontend (MapView) | Zoom e Pan no mapa SVG | João | Totalmente funcional |
| Frontend (MapView) | Rota animada com `@keyframes` | João | Linha com movimento contínuo |
| Frontend (MapView) | Tooltips e interatividade nos nós | João | Implementado via `<title>` no SVG |
| UI Design | Logo “CampusGO” e identidade Unifametro | João | Moderno, minimalista e verde institucional |
| Infraestrutura | Ambiente local (Vite + Flask) | João | Funcional com CORS habilitado |

### 🟡 Em andamento
| Categoria | Tarefa | Responsável | Observações |
|------------|--------|--------------|-------------|
| Frontend (Layout) | Ajustes visuais finos (alinhamento, espaçamentos) | Dev Frontend | Falta centralizar busca e texto “Olá, Visitante” |
| Frontend (Layout) | Responsividade total (menu mobile) | Dev Frontend | Menu já tem slide + fade, falta colapso automático |
| Backend (Flask) | Teste das rotas `/map-data` e `/classes/:matricula` | Dev Backend | Validar JSON retornado e status CORS |
| UI/UX | Splash Screen (logo animado CampusGO) | Designer | Exibir logo com fade antes do login |
| Documentação | README e Manual do Usuário | Doc Team | Criar doc institucional do projeto |

### 🔴 A fazer
| Categoria | Tarefa | Responsável | Observações |
|------------|--------|--------------|-------------|
| Backend (Flask) | Criar rota `/login` para autenticação real | Dev Backend | Substituir login simulado |
| Backend (Flask) | Implementar CRUD do mapa (`POST /map-update`) | Dev Backend | Permitir cadastrar novos pontos |
| Frontend (UX) | Criar botão “🏠 Voltar ao início” | Dev Frontend | Resetar zoom/pan e rota |
| Frontend (UX) | Criar botão “📍 Me leve até” | Dev Frontend | Buscar e traçar rota automática |
| Backend (Data) | Sincronizar mapa com JSON real (blocos reais da Unifametro) | Dev Backend | Atualizar coordenadas e setores |
| Frontend (UI) | Melhorar animações e feedbacks (hover, clique, loading) | Dev Frontend | Polir UX final |

---

## 🧭 ROADMAP TÉCNICO

### 📅 Sprint 1 — Fundamentos (✅ Concluída)
> 🗓️ Duração: 2 semanas  
> 🎯 Objetivo: Estruturar base visual e lógica do sistema

- [x] Criar tela inicial (login e visitante)  
- [x] Desenvolver mapa SVG com zoom/pan  
- [x] Implementar animação de rota  
- [x] Criar logo e identidade visual  
- [x] Configurar backend Flask básico  

### 📅 Sprint 2 — Integração e Usabilidade (🟡 Em andamento)
> 🗓️ Duração: 3 semanas  
> 🎯 Objetivo: Integrar backend e polir a experiência do usuário

- [ ] Validar endpoints Flask (`/map-data`, `/classes`)  
- [ ] Adicionar autenticação real (`/login`)  
- [ ] Splash screen com logo animado  
- [ ] Ajustar responsividade e alinhamentos  
- [ ] Testar integração local (localhost:5000 + 5173)

### 📅 Sprint 3 — Recursos Avançados (🔴 Planejada)
> 🗓️ Duração: 3 semanas  
> 🎯 Objetivo: Adicionar interatividade e recursos inteligentes

- [ ] CRUD de mapa (cadastrar pontos, editar rotas)  
- [ ] Sistema de busca de locais (“Me leve até...”)  
- [ ] Painel lateral de legendas dinâmicas  
- [ ] “Voltar ao início” e reset do mapa  
- [ ] Integração futura com coordenadas reais da Unifametro  

### 📅 Sprint 4 — Entrega e Documentação (🔴 Planejada)
> 🗓️ Duração: 2 semanas  
> 🎯 Objetivo: Finalizar versão estável e preparar entrega acadêmica

- [ ] Criar documentação técnica (README + PDF)  
- [ ] Gerar vídeo demonstrativo do sistema  
- [ ] Apresentar deploy local (Flask + React + JSON)  
- [ ] Showcase final com equipe e mentores  

---

## 📈 Progresso Geral

| Fase | Progresso | Status |
|------|------------|--------|
| Sprint 1 – Fundamentos | ██████████ 100% | ✅ Concluído |
| Sprint 2 – Integração | ███████░░░ 70% | 🟡 Em andamento |
| Sprint 3 – Recursos Avançados | ███░░░░░░ 30% | 🔴 Planejado |
| Sprint 4 – Entrega Final | █░░░░░░░░░ 10% | 🔴 Planejado |

---

## 🚀 Próximas Ações Imediatas

1️⃣ **Backend Flask**
- Criar endpoint `/login` para validar matrícula.  
- Confirmar rotas `/map-data` e `/classes/:matricula` com CORS.  
- Implementar rota `POST /map-update` para atualizar JSON.  

2️⃣ **Frontend React**
- Substituir `setTimeout()` do login por chamada `fetch('/login')`.  
- Criar botão “Voltar ao início” e “Me leve até”.  
- Adicionar splash animado do logo antes do login.  

3️⃣ **Documentação**
- Adicionar este arquivo `CampusGO_Planejamento.md` no repositório GitHub.  
- Incluir instruções de setup e dependências (Flask + Vite).  

---

👨‍💻 **Scrum Master:** João Victor de Melo Barros  
🏫 **Projeto de Extensão:** Prática Profissional e Inovação — UNIFAMETRO Fortaleza  
📘 **Versão:** 2025.10.31  
