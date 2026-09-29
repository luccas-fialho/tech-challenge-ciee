# DESENVOLVIMENTO.md — Registro do Desenvolvimento

## 1. Organização e execução do trabalho

O desafio foi organizado em etapas sequenciais, priorizando a integração funcional entre as partes antes de refinar detalhes visuais:

1. **Leitura e planejamento** — análise do enunciado, definição de stack e arquitetura
2. **Infraestrutura** — docker-compose para SQL Server, estrutura de pastas
3. **Backend** — modelo de dados, rotas, validações, extração de PDF
4. **Frontend** — páginas, formulários, integração com API
5. **Testes** — testes unitários do backend
6. **Documentação** — README, DESENVOLVIMENTO.md, currículo fictício

### Priorização

Como o prazo é curto, priorizei:

- Funcionalidade completa dos dois fluxos de cadastro (manual e PDF)
- Validações corretas em ambas as camadas
- Código limpo e organizado
- Documentação clara

Itens que ficariam para uma segunda iteração com mais tempo: testes E2E, autenticação, paginação na listagem, edição de candidatos.

---

## 2. Principais decisões técnicas

### Stack

| Decisão                    | Motivo                                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| **React + Vite**           | Build rápido, excelente DX, padrão de mercado                                                  |
| **Tailwind CSS**           | Produtividade sem sair do HTML, fácil de customizar                                            |
| **React Hook Form + Zod**  | Performance (sem re-renders desnecessários), validação type-safe e reutilizável                |
| **Node.js + Express**      | Leve, flexível, amplamente conhecido                                                           |
| **Prisma ORM**             | Migrations automáticas, type-safety, suporte nativo ao SQL Server                              |
| **pdf-parse**              | Biblioteca madura, sem dependências externas pesadas, suficiente para extração básica de texto |
| **Docker para SQL Server** | Ambiente isolado, reproduzível, sem instalação local do SQL Server                             |

### Separação de responsabilidades

- **Backend** valida todos os dados — a validação do frontend é apenas UX (não substitui a do servidor)
- **Extração de PDF** é um endpoint separado — não está acoplado ao fluxo de salvamento
- **Prisma schema** é a fonte de verdade do modelo de dados — as migrations são geradas a partir dele

### Tratamento de erros

Todos os erros seguem o formato:

```json
{ "error": "Mensagem em português", "details": [] }
```

E os sucessos:

```json
{ "data": { ... } }
```

---

## 3. Ferramentas de IA utilizadas

**Ferramenta:** Google Antigravity (Gemini + Claude Sonnet 4.6)

### Como a IA participou

A IA foi utilizada como **par de programação acelerado**, responsável pela geração inicial de código boilerplate e estrutura de arquivos, enquanto as decisões de arquitetura, escolha de bibliotecas e validação da solução foram tomadas por mim.

#### Etapas onde a IA ajudou:

| Etapa               | Contribuição da IA                                            |
| ------------------- | ------------------------------------------------------------- |
| Scaffolding inicial | Gerou estrutura de pastas, package.json, configurações        |
| Schema Prisma       | Gerou o modelo inicial da tabela `Candidato`                  |
| Controllers e rotas | Gerou o esqueleto das rotas Express e controllers             |
| Componentes React   | Gerou os componentes de UI (formulário, listagem, detalhes)   |
| Regex do PDF        | Auxiliou na elaboração das expressões regulares para extração |
| Testes Jest         | Gerou os casos de teste iniciais com mocks do Prisma          |
| Documentação        | Auxiliou na estruturação do README                            |

#### Exemplos de prompts utilizados:

> _"Crie o schema Prisma para SQL Server com os campos: nomeCompleto, email, telefone, areaInteresse, resumoProfissional"_

> _"Implemente o endpoint POST /api/candidatos/parse-pdf usando multer e pdf-parse, com validação de tipo e tamanho"_

> _"Crie o componente FormularioCandidato com React Hook Form e Zod, incluindo a seção de upload de PDF opcional"_

### O que precisei corrigir ou adaptar

- Ajuste nos tipos TypeScript/JSX gerados (simplificação para JS puro)
- Refinamento nas mensagens de erro para português
- Ajuste na heurística de extração de nome do PDF (a IA propôs abordagem muito simples)
- Revisão das validações do express-validator para cobrir edge cases
- Ajuste no proxy do Vite para funcionar corretamente com o backend

---

## 4. Como verifiquei se a solução estava correta

