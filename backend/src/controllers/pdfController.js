'use strict';

const multer = require('multer');
const pdfParse = require('pdf-parse');

// Armazena o arquivo em memória para evitar I/O desnecessário em disco
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter(_req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Apenas arquivos PDF são aceitos.'));
    }
    cb(null, true);
  },
});

/**
 * Extrai campos básicos de um texto de currículo usando heurísticas simples.
 *
 * LIMITAÇÕES CONHECIDAS:
 * - Nome: assume que a primeira linha não vazia do PDF é o nome completo.
 *   Isso falha para PDFs que começam com cabeçalhos institucionais, logotipos
 *   convertidos em texto, ou currículos com layout em colunas.
 * - E-mail: regex simples; pode não capturar e-mails com domínios internacionais
 *   (ex.: .рф) ou múltiplos e-mails (retorna apenas o primeiro encontrado).
 * - Telefone: regex permissiva para formatos variados BR; pode capturar sequências
 *   numéricas que não são telefone (ex.: CPF, CEP). Apenas o primeiro match é retornado.
 *
 * Para extração mais robusta, considere NLP ou serviços de parsing de currículo.
 */
function extrairCampos(texto) {
  // E-mail: padrão RFC-5322 simplificado
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = texto.match(emailRegex);
  const email = emailMatch ? emailMatch[0] : null;

  // Telefone: Pega qualquer sequência que tenha entre 8 e 15 números, ignorando espaços, traços e parênteses
  // Isso cobre praticamente todos os formatos globais e mal formatados
  const textSemLetras = texto.replace(/[A-Za-z]/g, '');
  const telefoneRegex = /(?:\+?\d{1,3})?[\s.-]?\(?\d{2,3}\)?[\s.-]?\d{4,5}[\s.-]?\d{4}/;
  const telefoneMatch = textSemLetras.match(telefoneRegex);
  const telefone = telefoneMatch ? telefoneMatch[0].trim() : null;

  // Nome: pega a primeira linha não numerica que aparente ter nome e sobrenome
  const linhas = texto.split('\n').map((l) => l.trim()).filter(Boolean);
  let nomeCompleto = null;
  const palavrasIgnoradas = ['curriculo', 'curriculum', 'vitae', 'resume', 'dados pessoais', 'perfil', 'portifolio', 'github', 'contato', 'brasileiro', 'solteiro', 'casado'];
  
  for (const linha of linhas) {
    const textoLimpo = linha.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Ignora linhas muito curtas ou muito longas
    if (linha.length < 4 || linha.length > 60) continue;
    // Ignora se contém palavras de cabeçalho
    if (palavrasIgnoradas.some((p) => textoLimpo.includes(p))) continue;
    // Ignora se for link, e-mail ou composto de muitos números/símbolos
    if (linha.includes('@') || linha.includes('http') || /[\d:;!?_-]/.test(linha)) continue;
    
    // Assume que um nome possui pelo menos um espaço (Nome Sobrenome) e não tem pontuações bizarras
    if (linha.trim().includes(' ')) {
      nomeCompleto = linha;
      break;
    }
  }

  // Fallback para caso o nome ainda seja null (pega a primeira linha plausível)
  if (!nomeCompleto && linhas.length > 0) {
    const fallback = linhas.find(l => l.length > 3 && l.length < 50 && !l.includes('@') && !/\d/.test(l));
    nomeCompleto = fallback || null;
  }

  return { nomeCompleto, email, telefone };
}

/**
 * POST /api/candidatos/parse-pdf
 */
async function parsePdf(req, res) {
  const uploadMiddleware = upload.single('curriculo');

  uploadMiddleware(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Arquivo muito grande. O tamanho máximo é 5 MB.' });
      }
      return res.status(400).json({ error: `Erro no upload: ${err.message}` });
    }

    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado. Envie um PDF no campo "curriculo".' });
    }

    // Intercepta e silencia os warnings poluentes do "pdf.js" (ex: Warning: TT: undefined function...)
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('Warning: TT:')) return;
      originalWarn(...args);
    };

    try {
      const resultado = await pdfParse(req.file.buffer);
      const campos = extrairCampos(resultado.text);

      return res.status(200).json({ data: campos });
    } catch (parseError) {
      console.error('[pdfController.parsePdf]', parseError);
      return res.status(400).json({
        error: 'Não foi possível ler o arquivo PDF. Verifique se o arquivo não está corrompido ou protegido por senha.',
      });
    } finally {
      // Restaura o console.warn original
      console.warn = originalWarn;
    }
  });
}

module.exports = { parsePdf };
