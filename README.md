# API Cemitério - Sistema de Gestão de Memorial Digital

## 📋 Visão Geral

O **API Cemitério** é um sistema completo de gestão de memorial digital que permite aos usuários registrar, gerenciar e homenagear entes queridos falecidos. O sistema oferece funcionalidades para criação de memoriais familiares, localização de sepulturas e interação através de comentários e homenagens.

## 🏗️ Arquitetura do Sistema

### Backend (Node.js + Express + MongoDB)
- **API RESTful** desenvolvida em Node.js com Express
- **Banco de dados** MongoDB para persistência
- **Autenticação** JWT (JSON Web Tokens)
- **Upload de imagens** com Multer
- **Criptografia** de senhas com bcrypt

### Frontend (React.js)
- **Interface responsiva** desenvolvida em React
- **Roteamento** com React Router DOM
- **Gerenciamento de estado** com Context API
- **Comunicação** com backend via Axios

## 🚀 Funcionalidades Principais

### 👤 Gestão de Usuários
- **Cadastro de usuários** com validação de dados
- **Login/Logout** com autenticação JWT
- **Perfil do usuário** editável com foto
- **Validação de CPF e e-mail únicos**

### ⚰️ Gestão de Sepultados
- **Cadastro de sepultados** com informações completas
- **Upload múltiplo de imagens** (até 5 fotos)
- **Edição de registros** pelos responsáveis
- **Exclusão de registros** com confirmação
- **Visualização detalhada** de cada sepultado

### 🏛️ Localização no Cemitério
- **Informações de localização**: quadra, rua, chapa
- **Tipo de sepultura** e dados do cemitério
- **Sistema de busca** e navegação

### 💬 Sistema de Comentários
- **Comentários em memoriais** para homenagens
- **Moderação de conteúdo** (funcionalidade preparada)
- **Histórico de mensagens** com data e autor

### 🔐 Segurança
- **Autenticação obrigatória** para operações sensíveis
- **Autorização baseada em proprietário** dos registros
- **Validação de tokens** em todas as rotas protegidas
- **Sanitização de dados** de entrada

## 📁 Estrutura do Projeto

```
apicemiterio/
├── backend/
│   ├── controllers/          # Controladores da API
│   │   ├── UserController.js
│   │   └── SepultadoController.js
│   ├── models/              # Modelos do banco de dados
│   │   ├── User.js
│   │   ├── Sepultado.js
│   │   └── Pet.js (não utilizado)
│   ├── routes/              # Definição das rotas
│   │   ├── UserRoutes.js
│   │   └── SepultadoRoutes.js
│   ├── helpers/             # Funções auxiliares
│   │   ├── create-user-token.js
│   │   ├── get-token-js
│   │   ├── get-user-by-token.js
│   │   ├── verify-token.js
│   │   └── image-upload.js
│   ├── db/                  # Configuração do banco
│   │   └── conn.js
│   ├── public/              # Arquivos estáticos
│   ├── package.json
│   └── index.js             # Arquivo principal
└── frontend/
    ├── src/
    │   ├── components/      # Componentes React
    │   │   ├── layout/      # Componentes de layout
    │   │   ├── form/        # Componentes de formulário
    │   │   └── pages/       # Páginas da aplicação
    │   ├── context/         # Context API
    │   ├── hooks/           # Custom hooks
    │   ├── utils/           # Utilitários
    │   ├── assets/          # Recursos estáticos
    │   └── App.js           # Componente principal
    ├── public/
    └── package.json
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **bcrypt** - Criptografia de senhas
- **Multer** - Upload de arquivos
- **CORS** - Controle de acesso
- **Nodemon** - Desenvolvimento

### Frontend
- **React.js** - Biblioteca de interface
- **React Router DOM** - Roteamento
- **Axios** - Cliente HTTP
- **React Icons** - Ícones
- **CSS Modules** - Estilização

## ⚙️ Configuração e Instalação

### Pré-requisitos
- Node.js (versão 14 ou superior)
- MongoDB (local ou remoto)
- npm ou yarn

### Instalação do Backend

```bash
# Navegar para o diretório do backend
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente (opcional)
# Criar arquivo .env com:
# MONGODB_URI=mongodb://localhost:27017/semit
# JWT_SECRET=nossosecret
# PORT=5000

# Iniciar o servidor
npm start
```

### Instalação do Frontend

```bash
# Navegar para o diretório do frontend
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Criar arquivo .env com:
# REACT_APP_API=http://localhost:5000

