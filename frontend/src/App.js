import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

/*pages*/
import Login from './components/pages/Auth/Login'
import Register from './components/pages/Auth/Register'
import Home from './components/pages/Home'
import Profile from './components/pages/User/Profile'
import MeusSepultados from './components/pages/Sepultado/MeusSepultados'
import AddSepultado from  './components/pages/Sepultado/addSepultado'
import EditSepultado from  './components/pages/Sepultado/EditSepultado'
import SepultadoDetails from  './components/pages/Sepultado/SepultadosDetails'
import SearchResults from './components/pages/Sepultado/SearchResults'; // Importar SearchResults

/*components*/
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Container from './components/layout/Container';
import Message from './components/layout/Message';


//context
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
              <Route path="/sepultados/pesquisa" element={<SearchResults />} /> {/* Adicionar rota de pesquisa */}
                
        <Route path="/" element={<Home />} />
        
      </Routes>

       </Container>
      <Footer/>
      </Userprovider>
    </Router>
  );
}

export default App;
