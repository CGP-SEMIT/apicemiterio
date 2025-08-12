# Guia do Frontend - Sistema de Cemitério

## 📱 Visão Geral

O frontend é uma aplicação React moderna que oferece uma interface intuitiva para gerenciamento de memoriais digitais. Utiliza React Router para navegação, Context API para gerenciamento de estado e Axios para comunicação com a API.

## 🏗️ Arquitetura

### Estrutura de Pastas
```
frontend/src/
├── components/
│   ├── layout/          # Componentes de layout
│   │   ├── Navbar.js
│   │   ├── Footer.js
│   │   ├── Container.js
│   │   ├── Message.js
│   │   └── RoundedImage.js
│   ├── form/            # Componentes de formulário
│   │   ├── Input.js
│   │   ├── SepultadoForm.js
│   │   └── Form.module.css
│   └── pages/           # Páginas da aplicação
│       ├── Auth/
│       │   ├── Login.js
│       │   └── Register.js
│       ├── User/
│       │   └── Profile.js
│       ├── Sepultado/
│       │   ├── MeusSepultados.js
│       │   ├── addSepultado.js
│       │   ├── EditSepultado.js
│       │   └── SepultadosDetails.js
│       └── Home.js
├── context/
│   └── UserContext.js   # Context para autenticação
├── hooks/
│   ├── usuAuth.js       # Hook de autenticação
│   └── useFlashMessage.js # Hook para mensagens
├── utils/
│   └── api.js           # Configuração do Axios
├── assets/
│   └── img/             # Imagens estáticas
└── App.js               # Componente principal
```

## 🔧 Componentes Principais

### App.js
Componente raiz que configura roteamento e providers:

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Userprovider } from './context/UserContext';

