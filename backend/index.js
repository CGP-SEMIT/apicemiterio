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

// Configura o middleware CORS para aceitar requisições de múltiplas origens
// Inclui suporte para Flutter mobile app
app.use(cors({
  credentials: true,
  origin: [
    'http://localhost:3000',           // React frontend
    'http://10.16.51.67:3000',        // React frontend (network)
    'http://localhost:5000',          // Local development
    'http://10.16.51.67:5000',        // Network IP for Flutter
    'http://10.0.2.2:5000',          // Android emulator
    'http://127.0.0.1:5000',         // Alternative localhost
    // Allow any localhost port for development
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/,
    /^http:\/\/10\.0\.2\.2:\d+$/
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
}));

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
  // Inicia o servidor na porta 5000 em todas as interfaces de rede
  app.listen(5000, '0.0.0.0', () => {
    console.log('Servidor rodando na porta 5000');
    console.log('Acessível em:');
    console.log('- http://localhost:5000');
    console.log('- http://127.0.0.1:5000');

    // Mostrar IP da rede local
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    Object.keys(networkInterfaces).forEach(interfaceName => {
      networkInterfaces[interfaceName].forEach(interface => {
        if (interface.family === 'IPv4' && !interface.internal) {
          console.log(`- http://${interface.address}:5000`);
        }
      });
    });
  });
})
.catch((err) => {
  console.error('Erro ao conectar ao MongoDB:', err);
});
