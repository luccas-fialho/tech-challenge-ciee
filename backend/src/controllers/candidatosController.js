'use strict';

const prisma = require('../prisma');

/**
 * POST /api/candidatos
 * Cria um novo candidato no banco de dados.
 * Retorna 201 com os dados criados ou 409 se o e-mail já estiver cadastrado.
 */
async function criar(req, res) {
  const { nomeCompleto, email, telefone, areaInteresse, resumoProfissional } = req.body;

  try {
    const candidato = await prisma.candidato.create({
      data: { nomeCompleto, email, telefone, areaInteresse, resumoProfissional },
    });

    return res.status(201).json({ data: candidato });
  } catch (error) {
    // Código P2002 do Prisma: violação de unique constraint
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'E-mail já cadastrado no sistema.' });
    }

    console.error('[candidatosController.criar]', error);
    return res.status(500).json({ error: 'Erro interno ao criar candidato.' });
  }
}

/**
 * GET /api/candidatos
 * Lista todos os candidatos com campos resumidos (sem resumoProfissional).
 * Ordenados por data de criação, mais recentes primeiro.
 */
async function listar(req, res) {
  try {
    const candidatos = await prisma.candidato.findMany({
      select: {
        id: true,
        nomeCompleto: true,
        email: true,
        areaInteresse: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ data: candidatos });
  } catch (error) {
    console.error('[candidatosController.listar]', error);
    return res.status(500).json({ error: 'Erro interno ao listar candidatos.' });
  }
}

/**
 * GET /api/candidatos/:id
 * Retorna os detalhes completos de um candidato pelo ID.
 * Retorna 404 se não encontrado.
 */
async function buscarPorId(req, res) {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido. Deve ser um número inteiro.' });
  }

  try {
    const candidato = await prisma.candidato.findUnique({ where: { id } });

    if (!candidato) {
      return res.status(404).json({ error: 'Candidato não encontrado.' });
    }

    return res.status(200).json({ data: candidato });
  } catch (error) {
    console.error('[candidatosController.buscarPorId]', error);
    return res.status(500).json({ error: 'Erro interno ao buscar candidato.' });
  }
}

module.exports = { criar, listar, buscarPorId };