function App() {
  return (
    <Router>
      <Userprovider>
        <Navbar/>
        <Message/>
        <Container>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/user/profile" element={<Profile />} />
            <Route path="/sepultados/meumemorial" element={<MeusSepultados />} />
            <Route path="/sepultados/add" element={<AddSepultado />} />
            <Route path="/sepultados/edit/:id" element={<EditSepultado />} />
            <Route path="/sepultados/:id" element={<SepultadoDetails />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </Container>
        <Footer/>
      </Userprovider>
    </Router>
  );
}
```

### Navbar.js
Barra de navegação responsiva com autenticação condicional:

```jsx
function Navbar() {
  const {authenticated, logout} = useContext(Context)
  
  return (
    <nav className={styles.navbar}>
      <div className={styles.navbar_logo}>
        <img src={Logo} alt='Cemiterio'/>
        <h1>Cemitério Santa Faustina</h1>
      </div>
      <ul>
        <li><Link to="/">Home</Link></li>
        {authenticated ? (
          <>
            <li><Link to="/sepultados/meumemorial">Memorial Familiar</Link></li>
            <li><Link to="/user/profile">Perfil</Link></li>
            <li onClick={logout}>Sair</li>
          </>
        ) : (
          <>
            <li><Link to="/login">Entrar</Link></li>
            <li><Link to="/register">Cadastre-se</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}
```

## 🔐 Sistema de Autenticação

### UserContext.js
Context que gerencia estado de autenticação:

```jsx
import { createContext } from "react";
import useAuth from '../hooks/usuAuth'

const Context = createContext()

function Userprovider({children}){
   const {authenticated, register, logout, login} = useAuth()
   
   return (
     <Context.Provider value={{authenticated, register, logout, login}}>
       {children}
     </Context.Provider>
   )
}

export {Context, Userprovider}
```

### useAuth Hook
Hook personalizado para gerenciar autenticação:

```jsx
function useAuth() {
  const [authenticated, setAuthenticated] = useState(false)
  const navigate = useNavigate()
  const {setFlashMessage} = useFlashMessage()

  // Verificar token ao carregar
  useEffect(() => {
    const token = localStorage.getItem('token')
    if(token) {
      api.defaults.headers.Authorization = `Bearer ${JSON.parse(token)}`
      setAuthenticated(true)
    }
  }, [])

  async function login(user) {
    try {
      const data = await api.post('/users/login', user)
      await authUser(data.data)
    } catch (error) {
      setFlashMessage(error.response.data.message, 'error')
    }
  }

  async function authUser(data) {
    setAuthenticated(true)
    localStorage.setItem('token', JSON.stringify(data.token))
    navigate('/')
  }

  function logout(){
    setAuthenticated(false)
    localStorage.removeItem('token')
    api.defaults.headers.Authorization = undefined
    navigate('/')
    setFlashMessage('Você saiu do sistema', 'success')
  }

  return { authenticated, register, login, logout }
}
```

## 📄 Páginas Principais

### Home.js
Página inicial que lista todos os sepultados:

```jsx
function Home(){
  const [seps, setSeps] = useState([])

  useEffect(() => {
    api.get('/sepultados').then((response) => {
      setSeps(response.data.sepultado)
    }).catch((error) => {
      console.error('Erro na API:', error)
      setSeps([])
    })
  }, [])

  return (
    <section>
      <div className={styles.sep_home_header}>
        <h1>Encontre seu ente querido</h1>
        <p>Veja os detalhes de cada um e entre em contato com o responsável</p>
      </div>
      <div className={styles.sep_container}>
        {seps.length > 0 && 
          seps.map((sepultado) => (
            <div className={styles.sep_card} key={sepultado._id}>
              <div 
                style={{
                  backgroundImage: `url(${process.env.REACT_APP_API}/images/sepultados/${sepultado.images[0]})`
                }}
                className={styles.sep_card_image}
              ></div>
              <h3>{sepultado.nome}</h3>
              <p><span className="bold">Cemitério:</span> {sepultado.cemiterio}</p>
              <Link to={`/sepultados/${sepultado._id}`}>Mais detalhes</Link>
            </div>
          ))
        }
        {seps.length === 0 && (
          <p>Não há sepultados cadastrados ou disponíveis para adoção no momento!</p>
        )}
      </div>
    </section>
  )
}
```

### Login.js
Página de autenticação:

```jsx
function Login(){
  const [user, setUser] = useState({})
  const {login} = useContext(Context)

  function handleChange(e){
    setUser({ ...user, [e.target.name]: e.target.value })
  }

  function handleSubmit(e){
    e.preventDefault()
    login(user)
  }

  return(
    <section className={styles.form_container}>
      <div className={styles.form_header}>
        <h1>Login</h1>
        <p>Entre com seus dados de acesso.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <Input
          text="E-mail"
          type="email"
          name="email"
          placeholder="Digite o seu e-mail"
          handleOnChange={handleChange}
        />
        <Input
          text="Senha"
          type="password"
          name="password"
          placeholder="Digite a sua senha"
          handleOnChange={handleChange}
        />
        <input type="submit" value="Entrar" />
      </form>
      <p>
        Não tem conta? <Link to="/register">Clique aqui.</Link>
      </p>
    </section>
  )
}
```

### MeusSepultados.js
Dashboard do usuário para gerenciar seus sepultados:

```jsx
function MeusSepultados(){
  const [seps, setSeps] = useState([])
  const [token] = useState(localStorage.getItem('token') || '')
  const {setFlashMessage} = useFlashMessage()

  useEffect(() => {
    api.get('/sepultados/meussepultados', {
      headers: {
        Authorization: `Bearer ${JSON.parse(token)}`
      }
    }).then((response) => {
      setSeps(response.data.sepultados)
    })
  }, [token])

  async function removeSepultado(id) {
    let msgType = 'success'
    
    const data = await api.delete(`/sepultados/${id}`, {
      headers: {
        Authorization: `Bearer ${JSON.parse(token)}`
      }
    }).then((response) => {
      const updatedSeps = seps.filter((sep) => sep._id !== id)
      setSeps(updatedSeps)
      return response.data
    }).catch((err) => {
      msgType = 'error'
      return err.response.data
    })

    setFlashMessage(data.message, msgType)
  }

  return(
    <section>
      <div className={styles.petlist_header}>
        <h2>Memorial Familiar</h2>
        <Link to="/sepultados/add">
          Transforme saudade em homenagem. Registre aqui quem você ama.
        </Link>
      </div>
      <div className={styles.petlist_container}>  
        {seps.map((sepultado) => (
          <div className={styles.petlist_row} key={sepultado._id}>
            <RoundedImage
              src={`${process.env.REACT_APP_API}/images/sepultados/${sepultado.images?.[0] || 'default.jpg'}`}
              alt={sepultado.nome}
              width="px75"
            />
            <span className="bold">{sepultado.nome}</span>
            <div className={styles.actions}>
              <Link to={`/sepultados/edit/${sepultado._id}`}>Editar</Link>
              <button onClick={() => removeSepultado(sepultado._id)}>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

## 📝 Formulários

### SepultadoForm.js
Formulário reutilizável para criar/editar sepultados:

```jsx
function SepultadoForm({ handleSubmit, sepultadoData, btnText }) {
  const [sepultado, setSepultado] = useState(sepultadoData || {})
  const [preview, setPreview] = useState([])

  function onFileChange(e) {
    setPreview(Array.from(e.target.files))
    setSepultado({...sepultado, images: [...e.target.files]})
  }

  function handleChange(e) {
    setSepultado({...sepultado, [e.target.name]: e.target.value})
  }

  function handleSubmitForm(e) {
    e.preventDefault()
    handleSubmit(sepultado)
  }

  return (
    <form onSubmit={handleSubmitForm} className={styles.form_container}>
      <div className={styles.preview_sep_images}>
        {preview.length > 0
          ? preview.map((image, index) => (
              <img
                src={URL.createObjectURL(image)}
                alt={sepultado.nome}
                key={`${sepultado.nome}+${index}`}
              />
            ))
          : sepultado.images &&
            sepultado.images.map((image, index) => (
              <img
                src={`${process.env.REACT_APP_API}/images/sepultados/${image}`}
                alt={sepultado.nome}
                key={`${sepultado.nome}+${index}`}
              />
            ))}
      </div>
      
      <Input
        text="Imagens do Sepultado"
        type="file"
        name="images"
        handleOnChange={onFileChange}
        multiple={true}
      />
      
      <Input
        text="Nome do Sepultado"
        type="text"
        name="nome"
        placeholder="Digite o nome"
        handleOnChange={handleChange}
        value={sepultado.nome || ''}
      />
      
      {/* Outros campos do formulário */}
      
      <input type="submit" value={btnText} />
    </form>
  )
}
```

## 🎨 Estilização

### CSS Modules
O projeto utiliza CSS Modules para estilização isolada:

```css
/* Form.module.css */
.form_container {
  max-width: 300px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 15px;
}

.form_header {
  text-align: center;
  margin-bottom: 1em;
}

.form_header h1 {
  color: #16537e;
  margin-bottom: .3em;
}

.input_container {
  display: flex;
  flex-direction: column;
  margin-bottom: 1em;
}

.input_container label {
  font-weight: bold;
  margin-bottom: .3em;
  color: #0d4f71;
}

.input_container input,
.input_container select {
  padding: .7em;
  border: 1px solid #777;
  border-radius: 5px;
}
```

## 🔧 Hooks Personalizados

### useFlashMessage
Hook para exibir mensagens de feedback:

```jsx
function useFlashMessage() {
  const [message, setMessage] = useState('')
  const [type, setType] = useState('')

  function setFlashMessage(msg, msgType) {
    setMessage(msg)
    setType(msgType)

    setTimeout(() => {
      setMessage('')
      setType('')
    }, 3000)
  }

  return { setFlashMessage, message, type }
}
```

## 🌐 Comunicação com API

### api.js
Configuração do Axios:

```jsx
import axios from 'axios'

export default axios.create({
  baseURL: 'http://localhost:5000',
})
```

### Interceptors (Recomendado)
Para adicionar token automaticamente:

```jsx
// Adicionar ao api.js
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${JSON.parse(token)}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

## 📱 Responsividade

### Breakpoints Recomendados
```css
/* Mobile First */
.container {
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 3rem;
  }
}
```

## 🔍 Otimizações

### Performance
- Lazy loading de componentes
- Memoização com React.memo
- useCallback para funções
- useMemo para cálculos pesados

### SEO
- Meta tags dinâmicas
- Structured data
- Sitemap
- Open Graph tags

### Acessibilidade
- Alt text em imagens
- Labels em formulários
- Navegação por teclado
- Contraste adequado

## 🧪 Testes

### Configuração Jest
```javascript
// setupTests.js
import '@testing-library/jest-dom'

// Exemplo de teste
import { render, screen } from '@testing-library/react'
import Home from './components/pages/Home'

test('renders home page', () => {
  render(<Home />)
  const heading = screen.getByText(/Encontre seu ente querido/i)
  expect(heading).toBeInTheDocument()
})
```

## 🚀 Build e Deploy

### Build de Produção
```bash
npm run build
```

### Variáveis de Ambiente
```env
# .env.production
REACT_APP_API=https://api.seudominio.com
REACT_APP_ENV=production
```

### Deploy Estático
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

---

Este guia fornece uma visão abrangente do frontend, desde a arquitetura até implementação e deploy. Para dúvidas específicas, consulte a documentação do React ou entre em contato com a equipe de desenvolvimento.
