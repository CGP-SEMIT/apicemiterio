# Guia de Contribuição - Sistema de Cemitério

## 🤝 Como Contribuir

Agradecemos seu interesse em contribuir para o Sistema de Cemitério! Este guia fornece todas as informações necessárias para contribuir de forma efetiva.

## 📋 Tipos de Contribuição

### 🐛 Reportar Bugs
- Verificar se o bug já foi reportado nas [Issues](../../issues)
- Criar nova issue com template de bug report
- Incluir informações detalhadas sobre reprodução

### 💡 Sugerir Melhorias
- Verificar se a sugestão já existe
- Criar issue com template de feature request
- Descrever claramente o problema e solução proposta

### 🔧 Contribuir com Código
- Fork do repositório
- Criar branch para sua feature/correção
- Seguir padrões de código estabelecidos
- Submeter Pull Request

### 📚 Melhorar Documentação
- Corrigir erros de digitação
- Adicionar exemplos
- Traduzir documentação
- Melhorar clareza das explicações

## 🚀 Configuração do Ambiente de Desenvolvimento

### Pré-requisitos
- Node.js 18+ 
- MongoDB 4.4+
- Git
- Editor de código (VS Code recomendado)

### Configuração Inicial
```bash
# 1. Fork e clone o repositório
git clone https://github.com/SEU_USUARIO/apicemiterio.git
cd apicemiterio

# 2. Configurar upstream
git remote add upstream https://github.com/USUARIO_ORIGINAL/apicemiterio.git

# 3. Instalar dependências do backend
cd backend
npm install

# 4. Instalar dependências do frontend
cd ../frontend
npm install

# 5. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# 6. Iniciar MongoDB
# Windows: net start MongoDB
# Linux/Mac: sudo systemctl start mongod

# 7. Iniciar backend (terminal 1)
cd backend
npm start

# 8. Iniciar frontend (terminal 2)
cd frontend
npm start
```

## 📝 Padrões de Código

### JavaScript/Node.js
```javascript
// ✅ Bom
const getUserById = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    return user;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    throw error;
  }
};

// ❌ Evitar
function getUserById(id, callback) {
  User.findById(id, function(err, user) {
    if (err) return callback(err);
    callback(null, user);
  });
}
```

### React/JSX
```jsx
// ✅ Bom
const UserProfile = ({ user }) => {
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = useCallback(async (data) => {
    setLoading(true);
    try {
      await updateUser(data);
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className={styles.profile}>
      <h1>{user.name}</h1>
      {/* Componente JSX */}
    </div>
  );
};

// ❌ Evitar
function UserProfile(props) {
  return <div>
    <h1>{props.user.name}</h1>
  </div>;
}
```

### CSS
```css
/* ✅ Bom - BEM Methodology */
.user-profile {
  padding: 1rem;
  border-radius: 8px;
}

.user-profile__header {
  margin-bottom: 1rem;
}

.user-profile__name {
  font-size: 1.5rem;
  font-weight: bold;
}

.user-profile--loading {
  opacity: 0.5;
}

/* ❌ Evitar */
.userProfile {
  padding: 16px;
}

.header {
  margin-bottom: 16px;
}
```

## 🌿 Fluxo de Trabalho Git

### Branches
```bash
# Branch principal
main                    # Código em produção

# Branches de desenvolvimento
develop                 # Integração de features
feature/nome-da-feature # Nova funcionalidade
bugfix/nome-do-bug     # Correção de bug
hotfix/nome-do-hotfix  # Correção urgente
```

### Commits
Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato
<tipo>[escopo opcional]: <descrição>

# Exemplos
feat(auth): adicionar autenticação com JWT
fix(api): corrigir validação de CPF
docs(readme): atualizar instruções de instalação
style(css): ajustar espaçamento do formulário
refactor(controller): simplificar lógica de validação
test(user): adicionar testes para UserController
chore(deps): atualizar dependências do projeto
```

### Tipos de Commit
- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Documentação
- **style**: Formatação, espaçamento (não afeta lógica)
- **refactor**: Refatoração de código
- **test**: Adição ou correção de testes
- **chore**: Tarefas de manutenção

### Processo de Contribuição
```bash
# 1. Atualizar branch principal
git checkout main
git pull upstream main

# 2. Criar nova branch
git checkout -b feature/minha-nova-feature

# 3. Fazer alterações e commits
git add .
git commit -m "feat(sepultado): adicionar campo epitáfio"

# 4. Push da branch
git push origin feature/minha-nova-feature

# 5. Criar Pull Request no GitHub
```

## 🧪 Testes

### Estrutura de Testes
```
tests/
├── backend/
│   ├── unit/           # Testes unitários
│   ├── integration/    # Testes de integração
│   └── e2e/           # Testes end-to-end
└── frontend/
    ├── components/     # Testes de componentes
    ├── pages/         # Testes de páginas
    └── utils/         # Testes de utilitários
```

### Exemplo de Teste Backend
```javascript
// tests/backend/unit/UserController.test.js
const request = require('supertest');
const app = require('../../../backend/index');
const User = require('../../../backend/models/User');

