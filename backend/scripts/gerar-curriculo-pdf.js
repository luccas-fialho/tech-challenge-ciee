/**
 * Script para gerar o currículo fictício em PDF para testes.
 * Usa apenas módulos nativos do Node.js (sem dependências externas).
 * Gera um PDF minimalista com texto real (não escaneado) para compatibilidade com pdf-parse.
 */

const fs = require('fs');
const path = require('path');

// Conteúdo do PDF em formato raw (PDF 1.4 válido com texto real)
// Estrutura manual para garantir que pdf-parse consiga extrair o texto
function gerarPdf(outputPath) {
  const nome = 'Ana Paula Ferreira';
  const email = 'ana.paula.ferreira@email.com';
  const telefone = '(11) 98765-4321';
  const area = 'Desenvolvedora Full Stack';

  const texto = [
    nome,
    '',
    `E-mail: ${email}`,
    `Telefone: ${telefone}`,
    `Área de interesse: ${area}`,
    '',
    'RESUMO PROFISSIONAL',
    'Desenvolvedora Full Stack com 4 anos de experiência em projetos web.',
    'Especializada em React, Node.js, e bancos de dados relacionais.',
    'Apaixonada por boas práticas de código e entrega de valor ao usuário.',
    '',
    'EXPERIÊNCIA PROFISSIONAL',
    '',
    'Desenvolvedora Frontend Sênior — TechSolutions Ltda (2022-2024)',
    '- Liderou o desenvolvimento de uma plataforma SaaS com React e TypeScript',
    '- Reduziu o tempo de carregamento em 40% com otimizações de performance',
    '- Mentoria de 3 desenvolvedores juniores',
    '',
    'Desenvolvedora Web — StartupXYZ (2020-2022)',
    '- Desenvolveu APIs RESTful com Node.js e Express',
    '- Integração com PostgreSQL e Redis',
    '- Participação ativa em code reviews e planejamento de sprints',
    '',
    'FORMAÇÃO ACADÊMICA',
    'Bacharelado em Ciência da Computação — USP (2016-2020)',
    '',
    'HABILIDADES TÉCNICAS',
    'Frontend: React, TypeScript, Tailwind CSS, Next.js',
    'Backend: Node.js, Express, NestJS',
    'Banco de Dados: PostgreSQL, MySQL, SQL Server, MongoDB',
    'DevOps: Docker, GitHub Actions, AWS (básico)',
    'Metodologias: Scrum, Kanban, TDD',
    '',
    'IDIOMAS',
    'Português: Nativo',
    'Inglês: Avançado (leitura técnica, conversação intermediária)',
  ].join('\n');

  // Gera PDF mínimo válido com BT/ET blocks para texto extraível
  const pdfLines = [];
  const textoLinhas = texto.split('\n');

  // Cabeçalho PDF
  const header = '%PDF-1.4\n';

  // Font resource
  const fontObj = '1 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';

  // Monta o stream de conteúdo
  let stream = 'BT\n/F1 12 Tf\n50 750 Td\n14 TL\n';
  for (const linha of textoLinhas) {
    const escapada = linha
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
    stream += `(${escapada}) Tj T*\n`;
  }
  stream += 'ET\n';

  const streamBytes = Buffer.from(stream, 'latin1');
  const streamLen = streamBytes.length;

  const contentObj = `2 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}endstream\nendobj\n`;

  const pageObj = `3 0 obj\n<< /Type /Page /Parent 4 0 R\n   /MediaBox [0 0 595 842]\n   /Contents 2 0 R\n   /Resources << /Font << /F1 1 0 R >> >> >>\nendobj\n`;

  const pagesObj = `4 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;

  const catalogObj = `5 0 obj\n<< /Type /Catalog /Pages 4 0 R >>\nendobj\n`;

  // Calcula offsets para xref
  let offset = header.length;
  const offsets = [];

  offsets.push(offset); // obj 1
  offset += fontObj.length;

  offsets.push(offset); // obj 2
  offset += contentObj.length;

  offsets.push(offset); // obj 3
  offset += pageObj.length;

  offsets.push(offset); // obj 4
  offset += pagesObj.length;

  offsets.push(offset); // obj 5
  offset += catalogObj.length;

  const xrefOffset = offset;

  const xref = [
    'xref',
    '0 6',
    '0000000000 65535 f ',
    ...offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n `),
    '',
    'trailer',
    '<< /Size 6 /Root 5 0 R >>',
    'startxref',
    String(xrefOffset),
    '%%EOF',
  ].join('\n');

  const pdfContent = header + fontObj + contentObj + pageObj + pagesObj + catalogObj + xref;

  fs.writeFileSync(outputPath, pdfContent, 'binary');
  console.log(`✅ PDF gerado: ${outputPath}`);
  console.log(`   Nome: ${nome}`);
  console.log(`   E-mail: ${email}`);
  console.log(`   Telefone: ${telefone}`);
}

const outputPath = path.join(__dirname, '..', 'curriculo-ficticio.pdf');
gerarPdf(outputPath);
