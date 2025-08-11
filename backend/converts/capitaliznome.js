const fs = require('fs');

// Função para capitalizar nomes
function capitalizarNomeCompleto(nome) {
  if (!nome || typeof nome !== 'string') return 'Desconhecido';

  return nome
    .toLowerCase()
    .split(' ')
    .filter(palavra => palavra.trim().length > 0)
    .map(palavra => palavra[0].toUpperCase() + palavra.slice(1))
    .join(' ');
}

// Caminhos dos arquivos
const entrada = './dump_capitalizado.json';
const saida = './sepultados.json';

try {
  const dados = JSON.parse(fs.readFileSync(entrada, 'utf8'));

  const dadosCorrigidos = dados.map(doc => {
    return {
      ...doc,
      nome: capitalizarNomeCompleto(doc.nome),
      pai: capitalizarNomeCompleto(doc.pai),
      mae: capitalizarNomeCompleto(doc.mae),
      cemiterio: capitalizarNomeCompleto(doc.cemiterio),
      rua: capitalizarNomeCompleto(doc.rua),
      quadra: capitalizarNomeCompleto(doc.quadra),
         latitude: capitalizarNomeCompleto(doc.latitude),
         longitude: capitalizarNomeCompleto(doc.longitude),
      
    };
  });

  fs.writeFileSync(saida, JSON.stringify(dadosCorrigidos, null, 2), 'utf8');
  console.log(`✅ Campos nome, pai e mãe foram capitalizados. Arquivo salvo como: ${saida}`);
} catch (err) {
  console.error('❌ Erro ao processar o arquivo:', err.message);
}
