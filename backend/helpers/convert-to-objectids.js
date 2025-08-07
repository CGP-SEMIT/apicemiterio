const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');

async function converterParaObjectIds() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('semit');
    const sepultados = db.collection('sepultados');
    
    // Verificar estado atual
    const totalDocs = await sepultados.countDocuments();
    const stringIds = await sepultados.countDocuments({ _id: { $type: "string" } });
    const objectIds = await sepultados.countDocuments({ _id: { $type: "objectId" } });
    
    console.log(`\n📊 Estado atual:`);
    console.log(`  Total de documentos: ${totalDocs}`);
    console.log(`  IDs String: ${stringIds}`);
    console.log(`  ObjectIds: ${objectIds}`);
    
    if (stringIds === 0) {
      console.log('✅ Todos os documentos já têm ObjectIds!');
      return;
    }
    
    console.log(`\n🔄 Iniciando conversão de ${stringIds} documentos...`);
    
    // Criar backup antes de começar
    const backupName = `sepultados_backup_${Date.now()}`;
    console.log(`💾 Criando backup: ${backupName}`);
    
    await sepultados.aggregate([
      { $out: backupName }
    ]).toArray();
    
    console.log('✅ Backup criado com sucesso');
    
    // Buscar todos os documentos com IDs string
    const docsComStringId = await sepultados.find({ 
      _id: { $type: "string" } 
    }).toArray();
    
    console.log(`📦 Encontrados ${docsComStringId.length} documentos para converter`);
    
    if (docsComStringId.length === 0) {
      console.log('Nenhum documento para converter.');
      return;
    }
    
    // Preparar novos documentos
    const novosDocumentos = [];
    const mapeamentoIds = {};
    
    console.log('🏭 Preparando novos documentos...');
    
    docsComStringId.forEach((doc, index) => {
      const idOriginal = doc._id;
      const novoObjectId = new ObjectId();
      
      // Salvar mapeamento
      mapeamentoIds[idOriginal] = novoObjectId.toString();
      
      // Criar novo documento com ObjectId
      const novoDoc = {
        ...doc,
        _id: novoObjectId,
        originalId: idOriginal  // Preservar ID original
      };
      
      novosDocumentos.push(novoDoc);
      
      if ((index + 1) % 1000 === 0) {
        console.log(`  Preparados: ${index + 1}/${docsComStringId.length}`);
      }
    });
    
    console.log(`✅ Todos os ${novosDocumentos.length} documentos preparados`);
    
    // Limpar coleção atual
    console.log('🗑️ Removendo documentos antigos...');
    await sepultados.deleteMany({});
    
    // Inserir novos documentos em lotes
    console.log('📥 Inserindo documentos com ObjectIds...');
    
    const tamanhoPacote = 1000;
    let inseridos = 0;
    
    for (let i = 0; i < novosDocumentos.length; i += tamanhoPacote) {
      const pacote = novosDocumentos.slice(i, i + tamanhoPacote);
      
      try {
        await sepultados.insertMany(pacote, { ordered: false });
        inseridos += pacote.length;
        console.log(`  Inseridos: ${inseridos}/${novosDocumentos.length}`);
      } catch (error) {
        console.error(`❌ Erro ao inserir pacote ${Math.floor(i/tamanhoPacote) + 1}:`, error.message);
      }
    }
    
    // Salvar mapeamento de IDs
    fs.writeFileSync('mapeamento-ids-final.json', JSON.stringify(mapeamentoIds, null, 2));
    console.log('💾 Mapeamento de IDs salvo em: mapeamento-ids-final.json');
    
    // Verificação final
    console.log('\n🔍 Verificação final...');
    
    const totalFinal = await sepultados.countDocuments();
    const stringIdsFinal = await sepultados.countDocuments({ _id: { $type: "string" } });
    const objectIdsFinal = await sepultados.countDocuments({ _id: { $type: "objectId" } });
    const comOriginalId = await sepultados.countDocuments({ originalId: { $exists: true } });
    
    console.log(`\n📊 Resultado final:`);
    console.log(`  Total de documentos: ${totalFinal}`);
    console.log(`  IDs String: ${stringIdsFinal} ${stringIdsFinal === 0 ? '✅' : '❌'}`);
    console.log(`  ObjectIds: ${objectIdsFinal} ${objectIdsFinal === totalFinal ? '✅' : '❌'}`);
    console.log(`  Com originalId: ${comOriginalId} ${comOriginalId === totalFinal ? '✅' : '⚠️'}`);
    
    if (objectIdsFinal === totalFinal && stringIdsFinal === 0) {
      console.log('\n🎉 CONVERSÃO REALIZADA COM SUCESSO!');
      console.log('📋 Todos os documentos agora têm ObjectIds do MongoDB');
      console.log('🔄 IDs originais preservados no campo "originalId"');
    } else {
      console.log('\n❌ ALGO DEU ERRADO NA CONVERSÃO');
      console.log(`💾 Backup disponível: ${backupName}`);
    }
    
    // Mostrar exemplo de documento convertido
    const exemploConvertido = await sepultados.findOne({});
    if (exemploConvertido) {
      console.log('\n📄 Exemplo de documento convertido:');
      console.log(`  _id: ${exemploConvertido._id} (${typeof exemploConvertido._id})`);
      console.log(`  originalId: ${exemploConvertido.originalId}`);
      console.log(`  nome: ${exemploConvertido.nome || 'N/A'}`);
    }
    
  } catch (error) {
    console.error('❌ Erro durante a conversão:', error);
    console.log('\n🛑 Em caso de erro, restaure do backup mais recente');
  } finally {
    await client.close();
    console.log('\n🔌 Conexão fechada');
  }
}

// Função para restaurar do backup
async function restaurarDoBackup(nomeBackup = null) {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('semit');
    
    // Se não especificou backup, usar o mais recente
    if (!nomeBackup) {
      const collections = await db.listCollections().toArray();
      const backups = collections
        .filter(col => col.name.includes('sepultados'))
        .sort((a, b) => b.name.localeCompare(a.name)); // Ordenar por data (mais recente primeiro)
      
      if (backups.length === 0) {
        console.log('❌ Nenhum backup encontrado!');
        return;
      }
      
      nomeBackup = backups[0].name;
      console.log(`🔄 Usando backup mais recente: ${nomeBackup}`);
    }
    
    const backupCollection = db.collection(nomeBackup);
    const sepultados = db.collection('sepultados');
    
    const docsBackup = await backupCollection.find({}).toArray();
    
    if (docsBackup.length === 0) {
      console.log('❌ Backup está vazio!');
      return;
    }
    
    console.log(`📦 Restaurando ${docsBackup.length} documentos...`);
    
    // Limpar coleção atual
    await sepultados.deleteMany({});
    
    // Restaurar documentos do backup
    await sepultados.insertMany(docsBackup);
    
    console.log('✅ Restauração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao restaurar:', error);
  } finally {
    await client.close();
  }
}

// Execução baseada em argumentos
const comando = process.argv[2];
const argumento = process.argv[3];

if (comando === 'restaurar') {
  console.log('🔄 Restaurando do backup...');
  restaurarDoBackup(argumento).catch(console.error);
} else {
  console.log('🚀 Iniciando conversão definitiva para ObjectIds...');
  console.log('⚠️ Esta operação irá substituir todos os IDs por ObjectIds');
  converterParaObjectIds().catch(console.error);
}

console.log('\n💡 Comandos disponíveis:');
console.log('  node script.js                    - Converter para ObjectIds');
console.log('  node script.js restaurar          - Restaurar do backup mais recente');
console.log('  node script.js restaurar [nome]   - Restaurar de backup específico');