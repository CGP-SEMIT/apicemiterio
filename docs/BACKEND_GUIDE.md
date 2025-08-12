# Guia do Backend - Sistema de Cemitério

## 🏗️ Arquitetura

O backend é uma API RESTful construída com Node.js e Express, seguindo o padrão MVC (Model-View-Controller) e utilizando MongoDB como banco de dados.

### Estrutura de Pastas
```
backend/
├── controllers/         # Lógica de negócio
│   ├── UserController.js
│   └── SepultadoController.js
├── models/             # Modelos do banco de dados
│   ├── User.js
│   ├── Sepultado.js
│   └── Pet.js (não utilizado)
├── routes/             # Definição das rotas
│   ├── UserRoutes.js
│   └── SepultadoRoutes.js
├── helpers/            # Funções auxiliares
│   ├── create-user-token.js
│   ├── get-token-js
│   ├── get-user-by-token.js
│   ├── verify-token.js
│   └── image-upload.js
├── db/                 # Configuração do banco
│   └── conn.js
├── public/             # Arquivos estáticos
│   └── images/
│       ├── sepultados/
│       └── users/
├── package.json
└── index.js            # Arquivo principal
```

## 🚀 Configuração Inicial

### index.js
Arquivo principal que configura o servidor Express:

```javascript
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Configuração de middlewares
app.use(express.json());
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.static('public'));

// Importação das rotas
const UserRoutes = require('./routes/UserRoutes');
const SepultadoRoutes = require('./routes/SepultadoRoutes');

// Uso das rotas
app.use('/users', UserRoutes);
app.use('/sepultados', SepultadoRoutes);

// Conexão com MongoDB
const mongoURI = 'mongodb://localhost:27017/semit';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB conectado com sucesso!');
  app.listen(5000, () => {
    console.log('Servidor rodando na porta 5000');
  });
})
.catch((err) => {
  console.error('Erro ao conectar ao MongoDB:', err);
});
```

## 🗄️ Modelos de Dados

### User.js
Modelo para usuários do sistema:

```javascript
const mongoose = require('../db/conn');
const { Schema } = mongoose;

const User = mongoose.model(
  'User',
  new Schema({
    name: {
      type: String,
      required: true
    }, 
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    image: {
      type: String,
    },
    phone: {
      type: String,
      required: true
    },
    cpf: {
      type: String,
      required: true,
      unique: true
    },
  }, { timestamps: true })
);

module.exports = User;
```

### Sepultado.js
Modelo para registros de sepultados:

```javascript
const mongoose = require('../db/conn');
const { Schema } = mongoose;

const Sepultado = mongoose.model(
  'Sepultado',
  new Schema({
    nome: {
      type: String,
      required: true
    },
    cemiterio: {
      type: String,
      required: false
    },
    chapa: {
      type: String,
      required: true
    },
    idade: {
      type: String,
    },
    dtFal: {
      type: String,
      required: true
    },
    dtNasc: {
      type: String,
      required: true
    },
    mae: {
      type: String,
      required: true
    },
    nacionalidade: {
      type: String,
      required: true
    },
    pai: {
      type: String,
      required: true
    },
    moderacao: {
      type: Boolean,
    },
    quadra: {
      type: String,
      required: true
    },
    tipoSepultura: {
      type: String,
      required: false
    },
    rua: {
      type: String,
      required: true
    },
    epitafio: {
      type: String,
      required: false,
      trim: true,
    },
    comentarios: [{
      nome: {
        type: String,
        required: true,
        trim: true
      },
      mensagem: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
      },
      data: {
        type: Date,
        default: Date.now
      }
    }],
    available: {
      type: Boolean
    },
    images: {
      type: [String],
      required: false
    },
    user: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      image: {
        type: String
      },
      phone: {
        type: String
      }
    },
    adopter: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      name: {
        type: String
      },
      image: {
        type: String
      }
    }
  }, { timestamps: true })
);

module.exports = Sepultado;
```

## 🛣️ Sistema de Rotas

### UserRoutes.js
Rotas para gerenciamento de usuários:

```javascript
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

// Middlewares
const verifyToken = require('../helpers/verify-token');
const { imageUpload } = require("../helpers/image-upload");

// Rotas públicas
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/checkuser', UserController.checkUser);
router.get('/:id', UserController.getUserById);

// Rotas protegidas
router.patch('/edit/:id', verifyToken, imageUpload.single("image"), UserController.editUser);

module.exports = router;
```

### SepultadoRoutes.js
Rotas para gerenciamento de sepultados:

