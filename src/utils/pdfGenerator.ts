import jsPDF from 'jspdf';
import { AvaliacaoFisioterapeutica, Cliente } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const gerarPDFAvaliacao = (avaliacao: AvaliacaoFisioterapeutica, cliente: Cliente) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 15;
  const marginRight = 15;
  const maxWidth = pageWidth - marginLeft - marginRight;

  // Função para adicionar texto com quebra de linha automática
  const addText = (text: string, fontSize: number = 10, isBold: boolean = false, leftMargin: number = marginLeft) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    if (!text || text.trim() === '') {
      text = 'Não informado';
    }
    
    const lines = doc.splitTextToSize(text, maxWidth - (leftMargin - marginLeft));
    doc.text(lines, leftMargin, yPosition);
    yPosition += lines.length * (fontSize * 0.4) + 3;
    
    // Verificar se precisa de nova página
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
  };

  const addSection = (title: string) => {
    yPosition += 5;
    doc.setFillColor(26, 123, 125); // cor primária
    doc.rect(marginLeft, yPosition - 5, maxWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    addText(title, 12, true);
    doc.setTextColor(0, 0, 0);
    yPosition += 2;
  };

  const addSubSection = (title: string) => {
    yPosition += 3;
    addText(title, 11, true);
  };

  // Header
  doc.setFillColor(26, 123, 125);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SOUL SALUTTĒ - AVALIAÇÃO FISIOTERAPÊUTICA', pageWidth / 2, 15, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  yPosition = 35;

  // Informações do Paciente
  addSection('1. DADOS DO PACIENTE');
  addText(`Nome: ${cliente.nome}`, 11, true);
  addText(`Data de Nascimento: ${format(new Date(cliente.dataNascimento), 'dd/MM/yyyy', { locale: ptBR })}`);
  addText(`Email: ${cliente.email || 'Não informado'}`);
  addText(`Telefone: ${cliente.telefone || 'Não informado'}`);
  addText(`Profissão: ${cliente.profissao || 'Não informado'}`);
  addText(`Endereço: ${cliente.enderecoResidencial || 'Não informado'}, ${cliente.bairro || ''}, ${cliente.cidade || ''}`);

  // Data da Avaliação
  addSection('2. DATA DA AVALIAÇÃO');
  addText(`Data: ${format(new Date(avaliacao.dataAvaliacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`, 11, true);

  // Diagnósticos
  addSection('3. DIAGNÓSTICOS');
  addSubSection('Diagnóstico Clínico:');
  addText(avaliacao.diagnosticoClinico);
  addSubSection('Diagnóstico Fisioterapêutico:');
  addText(avaliacao.diagnosticoFisioterapeutico);

  // História Clínica
  addSection('4. HISTÓRIA CLÍNICA');
  addSubSection('Queixa Principal:');
  addText(avaliacao.queixaPrincipal);
  addSubSection('História da Moléstia Atual (HMA):');
  addText(avaliacao.hma);
  addSubSection('História da Moléstia Pregressa (HMP):');
  addText(avaliacao.hmp);
  addSubSection('Antecedentes Pessoais:');
  addText(avaliacao.antecedentesPessoais);
  addSubSection('Antecedentes Familiares:');
  addText(avaliacao.antecedentesFamiliares);
  addSubSection('Hábitos de Vida:');
  addText(avaliacao.habitosVida);
  addSubSection('Tratamentos Realizados:');
  addText(avaliacao.tratamentosRealizados);

  // Exame Clínico/Físico
  addSection('5. EXAME CLÍNICO/FÍSICO');
  
  addSubSection('5.1 Apresentação:');
  const apresentacao = [];
  if (avaliacao.deambulando) apresentacao.push('Deambulando');
  if (avaliacao.deambulandoComApoio) apresentacao.push('Deambulando com apoio');
  if (avaliacao.cadeiraDeRodas) apresentacao.push('Cadeira de rodas');
  if (avaliacao.internado) apresentacao.push('Internado');
  if (avaliacao.orientado) apresentacao.push('Orientado');
  addText(apresentacao.length > 0 ? apresentacao.join(', ') : 'Não informado');

  addSubSection('5.2 Exames Complementares:');
  addText(avaliacao.temExamesComplementares ? 'Sim' : 'Não');
  if (avaliacao.temExamesComplementares) {
    addText(`Descrição: ${avaliacao.examesComplementaresDescricao}`);
  }

  addSubSection('5.3 Medicamentos:');
  addText(avaliacao.usaMedicamentos ? 'Sim' : 'Não');
  if (avaliacao.usaMedicamentos) {
    addText(`Descrição: ${avaliacao.medicamentosDescricao}`);
  }

  addSubSection('5.4 Cirurgias:');
  addText(avaliacao.realizouCirurgia ? 'Sim' : 'Não');
  if (avaliacao.realizouCirurgia) {
    addText(`Descrição: ${avaliacao.cirurgiasDescricao}`);
  }

  addSubSection('5.5 Inspeção/Palpação:');
  const inspecao = [];
  if (avaliacao.inspecaoNormal) inspecao.push('Normal');
  if (avaliacao.inspecaoEdema) inspecao.push('Edema');
  if (avaliacao.inspecaoCicatrizacaoIncompleta) inspecao.push('Cicatrização incompleta');
  if (avaliacao.inspecaoEritemas) inspecao.push('Eritemas');
  if (avaliacao.inspecaoOutros) inspecao.push(`Outros: ${avaliacao.inspecaoOutrosDescricao}`);
  addText(inspecao.length > 0 ? inspecao.join(', ') : 'Não informado');

  addSubSection('5.6 Semiologia:');
  addText(avaliacao.semiologia);

  addSubSection('5.7 Testes Específicos:');
  addText(avaliacao.testesEspecificos);

  addSubSection('5.8 Avaliação da Dor (0-10):');
  addText(`${avaliacao.avaliacaoDor}/10`, 11, true);

  // Plano Terapêutico
  addSection('6. PLANO TERAPÊUTICO');
  addSubSection('Objetivos do Tratamento:');
  addText(avaliacao.objetivosTratamento);
  addSubSection('Recursos Terapêuticos:');
  addText(avaliacao.recursosTerapeuticos);
  addSubSection('Plano de Tratamento:');
  addText(avaliacao.planoTratamento);

  // Evoluções
  if (avaliacao.evolucoes && avaliacao.evolucoes.length > 0) {
    addSection('7. EVOLUÇÕES');
    avaliacao.evolucoes.forEach((evolucao, index) => {
      addSubSection(`${format(new Date(evolucao.dataEvolucao), 'dd/MM/yyyy', { locale: ptBR })}:`);
      addText(evolucao.evolucao);
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - marginRight, 290, { align: 'right' });
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, marginLeft, 290);
  }

  // Salvar o PDF
  const fileName = `Avaliacao_${cliente.nome.replace(/\s+/g, '_')}_${format(new Date(avaliacao.dataAvaliacao), 'dd-MM-yyyy', { locale: ptBR })}.pdf`;
  doc.save(fileName);
};