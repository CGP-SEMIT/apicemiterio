# Guia de Deploy - Sistema de Cemitério

## 🚀 Visão Geral

Este guia aborda diferentes estratégias de deploy para o sistema de cemitério, desde ambientes de desenvolvimento até produção completa com alta disponibilidade.

## 🏗️ Arquiteturas de Deploy

### Desenvolvimento Local
```
Frontend (React) → Backend (Node.js) → MongoDB (Local)
     :3000              :5000           :27017
```

### Produção Simples
```
Frontend (Static) → Backend (Node.js) → MongoDB (Cloud)
   (Netlify/Vercel)    (Heroku/Railway)   (MongoDB Atlas)
```

### Produção Avançada
```
CDN → Load Balancer → Frontend → API Gateway → Backend Cluster → Database Cluster
                                                     ↓
                                              File Storage (AWS S3)
```

## 🌐 Deploy do Frontend

### 1. Netlify (Recomendado para iniciantes)

#### Preparação
```bash
# Build de produção
cd frontend
npm run build

# Criar arquivo _redirects para SPA
echo "/*    /index.html   200" > build/_redirects
```

#### Deploy Manual
1. Acesse https://netlify.com
2. Arraste a pasta `build` para o deploy
3. Configure variáveis de ambiente:
   - `REACT_APP_API=https://sua-api.herokuapp.com`

#### Deploy Automático (Git)
```yaml
# netlify.toml
[build]
  base = "frontend/"
  publish = "build/"
  command = "npm run build"

[build.environment]
  REACT_APP_API = "https://sua-api.herokuapp.com"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. Vercel

#### Deploy via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Configurar variáveis
vercel env add REACT_APP_API production
```

#### Configuração (vercel.json)
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 3. AWS S3 + CloudFront

#### Configuração S3
```bash
# Criar bucket
aws s3 mb s3://cemiterio-frontend

# Upload dos arquivos
aws s3 sync build/ s3://cemiterio-frontend --delete

# Configurar website
aws s3 website s3://cemiterio-frontend --index-document index.html --error-document index.html
```

#### CloudFront Distribution
```json
{
  "Origins": [{
    "DomainName": "cemiterio-frontend.s3.amazonaws.com",
    "Id": "S3-cemiterio-frontend",
    "S3OriginConfig": {
      "OriginAccessIdentity": ""
    }
  }],
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-cemiterio-frontend",
    "ViewerProtocolPolicy": "redirect-to-https"
  }
}
```

## 🖥️ Deploy do Backend

### 1. Heroku (Simples e rápido)

#### Preparação
```bash
# Instalar Heroku CLI
# Criar Procfile
echo "web: node index.js" > Procfile

# Configurar package.json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

#### Deploy
```bash
# Login e criar app
heroku login
heroku create cemiterio-api

# Configurar variáveis
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=sua_chave_super_secreta
heroku config:set MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/semit

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### Configuração de CORS
```javascript
// Atualizar CORS para produção
app.use(cors({ 
  credentials: true, 
  origin: [
    'http://localhost:3000',
    'https://seu-frontend.netlify.app'
  ]
}));
```

### 2. Railway

#### Deploy via CLI
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login e deploy
railway login
railway init
railway up
```

#### Configuração (railway.json)
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/sepultados"
  }
}
```

### 3. DigitalOcean App Platform

#### Configuração (.do/app.yaml)
```yaml
name: cemiterio-api
services:
- name: api
  source_dir: /
  github:
    repo: seu-usuario/cemiterio-api
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET
    value: sua_chave_secreta
    type: SECRET
  - key: MONGODB_URI
    value: sua_string_mongodb
    type: SECRET
```

### 4. AWS EC2 (Controle total)

#### Configuração do Servidor
```bash
# Conectar via SSH
ssh -i sua-chave.pem ubuntu@ip-do-servidor

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Clonar repositório
git clone https://github.com/seu-usuario/cemiterio-api.git
cd cemiterio-api/backend
npm install
```

#### Configuração PM2
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'cemiterio-api',
    script: 'index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      JWT_SECRET: 'sua_chave_secreta',
      MONGODB_URI: 'sua_string_mongodb'
    }
  }]
};
```

```bash
# Iniciar aplicação
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### Nginx como Proxy Reverso
```nginx
# /etc/nginx/sites-available/cemiterio-api
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /images/ {
        alias /home/ubuntu/cemiterio-api/backend/public/images/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/cemiterio-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🗄️ Deploy do Banco de Dados

### 1. MongoDB Atlas (Recomendado)

#### Configuração
1. Criar conta em https://www.mongodb.com/atlas
2. Criar cluster gratuito
3. Configurar usuário e senha
4. Adicionar IPs à whitelist (0.0.0.0/0 para produção)
5. Obter string de conexão

#### String de Conexão
```
mongodb+srv://usuario:senha@cluster.mongodb.net/semit?retryWrites=true&w=majority
```

### 2. MongoDB em VPS

#### Instalação (Ubuntu)
```bash
# Importar chave pública
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Adicionar repositório
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Instalar
sudo apt-get update
sudo apt-get install -y mongodb-org