```javascript
const express = require('express');
const router = express.Router();
const SepultadoController = require('../controllers/SepultadoController');

// Middlewares
const verifyToken = require('../helpers/verify-token');
const { imageUpload } = require("../helpers/image-upload");

// Rotas públicas
router.get('/', SepultadoController.getAll);
router.get('/:id', SepultadoController.getSepById);

// Rotas protegidas
router.post('/create', verifyToken, imageUpload.fields([{ name: 'images', maxCount: 5 }]), SepultadoController.createSepultado);
router.get('/meussepultados', verifyToken, SepultadoController.getAllUserSepultados);
router.delete('/:id', verifyToken, SepultadoController.removeSepById);
router.patch('/:id', verifyToken, imageUpload.array('images'), SepultadoController.updateSep);
router.patch('/schedule/:id', verifyToken, SepultadoController.schedule);
router.patch('/conclude/:id', verifyToken, SepultadoController.concludeAdoption);
router.post('/:id/comentario', verifyToken, SepultadoController.adicionarComentario);

module.exports = router;
```

## 🎛️ Controladores

### UserController.js
Lógica de negócio para usuários:

```javascript
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helpers
const createUserToken = require('../helpers/create-user-token');
const getToken = require('../helpers/get-token-js'); 
const getUserByToken = require('../helpers/get-user-by-token');

module.exports = class UserController {
  
  // Registro de usuário
  static async register(req, res) {
    const { name, email, phone, password, confirmpassword, cpf } = req.body;

    // Validações
    if (!name) {
      return res.status(422).json({ message: 'O nome é obrigatório' });
    }
    if (!email) {
      return res.status(422).json({ message: 'O e-mail é obrigatório' });
    }
    if (!phone) {
      return res.status(422).json({ message: 'O telefone é obrigatório' });
    }
    if (!password) {
      return res.status(422).json({ message: 'A senha é obrigatória' });
    }
    if (!confirmpassword) {
      return res.status(422).json({ message: 'A confirmação de senha é obrigatória' });
    }
    if (password !== confirmpassword) {
      return res.status(422).json({ message: 'A senha e a confirmação precisam ser iguais' });
    }
    if (!cpf) {
      return res.status(422).json({ message: 'O CPF é obrigatório' });
    }

    // Verificar se usuário existe
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      return res.status(422).json({ message: 'E-mail em uso, digite outro e-mail' });
    }

    // Criptografar senha
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Criar usuário
    const user = new User({
      name: name,
      cpf: cpf,
      email: email,
      phone: phone,
      password: passwordHash
    });

    try {
      const newUser = await user.save();
      await createUserToken(newUser, req, res);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  // Login de usuário
  static async login(req, res) {
    const { email, password } = req.body;

    // Validações
    if (!email) {
      return res.status(422).json({ message: 'O e-mail é obrigatório' });
    }
    if (!password) {
      return res.status(422).json({ message: 'A senha é obrigatória' });
    }

    // Verificar se usuário existe
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(422).json({ message: 'Não há usuário cadastrado com este e-mail' });
    }

    // Verificar senha
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(422).json({ message: 'A senha é inválida!' });
    }

    await createUserToken(user, req, res);
  }

  // Verificar usuário logado
  static async checkUser(req, res) {
    let currentUser;

    if (req.headers.authorization) {
      const token = getToken(req);
      
      if (!token) {
        return res.status(401).json({ message: 'Token inválido ou mal formatado' });
      }

      const decoded = jwt.verify(token, 'nossosecret');
      currentUser = await User.findById(decoded.id);
      currentUser.password = undefined;
    } else {
      currentUser = null;
    }

    res.status(200).json(currentUser);
  }

  // Buscar usuário por ID
  static async getUserById(req, res) {
    const id = req.params.id;

    const user = await User.findById(id);
    if (!user) {
      return res.status(422).json({ message: 'Usuário não encontrado!' });
    }

    user.password = undefined;
    res.status(200).json({ user });
  }

  // Editar usuário
  static async editUser(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);
    
    const { name, email, phone, password, confirmpassword } = req.body;

    if (req.file) {
      user.image = req.file.filename;
    }

    // Validações e atualizações
    if (!name) {
      return res.status(422).json({ message: 'O nome é obrigatório' });
    }
    user.name = name;

    if (!email) {
      return res.status(422).json({ message: 'O e-mail é obrigatório' });
    }

    const userExists = await User.findOne({ email: email });
    if (user.email !== email && userExists) {
      return res.status(422).json({ message: 'E-mail já está em uso' });
    }
    user.email = email;

    if (!phone) {
      return res.status(422).json({ message: 'O telefone é obrigatório' });
    }
    user.phone = phone;

    if (password) {
      if (password !== confirmpassword) {
        return res.status(422).json({ message: 'As senhas não conferem' });
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);
      user.password = passwordHash;
    }

    try {
      await User.findOneAndUpdate(
        { _id: user._id },
        { $set: user },
        { new: true }
      );
      res.status(200).json({ message: 'Usuário atualizado com sucesso!' });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  }
}
```

