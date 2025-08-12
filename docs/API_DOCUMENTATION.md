# API Documentation - Sistema de Cemitério

## Base URL
```
http://localhost:5000
```

## Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. O token deve ser incluído no header `Authorization` como Bearer token:

```
Authorization: Bearer <token>
```

## Endpoints

### 🔐 Autenticação de Usuários

#### POST /users/register
Registra um novo usuário no sistema.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "confirmpassword": "senha123",
  "phone": "(14) 99999-9999",
  "cpf": "123.456.789-00"
}
```

**Response (201):**
```json
{
  "message": "Você está autenticado",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

**Validações:**
- Nome obrigatório
- E-mail único e válido
- Senha mínima (implementar validação)
- Confirmação de senha
- Telefone obrigatório
- CPF único e obrigatório

---

#### POST /users/login
Autentica um usuário existente.

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "message": "Você está autenticado",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

**Errors:**
- 422: E-mail não encontrado
- 422: Senha inválida

---

#### GET /users/checkuser
Verifica se o usuário está autenticado e retorna seus dados.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "(14) 99999-9999",
  "cpf": "123.456.789-00",
  "image": "user_image.jpg",
  "createdAt": "2023-09-06T10:30:00.000Z",
  "updatedAt": "2023-09-06T10:30:00.000Z"
}
```

---

#### GET /users/:id
Busca um usuário específico por ID.

**Response (200):**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "(14) 99999-9999",
  "image": "user_image.jpg"
}
```

---

#### PATCH /users/edit/:id
Edita os dados do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (FormData):**
```
name: "João Silva Santos"
email: "joao.santos@email.com"
phone: "(14) 88888-8888"
password: "novasenha123" (opcional)
confirmpassword: "novasenha123" (se password fornecido)
image: <arquivo> (opcional)
```

**Response (200):**
```json
{
  "message": "Usuário atualizado com sucesso!"
}
```

---

### ⚰️ Gestão de Sepultados

#### POST /sepultados/create
Cria um novo registro de sepultado.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (FormData):**
```
nome: "Maria Santos"
cemiterio: "Cemitério Santa Faustina"
chapa: "A-123"
dtFal: "2023-01-15"
dtNasc: "1950-05-20"
idade: "72"
mae: "Ana Santos"
pai: "José Santos"
nacionalidade: "Brasileira"
quadra: "A"
rua: "1"
tipoSepultura: "Jazigo"
epitafio: "Descanse em paz, querida mãe"
images: <arquivo1>, <arquivo2>, ... (máximo 5)
```

**Response (201):**
```json
{
  "message": "Sepultado cadastrado com sucesso!",
  "newSepultado": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "nome": "Maria Santos",
    "cemiterio": "Cemitério Santa Faustina",
    // ... outros campos
  }
}
```

**Validações Obrigatórias:**
- nome
- chapa
- dtFal (data de falecimento)
- dtNasc (data de nascimento)
- mae
- pai
- nacionalidade
- quadra
- rua

---

#### GET /sepultados
Lista todos os sepultados disponíveis publicamente.

**Response (200):**
```json
{
  "sepultado": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "nome": "Maria Santos",
      "cemiterio": "Cemitério Santa Faustina",
      "chapa": "A-123",
      "dtFal": "2023-01-15",
      "dtNasc": "1950-05-20",
      "images": ["image1.jpg", "image2.jpg"],
      "user": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "João Silva",
        "phone": "(14) 99999-9999"
      }
    }
  ]
}
```

---

#### GET /sepultados/meussepultados
Lista os sepultados cadastrados pelo usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "sepultados": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "nome": "Maria Santos",
      // ... dados completos
    }
  ]
}
```

---

#### GET /sepultados/:id
Busca um sepultado específico por ID.

**Response (200):**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
  "nome": "Maria Santos",
  "cemiterio": "Cemitério Santa Faustina",
  "chapa": "A-123",
  "dtFal": "2023-01-15",
  "dtNasc": "1950-05-20",
  "idade": "72",
  "mae": "Ana Santos",
  "pai": "José Santos",
  "nacionalidade": "Brasileira",
  "quadra": "A",
  "rua": "1",
  "tipoSepultura": "Jazigo",
  "epitafio": "Descanse em paz, querida mãe",
  "images": ["image1.jpg", "image2.jpg"],
  "comentarios": [
    {
      "nome": "Filho João",
      "mensagem": "Saudades eternas, mãe",
      "data": "2023-09-06T10:30:00.000Z"
    }
  ],
  "user": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "João Silva",
    "image": "user_image.jpg",
    "phone": "(14) 99999-9999"
  }
}
```

---

#### PATCH /sepultados/:id
Edita um sepultado existente (apenas pelo proprietário).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (FormData):**
```
nome: "Maria Santos Silva"
cemiterio: "Cemitério Santa Faustina"
// ... outros campos que deseja atualizar
images: <novos arquivos> (opcional)
```

**Response (200):**
```json
{
  "message": "Sepultado atualizado com sucesso!"
}
```

---

#### DELETE /sepultados/:id
Remove um sepultado (apenas pelo proprietário).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Sepultado removido com sucesso!"
}
```

---

#### POST /sepultados/:id/comentario
Adiciona um comentário/homenagem a um sepultado.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "nome": "Amigo Carlos",
  "mensagem": "Uma pessoa maravilhosa que sempre lembrarei com carinho."
}
```

**Response (200):**
```json
{
  "message": "Comentário adicionado com sucesso!"
}
```

---

#### PATCH /sepultados/schedule/:id
Agenda uma visita ao sepultado (funcionalidade de adoção).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "A visita foi agendada com sucesso, entre em contato com o Cemitério Santa Faustina, pelo telefone (14) 3471-0233"
}
```

---

#### PATCH /sepultados/conclude/:id
Conclui o processo de adoção de responsabilidade.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Adoção concluída com sucesso!"
}
```

## Códigos de Status HTTP

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Requisição inválida
- **401**: Não autorizado (token inválido/ausente)
- **404**: Recurso não encontrado
- **422**: Dados de entrada inválidos
- **500**: Erro interno do servidor

## Upload de Imagens

### Configurações
- **Formatos aceitos**: JPG, JPEG, PNG
- **Tamanho máximo**: Configurado no Multer
- **Quantidade máxima**: 5 imagens por sepultado
- **Armazenamento**: Pasta `public/images/sepultados/` e `public/images/users/`

### URLs de Acesso
```
http://localhost:5000/images/sepultados/<nome_arquivo>
http://localhost:5000/images/users/<nome_arquivo>
```

## Middleware de Segurança

### verifyToken
Valida o JWT em todas as rotas protegidas:
- Verifica presença do header Authorization
- Valida formato Bearer token
- Decodifica e verifica assinatura
- Adiciona dados do usuário ao req.user

### Autorização
- Usuários só podem editar/excluir próprios registros
- Verificação de propriedade baseada no campo `user._id`
- Comentários podem ser adicionados por qualquer usuário autenticado

## Tratamento de Erros

A API retorna erros em formato JSON:

```json
{
  "message": "Descrição do erro"
}
```

### Erros Comuns
- Token inválido ou expirado
- Dados obrigatórios ausentes
- E-mail ou CPF já cadastrados
- Tentativa de editar registro de outro usuário
- Arquivo de imagem inválido
