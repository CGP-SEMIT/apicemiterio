// Importa o módulo 'express', que é um framework para aplicações web em Node.js
const express = require('express');

// Importa o módulo 'cors' para permitir requisições de origens diferentes (Cross-Origin Resource Sharing)
const cors = require('cors');

// Importa o mongoose para conectar com o MongoDB
const mongoose = require('mongoose');

// Cria uma instância da aplicação Express
const app = express();

// Configura o middleware para que a aplicação aceite requisições com corpo em formato JSON
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Configura o middleware CORS para aceitar requisições da origem 'http://localhost:3000'
// Também permite envio de cookies e headers de autenticação (credentials: true)
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

// Define a pasta 'public' como pública para servir arquivos estáticos (ex: imagens)
app.use(express.static('public'));

// Importa as rotas relacionadas ao usuário do arquivo 'UserRoutes.js'
const UserRoutes = require('./routes/UserRoutes');

const SepultadoRoutes = require('./routes/SepultadoRoutes');

// Usa as rotas importadas a partir do caminho '/users'
app.use('/users', UserRoutes);
app.use('/sepultados', SepultadoRoutes);

// String de conexão MongoDB (troque para a sua)
const mongoURI = 'mongodb://localhost:27017/semit';

// Conecta ao MongoDB e só inicia o servidor após conexão bem-sucedida
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB conectado com sucesso!');
  // Inicia o servidor na porta 5000 e imprime uma mensagem no console ao iniciar
  app.listen(5000, () => {
    console.log('Servidor rodando na porta 5000');
  });
})
.catch((err) => {
  console.error('Erro ao conectar ao MongoDB:', err);
});
