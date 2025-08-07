// src/components/layout/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../assets/img/logo-cemi.png';
import styles from './Navbar.module.css'; 
import {Context} from '../../context/UserContext'
import {useContext} from 'react'


function Navbar() {

  const {authenticated,logout} = useContext(Context)


  return (
   <nav className={styles.navbar}>
  <div className={styles.navbar_logo}>
    <img src={Logo} alt='Cemiterio'/>
    <h1>Cemitério Santa Faustina</h1>
  </div>
     <ul>
        <li>
    <Link to="/">Home</Link>
  </li>

{authenticated ? 
(
  <>
   <li><Link to="/sepultados/meumemorial">Memorial Familiar</Link> </li>
   <li><Link to="/user/profile">Perfil</Link></li>
   <li onClick={logout}>Sair</li>
</>
) : 
(
  <>
   <li>
    <Link to="/login">Entrar</Link>
  </li>
  <li>
    <Link to="/register">Cadastre-se</Link>
  </li>
  </>
)  

}

 

</ul>
  
</nav>

  );
}

export default Navbar;
