'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const prisma = require('./prisma');
const candidatosRouter = require('./routes/candidatos');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Segurança e CORS ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// --- Parsers ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Rotas ---
app.use('/api/candidatos', candidatosRouter);

// --- Rota de saúde ---
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// --- 404 para rotas não encontradas ---
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// --- Error handler global ---
app.use((err, _req, res, _next) => {
  console.error('[GlobalErrorHandler]', err);
  res.status(500).json({ error: 'Erro interno no servidor.' });
});

// --- Start ---
const server = app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});

// --- Graceful shutdown ---
async function shutdown(signal) {
  console.log(`\n🔴 Recebido ${signal}. Encerrando servidor...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('✅ Prisma desconectado. Encerrando processo.');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = app; // Exporta para testes