describe('UserController', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /users/register', () => {
    it('deve criar um novo usuário', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@test.com',
        password: 'senha123',
        confirmpassword: 'senha123',
        phone: '(14) 99999-9999',
        cpf: '123.456.789-00'
      };

      const response = await request(app)
        .post('/users/register')
        .send(userData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('userId');
    });

    it('deve retornar erro para email duplicado', async () => {
      // Criar usuário primeiro
      await User.create({
        name: 'João Silva',
        email: 'joao@test.com',
        password: 'hashedpassword',
        phone: '(14) 99999-9999',
        cpf: '123.456.789-00'
      });

      const userData = {
        name: 'Maria Silva',
        email: 'joao@test.com', // Email duplicado
        password: 'senha123',
        confirmpassword: 'senha123',
        phone: '(14) 88888-8888',
        cpf: '987.654.321-00'
      };

      const response = await request(app)
        .post('/users/register')
        .send(userData)
        .expect(422);

      expect(response.body.message).toBe('E-mail em uso, digite outro e-mail');
    });
  });
});
```

### Exemplo de Teste Frontend
```javascript
// tests/frontend/components/Login.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../../frontend/src/components/pages/Auth/Login';
import { Userprovider } from '../../../frontend/src/context/UserContext';

const LoginWithProviders = () => (
  <BrowserRouter>
    <Userprovider>
      <Login />
    </Userprovider>
  </BrowserRouter>
);

describe('Login Component', () => {
  it('deve renderizar formulário de login', () => {
    render(<LoginWithProviders />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Digite o seu e-mail')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Digite a sua senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('deve validar campos obrigatórios', async () => {
    render(<LoginWithProviders />);
    
    const submitButton = screen.getByRole('button', { name: 'Entrar' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('E-mail é obrigatório')).toBeInTheDocument();
    });
  });
});
```

### Executar Testes
```bash
# Backend
cd backend
npm test
npm run test:watch
npm run test:coverage

# Frontend
cd frontend
npm test
npm run test:coverage
```

## 📋 Pull Request Guidelines

### Checklist antes de submeter PR
- [ ] Código segue os padrões estabelecidos
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada (se necessário)
- [ ] Commits seguem padrão conventional
- [ ] Branch está atualizada com main
- [ ] Não há conflitos de merge

### Template de Pull Request
```markdown
## Descrição
Breve descrição das mudanças realizadas.

## Tipo de mudança
- [ ] Bug fix (correção que resolve um problema)
- [ ] Nova feature (funcionalidade que adiciona algo novo)
- [ ] Breaking change (mudança que quebra compatibilidade)
- [ ] Documentação

## Como testar
1. Passo 1
2. Passo 2
3. Resultado esperado

## Screenshots (se aplicável)
Adicione screenshots para mudanças visuais.

## Checklist
- [ ] Meu código segue os padrões do projeto
- [ ] Realizei self-review do código
- [ ] Comentei código complexo
- [ ] Adicionei testes que provam que a correção/feature funciona
- [ ] Testes novos e existentes passam
- [ ] Documentação foi atualizada
```

## 🐛 Reportar Issues

### Template de Bug Report
```markdown
**Descrição do Bug**
Descrição clara e concisa do problema.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '....'
3. Role até '....'
4. Veja o erro

**Comportamento Esperado**
Descrição do que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente:**
 - OS: [ex: Windows 10]
 - Browser: [ex: Chrome 91]
 - Versão: [ex: 1.0.0]

**Informações Adicionais**
Qualquer outra informação relevante.
```

### Template de Feature Request
```markdown
**Sua solicitação está relacionada a um problema?**
Descrição clara do problema. Ex: Fico frustrado quando [...]

**Descreva a solução que você gostaria**
Descrição clara da solução desejada.

**Descreva alternativas consideradas**
Descrição de soluções alternativas consideradas.

**Informações Adicionais**
Qualquer outra informação ou screenshots.
```

## 🔍 Code Review

### Para Revisores
- Verificar se o código resolve o problema proposto
- Avaliar legibilidade e manutenibilidade
- Verificar se testes adequados foram incluídos
- Sugerir melhorias construtivamente
- Aprovar quando satisfeito com as mudanças

### Para Autores
- Responder a comentários de forma construtiva
- Fazer alterações solicitadas
- Explicar decisões de design quando necessário
- Agradecer feedback recebido

## 📚 Recursos Úteis

### Documentação
- [Node.js Documentation](https://nodejs.org/docs/)
- [React Documentation](https://reactjs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)

### Ferramentas
- [VS Code](https://code.visualstudio.com/) - Editor recomendado
- [MongoDB Compass](https://www.mongodb.com/products/compass) - GUI para MongoDB
- [Postman](https://www.postman.com/) - Teste de APIs
- [Git](https://git-scm.com/) - Controle de versão

### Extensões VS Code Recomendadas
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

## 🎯 Roadmap

### Próximas Features
- [ ] Sistema de busca avançada
- [ ] Notificações por email
- [ ] API de geolocalização
- [ ] Sistema de moderação automatizado
- [ ] Backup em nuvem para imagens
- [ ] Aplicativo mobile
- [ ] Integração com redes sociais

### Melhorias Técnicas
- [ ] Implementar cache com Redis
- [ ] Adicionar testes E2E
- [ ] Configurar CI/CD
- [ ] Implementar logging estruturado
- [ ] Adicionar monitoramento de performance
- [ ] Implementar rate limiting avançado

## 📞 Contato

Para dúvidas sobre contribuição:
- **Email**: saulo.lima@example.com
- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)

---

Obrigado por contribuir para o Sistema de Cemitério! Sua ajuda é fundamental para tornar este projeto melhor para todos. 🙏
