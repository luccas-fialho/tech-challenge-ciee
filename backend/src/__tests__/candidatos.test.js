'use strict';

const request = require('supertest');

// Mock do Prisma ANTES de importar o app para evitar conexão real com o banco
jest.mock('../prisma', () => ({
  candidato: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  $disconnect: jest.fn(),
}));

const app = require('../server');
const prisma = require('../prisma');

// Silencia o console durante os testes
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// GET /api/candidatos — Listagem
// ---------------------------------------------------------------------------
describe('GET /api/candidatos', () => {
  it('deve retornar lista de candidatos com status 200', async () => {
    const mockCandidatos = [
      {
        id: 1,
        nomeCompleto: 'João Silva',
        email: 'joao@email.com',
        areaInteresse: 'TI',
        createdAt: new Date().toISOString(),
      },
    ];

    prisma.candidato.findMany.mockResolvedValue(mockCandidatos);

    const res = await request(app).get('/api/candidatos');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].email).toBe('joao@email.com');
  });

  it('deve retornar lista vazia quando não há candidatos', async () => {
    prisma.candidato.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/candidatos');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// POST /api/candidatos — Criação válida
// ---------------------------------------------------------------------------
describe('POST /api/candidatos', () => {
  const candidatoValido = {
    nomeCompleto: 'Maria Souza',
    email: 'maria@email.com',
    telefone: '11 99999-9999',
    areaInteresse: 'Design',
    resumoProfissional: 'Profissional com 5 anos de experiência.',
  };

  it('deve criar um candidato válido e retornar status 201', async () => {
    prisma.candidato.create.mockResolvedValue({ id: 1, ...candidatoValido });

    const res = await request(app).post('/api/candidatos').send(candidatoValido);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.email).toBe('maria@email.com');
    expect(prisma.candidato.create).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // Validações — campos obrigatórios
  // -------------------------------------------------------------------------
  it('deve retornar 422 quando nomeCompleto está ausente', async () => {
    const { nomeCompleto, ...semNome } = candidatoValido;

    const res = await request(app).post('/api/candidatos').send(semNome);

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('details');
    expect(res.body.details.some((d) => d.campo === 'nomeCompleto')).toBe(true);
  });

  it('deve retornar 422 quando email está ausente', async () => {
    const { email, ...semEmail } = candidatoValido;

    const res = await request(app).post('/api/candidatos').send(semEmail);

    expect(res.status).toBe(422);
    expect(res.body.details.some((d) => d.campo === 'email')).toBe(true);
  });

  it('deve retornar 422 quando email é inválido', async () => {
    const res = await request(app)
      .post('/api/candidatos')
      .send({ ...candidatoValido, email: 'email-invalido' });

    expect(res.status).toBe(422);
    expect(res.body.details.some((d) => d.campo === 'email')).toBe(true);
  });
});
