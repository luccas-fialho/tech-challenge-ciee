'use strict';

const { PrismaClient } = require('@prisma/client');

// Singleton do PrismaClient para evitar múltiplas conexões em ambiente de desenvolvimento
// Em produção, o Node.js mantém uma única instância por processo
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

module.exports = prisma;