# Iniciar a aplicação
npm start
```

## 🔌 API Endpoints

### Autenticação de Usuários
```
POST /users/register     # Cadastro de usuário
POST /users/login        # Login
GET  /users/checkuser    # Verificar usuário logado
GET  /users/:id          # Buscar usuário por ID
PATCH /users/edit/:id    # Editar perfil do usuário
```

### Gestão de Sepultados
```
POST   /sepultados/create              # Criar sepultado
GET    /sepultados                     # Listar todos os sepultados
GET    /sepultados/meussepultados      # Listar sepultados do usuário
GET    /sepultados/:id                 # Buscar sepultado por ID
PATCH  /sepultados/:id                 # Editar sepultado
DELETE /sepultados/:id                 # Excluir sepultado
PATCH  /sepultados/schedule/:id        # Agendar visita
PATCH  /sepultados/conclude/:id        # Concluir adoção
POST   /sepultados/:id/comentario      # Adicionar comentário
```

## 📊 Modelos de Dados

### Usuário (User)
```javascript
{
  name: String,        // Nome completo
  email: String,       // E-mail único
  password: String,    // Senha criptografada
  phone: String,       // Telefone
  cpf: String,         // CPF único
  image: String,       // Foto do perfil
  timestamps: true     // Data de criação/atualização
}
```

### Sepultado
```javascript
{
  nome: String,           // Nome do falecido
  cemiterio: String,      // Nome do cemitério
  chapa: String,          // Número da placa/chapa
  idade: String,          // Idade ao falecer
  dtFal: String,          // Data de falecimento
  dtNasc: String,         // Data de nascimento
  mae: String,            // Nome da mãe
  pai: String,            // Nome do pai
  nacionalidade: String,  // Nacionalidade
  quadra: String,         // Quadra no cemitério
  rua: String,            // Rua no cemitério
  tipoSepultura: String,  // Tipo da sepultura
  epitafio: String,       // Epitáfio/mensagem
  images: [String],       // Array de imagens
  available: Boolean,     // Disponível para adoção
  moderacao: Boolean,     // Em moderação
  comentarios: [{         // Comentários/homenagens
    nome: String,
    mensagem: String,
    data: Date
  }],
  user: {                 // Usuário responsável
    _id: ObjectId,
    name: String,
    image: String,
    phone: String
  },
  adopter: {              // Usuário que adotou (opcional)
    _id: ObjectId,
    name: String,
    image: String
  },
  timestamps: true
}
```

## 🎨 Interface do Usuário

### Páginas Principais
- **Home** - Lista pública de sepultados
- **Login/Registro** - Autenticação de usuários
- **Perfil** - Edição de dados pessoais
- **Memorial Familiar** - Gestão dos próprios sepultados
- **Adicionar Sepultado** - Formulário de cadastro
- **Editar Sepultado** - Formulário de edição
- **Detalhes do Sepultado** - Visualização completa

### Componentes de Layout
- **Navbar** - Navegação principal
- **Footer** - Rodapé da aplicação
- **Container** - Wrapper de conteúdo
- **Message** - Sistema de notificações

## 🔒 Autenticação e Autorização

### Fluxo de Autenticação
1. **Registro**: Usuário cria conta com dados pessoais
2. **Login**: Validação de credenciais e geração de JWT
3. **Token**: Armazenamento no localStorage do navegador
4. **Autorização**: Verificação de token em rotas protegidas

### Middleware de Segurança
- **verifyToken**: Valida JWT em rotas protegidas
- **Autorização por proprietário**: Usuários só editam próprios registros
- **Validação de dados**: Sanitização de entradas

## 📱 Funcionalidades Especiais

### Upload de Imagens
- **Múltiplas imagens** por sepultado (máximo 5)
- **Validação de formato** e tamanho
- **Armazenamento local** no servidor
- **Visualização responsiva** no frontend

### Sistema de Comentários
- **Homenagens públicas** em memoriais
- **Moderação preparada** para controle de conteúdo
- **Histórico completo** com data e autor

### Busca e Localização
- **Informações detalhadas** de localização
- **Sistema de quadras e ruas** do cemitério
- **Identificação por chapa** única

## 🚀 Deploy e Produção

### Configurações Recomendadas
- **Variáveis de ambiente** para configurações sensíveis
- **HTTPS** obrigatório em produção
- **Backup regular** do banco de dados
- **Monitoramento** de logs e performance

### Melhorias Futuras
- **Sistema de busca avançada** com filtros
- **Notificações** por e-mail
- **API de geolocalização** para mapas
- **Sistema de moderação** automatizado
- **Backup em nuvem** para imagens

## 📞 Suporte

Para dúvidas ou suporte técnico, entre em contato:
- **Autor**: saulo.lima
- **Licença**: MIT
- **Versão**: 1.0.0

---

*Este sistema foi desenvolvido para facilitar a gestão e preservação da memória de entes queridos, oferecendo uma plataforma digital moderna e segura para homenagens e localização em cemitérios.*
