'use strict';

const { Router } = require('express');
const { criar, listar, buscarPorId } = require('../controllers/candidatosController');
const { parsePdf } = require('../controllers/pdfController');
const validarCandidato = require('../middlewares/validarCandidato');
const handleValidationErrors = require('../middlewares/handleValidationErrors');

const router = Router();

/**
 * POST /api/candidatos/parse-pdf
 * Upload de PDF para extração de dados. Deve ser definido ANTES de /:id
 * para evitar que "parse-pdf" seja interpretado como um ID.
 */
router.post('/parse-pdf', parsePdf);

/**
 * POST /api/candidatos
 * Cria um novo candidato (cadastro manual — independente do parse de PDF).
 */
router.post('/', validarCandidato, handleValidationErrors, criar);

/**
 * GET /api/candidatos
 * Lista todos os candidatos com campos resumidos.
 */
router.get('/', listar);

/**
 * GET /api/candidatos/:id
 * Retorna detalhes completos de um candidato.
 */
router.get('/:id', buscarPorId);

module.exports = router;
