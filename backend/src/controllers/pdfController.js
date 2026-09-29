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

  // Telefone: suporta formatos (11) 99999-9999, 11 9 9999-9999, +55 11 99999999, etc.
  const telefoneRegex = /(\(?\d{2}\)?[\s.-]?)?[\d\s.-]{8,}/;
  const telefoneMatch = texto.match(telefoneRegex);
  const telefone = telefoneMatch ? telefoneMatch[0].trim() : null;

  // Nome: primeira linha não vazia — heurística simples (ver limitações acima)
  const linhas = texto.split('\n').map((l) => l.trim()).filter(Boolean);
  const nomeCompleto = linhas.length > 0 ? linhas[0] : null;

  return { nomeCompleto, email, telefone };
}

/**
 * POST /api/candidatos/parse-pdf
 * Recebe um arquivo PDF via multipart/form-data (campo: "curriculo"),
 * extrai texto e tenta identificar nome, e-mail e telefone do candidato.
 *
 * Esse endpoint é totalmente independente do cadastro manual — serve apenas
 * para pré-preencher o formulário no frontend.
 */
async function parsePdf(req, res) {
  // Middleware multer executado inline para capturar erros do multer corretamente
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

    try {
      const resultado = await pdfParse(req.file.buffer);
      const campos = extrairCampos(resultado.text);

      return res.status(200).json({ data: campos });
    } catch (parseError) {
      console.error('[pdfController.parsePdf]', parseError);
      return res.status(400).json({
        error: 'Não foi possível ler o arquivo PDF. Verifique se o arquivo não está corrompido ou protegido por senha.',
      });
    }
  });
}

module.exports = { parsePdf };
