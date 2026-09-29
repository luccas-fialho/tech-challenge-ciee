/**
 * Script para gerar o currículo fictício em PDF usando pdfkit.
 */
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function gerarPdf(outputPath) {
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(outputPath);
  
  doc.pipe(stream);

  // Nome e Contato
  doc.fontSize(22).text('Ana Paula Ferreira', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(12).text('ana.paula.ferreira@email.com', { align: 'center' });
  doc.text('(11) 98765-4321', { align: 'center' });
  doc.text('Área de interesse: Desenvolvedora Full Stack', { align: 'center' });
  doc.moveDown(2);

  // Resumo
  doc.fontSize(16).text('RESUMO PROFISSIONAL');
  doc.moveDown(0.5);
  doc.fontSize(12).text(
    'Desenvolvedora Full Stack com 4 anos de experiência em projetos web. ' +
    'Especializada em React, Node.js, e bancos de dados relacionais. ' +
    'Apaixonada por boas práticas de código e entrega de valor ao usuário.'
  );
  doc.moveDown(2);

  // Experiência
  doc.fontSize(16).text('EXPERIÊNCIA PROFISSIONAL');
  doc.moveDown(0.5);
  doc.fontSize(14).text('Desenvolvedora Frontend Sênior — TechSolutions Ltda (2022-2024)');
  doc.fontSize(12).text('- Liderou o desenvolvimento de uma plataforma SaaS com React e TypeScript');
  doc.text('- Reduziu o tempo de carregamento em 40% com otimizações de performance');
  doc.text('- Mentoria de 3 desenvolvedores juniores');
  
  doc.end();

  stream.on('finish', () => {
    console.log(`✅ PDF gerado com pdfkit em: ${outputPath}`);
  });
}

// Salva na raiz do projeto
const outputPath = path.join(__dirname, '..', '..', 'curriculo-ficticio.pdf');
gerarPdf(outputPath);
