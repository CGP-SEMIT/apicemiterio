# Guia de Instalação - Sistema de Cemitério

## 📋 Pré-requisitos

Antes de iniciar a instalação, certifique-se de ter os seguintes softwares instalados:

### Obrigatórios
- **Node.js** (versão 14.0 ou superior)
  - Download: https://nodejs.org/
  - Verificar instalação: `node --version`
- **npm** (geralmente vem com Node.js)
  - Verificar instalação: `npm --version`
- **MongoDB** (versão 4.0 ou superior)
  - Download: https://www.mongodb.com/try/download/community
  - Ou usar MongoDB Atlas (nuvem)

### Opcionais
- **Git** para clonar o repositório
- **MongoDB Compass** para interface gráfica do banco
- **Postman** para testar a API

## 🚀 Instalação Passo a Passo

### 1. Preparação do Ambiente

#### 1.1 Clonar o Repositório (se aplicável)
```bash
git clone <url-do-repositorio>
cd apicemiterio
```

#### 1.2 Verificar Estrutura do Projeto
```
apicemiterio/
├── backend/
├── frontend/
└── README.md
```

### 2. Configuração do MongoDB

#### 2.1 MongoDB Local
```bash
# Iniciar o serviço MongoDB
# Windows (se instalado como serviço)
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
# ou
brew services start mongodb/brew/mongodb-community

# Verificar se está rodando
mongo --eval "db.adminCommand('ismaster')"
```

#### 2.2 MongoDB Atlas (Nuvem) - Alternativa
1. Criar conta em https://www.mongodb.com/atlas
2. Criar cluster gratuito
3. Configurar usuário e senha
4. Obter string de conexão
5. Adicionar IP à whitelist

### 3. Configuração do Backend

#### 3.1 Navegar para o Diretório
```bash
cd backend
```

#### 3.2 Instalar Dependências
```bash
npm install
```

#### 3.3 Verificar Dependências Instaladas
```bash
npm list --depth=0
```

Dependências esperadas:
- bcrypt@^6.0.0
- cookie-parser@^1.4.7
- cors@^2.8.5
- express@^5.1.0
- jsonwebtoken@^9.0.2
- mongodb@^6.17.0
- mongoose@^8.16.3
- multer@^2.0.1
- nodemon@^3.1.10

#### 3.4 Configurar Variáveis de Ambiente (Opcional)
Criar arquivo `.env` na pasta backend:
```env
# Configurações do Banco de Dados
MONGODB_URI=mongodb://localhost:27017/semit
# Para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/semit

# Configurações de Segurança
JWT_SECRET=nossosecret
# Em produção, use uma chave mais segura:
# JWT_SECRET=sua_chave_super_secreta_aqui

# Configurações do Servidor
PORT=5000
NODE_ENV=development

# Configurações de Upload
UPLOAD_PATH=./public/images
MAX_FILE_SIZE=5242880
```

#### 3.5 Criar Estrutura de Pastas
```bash
# Criar pasta para uploads se não existir
mkdir -p public/images/sepultados
mkdir -p public/images/users
```

#### 3.6 Testar Conexão com Banco
```bash
# Executar teste de conexão
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/semit')
  .then(() => console.log('✅ MongoDB conectado!'))
  .catch(err => console.log('❌ Erro:', err));
"
```

#### 3.7 Iniciar o Servidor Backend
```bash
npm start
```

Saída esperada:
```
[nodemon] starting `node index.js localhost 5000`
MongoDB conectado com sucesso!
Servidor rodando na porta 5000
```

### 4. Configuração do Frontend

#### 4.1 Abrir Novo Terminal
Manter o backend rodando e abrir novo terminal.

#### 4.2 Navegar para o Frontend
```bash
cd frontend
```

#### 4.3 Instalar Dependências
```bash
npm install
```

#### 4.4 Verificar Dependências Instaladas
```bash
npm list --depth=0
```

Dependências esperadas:
- react@^19.1.0
- react-dom@^19.1.0
- react-router-dom@^7.7.0
- axios@^1.11.0
- react-icons@^5.5.0
- react-scripts@5.0.1