- **Testes automatizados:** Jest + Supertest cobrindo os principais fluxos
- **Testes manuais:** Upload de PDF com o currículo fictício incluído no repositório
- **Validações:** Tentei salvar formulários inválidos (sem nome, e-mail inválido, PDF > 5MB)
- **Integração:** Verifiquei a comunicação frontend → backend → banco com dados persistidos
- **Mensagens:** Confirmei que todas as situações de erro/sucesso exibem mensagens claras

---

## 5. Tempo aproximado dedicado

| Atividade                                | Tempo estimado |
| ---------------------------------------- | -------------- |
| Leitura e planejamento                   | ~30 min        |
| Configuração da infraestrutura           | ~20 min        |
| Backend (rotas, controllers, validações) | ~1h 30min      |
| Frontend (páginas, componentes)          | ~1h 30min      |
| Integração e ajustes                     | ~30 min        |
| Testes                                   | ~30 min        |
| Documentação                             | ~30 min        |
| **Total**                                | **~5 horas**   |

---

## 6. Dificuldades e limitações

### Limitações da extração de PDF

A extração de dados do PDF é baseada em **heurísticas simples** e tem limitações conhecidas:

1. **Nome:** Utiliza a primeira linha não vazia do texto extraído como nome. Isso pode falhar se o PDF começar com um título, cabeçalho ou dados de contato antes do nome.

2. **E-mail:** Regex padrão `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}` — funciona para a maioria dos formatos, mas pode não capturar e-mails com caracteres unicode.

3. **Telefone:** Regex busca sequências numéricas com formato de telefone brasileiro. Pode gerar falsos positivos em números como CEP ou CPF.

4. **PDFs com texto em imagem (escaneados):** `pdf-parse` só extrai texto de PDFs com texto real. PDFs escaneados (imagens) retornam texto vazio — a aplicação trata isso como "nenhum dado encontrado" e permite preenchimento manual.

5. **PDFs com formatação complexa:** Layouts em múltiplas colunas podem gerar texto extraído fora de ordem, prejudicando a heurística do nome.

### O que faria com mais tempo

- **OCR para PDFs escaneados** usando Tesseract.js ou Azure Computer Vision
- **NLP para extração de nome** — usar uma biblioteca de NER (Named Entity Recognition)
- **Paginação** na listagem de candidatos
- **Edição** de candidatos já cadastrados
- **Testes E2E** com Playwright ou Cypress
- **Autenticação** básica para proteger a aplicação
- **Upload de arquivo** com visualização do PDF antes de extrair
- **Feedback de progresso** durante o upload de PDFs grandes
- **Deploy** em ambiente cloud (Azure, Vercel + Railway)

---

## 7. Próximos passos (pendências)

- [ ] Implementar edição de candidatos
- [ ] Adicionar paginação na listagem
- [ ] Testes de integração completos (banco de dados real em memória)
- [ ] Testes do componente React (React Testing Library)
- [ ] Melhorar extração de nome com NLP
- [ ] Adicionar suporte a OCR para PDFs escaneados

---

## 8. Correções Realizadas Pós-Entrega Inicial (Troubleshooting)

Ao realizar os testes finais de integração, foram identificados e corrigidos dois bugs importantes:

1. **Bug nos Detalhes do Candidato:** O frontend não exibia as informações após clicar em "Ver Detalhes".
   - _Causa:_ O backend empacota todas as respostas dentro de um objeto `{ data: ... }` (padrão de API). O arquivo `api.js` do frontend estava retornando `response.data`, fazendo com que os componentes esperassem campos na raiz, quando na verdade estavam dentro de `dados.data`.
   - _Correção:_ Ajustado o `api.js` para retornar sempre `response.data.data`.

2. **Bug na Extração de Dados do PDF:** O parsing falhava e retornava mensagem de arquivo não enviado, além de ser frágil em PDFs reais.
   - _Causa 1:_ O `FormData` do frontend enviava o arquivo com a chave `'pdf'`, mas o `multer` do backend esperava a chave `'curriculo'`.
   - _Causa 2:_ As heurísticas de RegEx para telefone capturavam falsos-positivos e a heurística de nome capturava palavras como "Currículo".
   - _Correção:_ Alinhado o nome do campo para `'curriculo'` no frontend, atualizada a RegEx de telefone e adicionado um filtro de palavras ignoradas (como "curriculum", "vitae", etc) na leitura do PDF.

Estas melhorias garantiram uma experiência robusta mesmo para PDFs fora do padrão fictício gerado e assegurou que as listagens renderizassem os valores corretamente.