## 🔐 Sistema de Autenticação

### create-user-token.js
Criação de tokens JWT:

```javascript
const jwt = require("jsonwebtoken");

const createUserToken = async(user, req, res) => {
  // Criar token
  const token = jwt.sign({
    name: user.name,
    id: user._id
  }, "nossosecret");

  // Retornar token
  res.status(200).json({
    message: 'Você está autenticado',
    token: token,
    userId: user._id,
  });
}

module.exports = createUserToken;
```

### verify-token.js
Middleware de verificação de token:

```javascript
const jwt = require('jsonwebtoken');
const getToken = require('./get-token-js');

const checkToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Acesso Negado!' });
  }

  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Acesso Negado!' });
  }

  try {
    const verified = jwt.verify(token, 'nossosecret');
    req.user = verified;
    next();
  } catch (err) {
    return res.status(400).json({ message: 'Token Inválido!' });
  }
}

module.exports = checkToken;
```

### get-token-js
Extração de token do header:

```javascript
const getToken = (req) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  return token;
};

module.exports = getToken;
```

### get-user-by-token.js
Buscar usuário pelo token:

```javascript
const jwt = require('jsonwebtoken');
const User = require("../models/User");

const getUserByToken = async(token) => {
  if (!token) {
    return res.status(401).json({ message: 'Acesso Negado!' });
  }

  const decoded = jwt.verify(token, 'nossosecret');
  const userId = decoded.id;
  const user = await User.findOne({ _id: userId });

  return user;
}

module.exports = getUserByToken;
```

## 📁 Upload de Arquivos

### image-upload.js
Configuração do Multer para upload de imagens:

```javascript
const multer = require("multer");
const path = require("path");

// Configuração de armazenamento
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = "";

    if (req.baseUrl.includes("users")) {
      folder = "users";
    } else if (req.baseUrl.includes("sepultados")) {
      folder = "sepultados";
    }

    cb(null, `public/images/${folder}/`);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + String(Math.floor(Math.random() * 1000)) + path.extname(file.originalname));
  },
});

const imageUpload = multer({
  storage: imageStorage,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error("Por favor, envie apenas jpg, jpeg ou png!"));
    }
    cb(undefined, true);
  },
});

module.exports = { imageUpload };
```

## 🗃️ Conexão com Banco de Dados

### conn.js
Configuração da conexão MongoDB:

```javascript
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb://localhost:27017/semit');
  console.log("Conectou ao Mongoose!");
}

main().catch((err) => console.log(err));

module.exports = mongoose;
```

## 🔧 Middlewares Personalizados

### Middleware de Logs
```javascript
const logMiddleware = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};
```

### Middleware de Validação
```javascript
const validateSepultado = (req, res, next) => {
  const { nome, chapa, dtFal, dtNasc } = req.body;
  
  if (!nome || !chapa || !dtFal || !dtNasc) {
    return res.status(422).json({ 
      message: 'Campos obrigatórios: nome, chapa, dtFal, dtNasc' 
    });
  }
  
  next();
};
```

## 🛡️ Segurança

### Configurações de Segurança
```javascript
// Helmet para headers de segurança
const helmet = require('helmet');
app.use(helmet());

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
});
app.use(limiter);

// Sanitização de dados
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());
```

### Validação de Dados
```javascript
const validator = require('validator');

// Validar e-mail
if (!validator.isEmail(email)) {
  return res.status(422).json({ message: 'E-mail inválido' });
}

// Validar CPF (implementar função personalizada)
if (!isValidCPF(cpf)) {
  return res.status(422).json({ message: 'CPF inválido' });
}
```

## 📊 Monitoramento e Logs

### Sistema de Logs
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## 🚀 Otimizações

### Cache com Redis
```javascript
const redis = require('redis');
const client = redis.createClient();

// Cache de consultas frequentes
const getCachedSepultados = async () => {
  const cached = await client.get('sepultados');
  if (cached) {
    return JSON.parse(cached);
  }
  
  const sepultados = await Sepultado.find();
  await client.setex('sepultados', 300, JSON.stringify(sepultados)); // 5 min
  return sepultados;
};
```

### Paginação
```javascript
static async getAll(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const sepultados = await Sepultado.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await Sepultado.countDocuments();
    
    res.status(200).json({
      sepultados,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
```

---

Este guia fornece uma visão completa da arquitetura e implementação do backend. Para implementações específicas ou dúvidas técnicas, consulte a documentação das tecnologias utilizadas ou entre em contato com a equipe de desenvolvimento.
