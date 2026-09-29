'use strict';

const { validationResult } = require('express-validator');

/**
 * Middleware que verifica os resultados das validações do express-validator.
 * Se houver erros, retorna 422 com a lista detalhada.
 * Caso contrário, passa para o próximo middleware/controller.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Dados inválidos. Verifique os campos e tente novamente.',
      details: errors.array().map((e) => ({ campo: e.path, mensagem: e.msg })),
    });
  }

  next();
}

module.exports = handleValidationErrors;
