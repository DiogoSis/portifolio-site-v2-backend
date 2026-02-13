# Communication & AI Model Strategy | Portfolio Diogo Luna (v2.0)

> **Resumo:** Diretrizes para o Tom de Voz, Arquitetura de IA (RAG) e Experiência de Interação do Usuário. O objetivo é transmitir a senioridade de um **Engenheiro de Software & Tech Lead**.

---

## 1. Persona & Tom de Voz (Brand Voice)

O portfólio não fala como um "programador júnior empolgado", mas como um **Arquiteto de Sistemas Sênior**.

### Pilares da Comunicação
1.  **Técnico & Preciso:** Evite adjetivos vazios ("incrível", "maravilhoso"). Use métricas e fatos ("redução de 30% na latência", "arquitetura serverless").
2.  **Orientado a Solução:** O foco não é o código pelo código, mas o problema de negócio resolvido (Escalabilidade, Segurança, Custo).
3.  **Híbrido (Dev + Ops):** A linguagem deve transitar fluentemente entre *Software Engineering* (Clean Code, Patterns) e *Infrastructure* (AWS, Docker, Linux).

### O Que Fazer vs. O Que Evitar
| ✅ Do (Fazer) | ❌ Don't (Evitar) |
| :--- | :--- |
| "Implementei CI/CD para automatizar deploys." | "Adoro fazer automações." |
| "Arquitetura baseada em microsserviços." | "Fiz um site com varias partes." |
| "Foco em performance e observabilidade." | "Faço sites rápidos." |
| "Disponível para consultoria e liderança." | "Estou procurando qualquer emprego." |

---

## 2. Arquitetura de IA (RAG Model)

O site possui um assistente virtual ("Diogo's Assistant") alimentado por uma arquitetura RAG (Retrieval-Augmented Generation) para responder recrutadores com base em dados reais.

### Stack Tecnológica
* **LLM Engine:** `Groq API` (Model: `llama3-8b-8192`).
    * *Motivo:* Inferência em <100ms (Low Latency Processing Unit) e tier gratuito generoso.
* **Embeddings:** `HuggingFace` (Model: `sentence-transformers/all-MiniLM-L6-v2`).
    * *Motivo:* Execução local (CPU), custo zero, alta eficiência semântica.
* **Vector Store:** `FAISS` (Facebook AI Similarity Search).
    * *Motivo:* Armazenamento de vetores em arquivo local, sem necessidade de banco de dados externo.
* **Orchestration:** `LangChain` (Python).

### Fluxo de Dados (Pipeline)
1.  **Ingestão:** Arquivos Markdown (`curriculo.md`, `projetos.md`, `stack.md`) são convertidos em vetores.
2.  **Retrieval:** A pergunta do usuário é comparada semanticamente com o índice FAISS.
3.  **Augmentation:** Os trechos relevantes são injetados no Prompt do Sistema.
4.  **Generation:** O Llama 3 gera a resposta final.

---

## 3. Diretrizes do System Prompt (Persona da IA)

Configuração base para o comportamento do modelo no LangChain.

> **System Prompt:**
> "Você é o Assistente Virtual Técnico do portfólio do Diogo Luna. Sua função é responder dúvidas de recrutadores e desenvolvedores sobre a carreira do Diogo.
>
> **Regras Estritas:**
> 1.  Responda **APENAS** com base no contexto fornecido (Contexto RAG). Se a informação não estiver lá, diga: 'Não tenho essa informação específica no meu banco de dados, mas você pode perguntar diretamente ao Diogo no LinkedIn.'
> 2.  Seja conciso, profissional e direto. Evite floreios.
> 3.  Se perguntarem sobre tecnologias que o Diogo usa, cite exemplos práticos dos projetos (API Drinks, Segmedic, Core-Hub).
> 4.  O tom deve ser de um parceiro técnico sênior.
> 5.  Idioma principal: Português Brasileiro (mas responda em Inglês se perguntado em Inglês).
>
> **Contexto do Usuário:** Diogo é Tech Lead, especialista em AWS, Linux (Fedora/Debian) e Automação."

---

## 4. Interface de Interação (UX/UI)

A interação com a IA deve seguir a estética "Terminal/Cyberpunk Clean" definida no Design System.

### Componente: `TerminalChat`
* **Visual:** Janela flutuante ou aba `/chat` estilo console.
* **Input:** Prompt de comando (`>_ Digite sua pergunta...`).
* **Output:** Efeito de digitação (Typewriter effect) para simular o stream de dados.
* **Feedback:**
    * *Thinking State:* "Processando vetores..." ou "Acessando Groq LPU..." (Mostrar o "loading" técnico gera valor).
    * *Error State:* "Connection Timeout. Fallback to static mode."

### Gatilhos de Conversão
A IA deve sugerir ações ao final de respostas positivas:
* *"Gostaria de ver o repositório deste projeto?"*
* *"Posso gerar o link para o LinkedIn do Diogo?"*

---

## 5. Estratégia de Conteúdo (Data Source)

Para o RAG funcionar bem, os seguintes arquivos devem ser mantidos atualizados na pasta `/knowledge-base` da API:

1.  **`profile.md`:** Resumo bio, localização, soft skills.
2.  **`experience.md`:** Detalhes técnicos da Segmedic (anonimizados) e experiências passadas.
3.  **`stack.md`:** Lista de tecnologias com nível de proficiência (ex: "AWS: Avançado - Uso diário em EC2/RDS").
4.  **`projects.md`:** Detalhes arquiteturais do API Drinks e Core-Hub.