# Iniciar serviço
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Configuração de Segurança
```javascript
// Conectar ao MongoDB
mongo

// Criar usuário admin
use admin
db.createUser({
  user: "admin",
  pwd: "senha_super_segura",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

// Criar usuário para aplicação
use semit
db.createUser({
  user: "cemiterio_user",
  pwd: "senha_da_aplicacao",
  roles: ["readWrite"]
})
```

```yaml
# /etc/mongod.conf
security:
  authorization: enabled

net:
  bindIp: 127.0.0.1,IP_DO_SERVIDOR
```

## 🔒 HTTPS e Certificados SSL

### 1. Let's Encrypt (Gratuito)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d api.seudominio.com

# Renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Cloudflare (Proxy + SSL)

#### Configuração DNS
```
Tipo: A
Nome: api
Conteúdo: IP_DO_SERVIDOR
Proxy: Ativado (nuvem laranja)
```

#### Configuração SSL
- SSL/TLS → Overview → Full (strict)
- SSL/TLS → Edge Certificates → Always Use HTTPS: On

## 🔧 Variáveis de Ambiente

### Backend (.env)
```env
# Ambiente
NODE_ENV=production
PORT=5000

# Banco de dados
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/semit

# Segurança
JWT_SECRET=chave_super_secreta_com_pelo_menos_32_caracteres
BCRYPT_ROUNDS=12

# Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./public/images

# CORS
ALLOWED_ORIGINS=https://seudominio.com,https://www.seudominio.com

# Logs
LOG_LEVEL=error
```

### Frontend (.env.production)
```env
REACT_APP_API=https://api.seudominio.com
REACT_APP_ENV=production
GENERATE_SOURCEMAP=false
```

## 📊 Monitoramento e Logs

### 1. PM2 Monitoring
```bash
# Instalar PM2 Plus
pm2 install pm2-server-monit

# Conectar ao dashboard
pm2 plus
```

### 2. Winston Logs
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 3. Health Check
```javascript
// Endpoint de saúde
app.get('/health', async (req, res) => {
  try {
    // Verificar conexão com banco
    await mongoose.connection.db.admin().ping();
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: error.message
    });
  }
});
```

## 🔄 CI/CD com GitHub Actions

### Deploy Automático
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
        
    - name: Build
      run: |
        cd frontend
        npm run build
      env:
        REACT_APP_API: ${{ secrets.REACT_APP_API }}
        
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v1.2
      with:
        publish-dir: './frontend/build'
        production-branch: main
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: "cemiterio-api"
        heroku_email: "seu-email@example.com"
        appdir: "backend"
```

## 🛡️ Segurança em Produção

### 1. Configurações de Segurança
```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Headers de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Muitas tentativas, tente novamente em 15 minutos'
});
app.use('/users/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5 // máximo 5 tentativas de login por IP
}));
```

### 2. Backup Automático
```bash
#!/bin/bash
# backup-mongodb.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
DB_NAME="semit"

# Criar backup
mongodump --uri="$MONGODB_URI" --db=$DB_NAME --out=$BACKUP_DIR/$DATE

# Comprimir
tar -czf $BACKUP_DIR/$DATE.tar.gz -C $BACKUP_DIR $DATE
rm -rf $BACKUP_DIR/$DATE

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

# Upload para S3 (opcional)
aws s3 cp $BACKUP_DIR/$DATE.tar.gz s3://cemiterio-backups/
```

```bash
# Adicionar ao crontab
0 2 * * * /home/ubuntu/scripts/backup-mongodb.sh
```

## 📈 Otimizações de Performance

### 1. Compressão
```javascript
const compression = require('compression');
app.use(compression());
```

### 2. Cache de Imagens
```nginx
location /images/ {
    alias /home/ubuntu/cemiterio-api/backend/public/images/;
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary Accept-Encoding;
    
    # Compressão
    gzip on;
    gzip_types image/jpeg image/png;
}
```

### 3. CDN para Imagens
```javascript
// Configurar AWS S3 para imagens
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const uploadToS3 = (file) => {
  return s3.upload({
    Bucket: 'cemiterio-images',
    Key: `sepultados/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  }).promise();
};
```

---

Este guia fornece uma base sólida para deploy em diferentes ambientes. Escolha a estratégia que melhor se adequa às suas necessidades e orçamento. Para ambientes de produção críticos, considere implementar todas as práticas de segurança e monitoramento mencionadas.