#### 4.5 Configurar Variáveis de Ambiente
Criar arquivo `.env` na pasta frontend:
```env
# URL da API Backend
REACT_APP_API=http://localhost:5000

# Outras configurações (se necessário)
REACT_APP_ENV=development
```

#### 4.6 Iniciar o Frontend
```bash
npm start
```

Saída esperada:
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.100:3000
```

### 5. Verificação da Instalação

#### 5.1 Testar Backend
```bash
# Testar endpoint de saúde
curl http://localhost:5000/sepultados
# ou abrir no navegador
```

#### 5.2 Testar Frontend
- Abrir http://localhost:3000 no navegador
- Verificar se a página inicial carrega
- Testar navegação entre páginas

#### 5.3 Testar Integração
1. Acessar página de registro
2. Criar uma conta de teste
3. Fazer login
4. Tentar cadastrar um sepultado

### 6. Configurações Adicionais

#### 6.1 Configurar CORS (se necessário)
No arquivo `backend/index.js`, ajustar configurações de CORS:
```javascript
app.use(cors({ 
  credentials: true, 
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000']
}));
```

#### 6.2 Configurar Proxy (Desenvolvimento)
No `frontend/package.json`, adicionar:
```json
{
  "proxy": "http://localhost:5000"
}
```

#### 6.3 Configurar Uploads
Verificar permissões da pasta de uploads:
```bash
# Linux/Mac
chmod 755 backend/public/images
chmod 755 backend/public/images/sepultados
chmod 755 backend/public/images/users
```

## 🔧 Solução de Problemas

### Problema: MongoDB não conecta
**Soluções:**
1. Verificar se MongoDB está rodando
2. Verificar string de conexão
3. Verificar firewall/antivírus
4. Tentar conexão com MongoDB Compass

### Problema: Erro de dependências
**Soluções:**
```bash
# Limpar cache do npm
npm cache clean --force

# Deletar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Problema: Porta já em uso
**Soluções:**
```bash
# Verificar processos na porta
# Windows
netstat -ano | findstr :5000
# Linux/Mac
lsof -i :5000

# Matar processo (substitua PID)
# Windows
taskkill /PID <PID> /F
# Linux/Mac
kill -9 <PID>
```

### Problema: CORS Error
**Soluções:**
1. Verificar configuração de CORS no backend
2. Verificar URL da API no frontend
3. Usar extensão CORS no navegador (desenvolvimento)

### Problema: Upload de imagens falha
**Soluções:**
1. Verificar permissões da pasta
2. Verificar tamanho do arquivo
3. Verificar formato do arquivo
4. Verificar configuração do Multer

## 📝 Scripts Úteis

### Backend
```bash
npm start          # Iniciar com nodemon
npm run dev        # Modo desenvolvimento (se configurado)
npm test           # Executar testes (se configurado)
```

### Frontend
```bash
npm start          # Iniciar desenvolvimento
npm run build      # Build para produção
npm test           # Executar testes
npm run eject      # Ejetar configurações (cuidado!)
```

## 🔒 Configurações de Segurança

### Desenvolvimento
- Usar JWT_SECRET simples
- CORS liberado para localhost
- Logs detalhados habilitados

### Produção
- JWT_SECRET complexo e único
- CORS restrito a domínios específicos
- Logs de erro apenas
- HTTPS obrigatório
- Variáveis de ambiente seguras

## 📚 Próximos Passos

Após a instalação bem-sucedida:

1. **Ler a documentação da API** (`docs/API_DOCUMENTATION.md`)
2. **Configurar ambiente de produção** (se aplicável)
3. **Implementar testes** automatizados
4. **Configurar CI/CD** (se aplicável)
5. **Fazer backup** do banco de dados
6. **Monitorar logs** e performance

## 🆘 Suporte

Se encontrar problemas durante a instalação:

1. Verificar logs de erro detalhadamente
2. Consultar documentação das dependências
3. Verificar issues no repositório
4. Contatar o desenvolvedor: saulo.lima

---

**Instalação concluída com sucesso!** 🎉

O sistema deve estar rodando em:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017/semit
