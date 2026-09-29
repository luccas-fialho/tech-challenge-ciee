'use strict';

const { body } = require('express-validator');

/**
 * Regras de validação para criação/atualização de candidato.
 * Usado em conjunto com handleValidationErrors.
 */
const validarCandidato = [
  body('nomeCompleto')
    .trim()
    .notEmpty()
    .withMessage('O nome completo é obrigatório.'),

  body('email')
    .notEmpty()
    .withMessage('O e-mail é obrigatório.')
    .isEmail()
    .withMessage('Informe um e-mail válido.')
    .normalizeEmail(),

  body('telefone')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  body('areaInteresse')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('A área de interesse deve ter no máximo 255 caracteres.'),

  body('resumoProfissional')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('O resumo profissional deve ter no máximo 5000 caracteres.'),
];

module.exports = validarCandidato;
