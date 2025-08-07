 import {useState,useContext} from 'react'
 import Input from "../../form/input"
 import styles from '../../form/Form.module.css'
 import {Link} from 'react-router-dom'


 //context
 import { Context } from '../../../context/UserContext'
 
 function Register(){
 const [user,setUser] = useState({})
 const {register} = useContext(Context)
 
function handleOnChange(e) {
  const updatedUser = { ...user, [e.target.name]: e.target.value }
  setUser(updatedUser) // ✔️ Agora o estado será atualizado corretamente
}


      function handleSubmit(e){
        e.preventDefault()
        //envia usuário para o banco
          register(user)
        
      }
 return(
    <section className={styles.form_container}>

      <h2>Cadastro de Usuário</h2>
         <form onSubmit={handleSubmit}>
            <Input
            text="Nome"
            type="text"
            name="name"
            placeholder="Digite o seu nome"
            handleOnChange={handleOnChange}
            />

             <Input
            text="Telefone"
            type="text"
            name="phone"
            placeholder="Digite o seu telefone"
            handleOnChange={handleOnChange}
            />

             <Input
            text="E-mail"
            type="email"
            name="email"
            placeholder="Digite o seu e-mail"
            handleOnChange={handleOnChange}
            />

              <Input
            text="Senha"
            type="password"
            name="password"
            placeholder="Digite sua senha"
            handleOnChange={handleOnChange}
            />
             <Input
            text="Confimação de Senha"
            type="password"
            name="confirmpassword"
            placeholder="Confirme sua senha"
            handleOnChange={handleOnChange}
            />
            <input type="submit" value="Cadastrar"/>
  </form>

  <p> Já tem conta? <Link to="/login">Clique aqui</Link></p>
    </section>
 )

 }

 export default Register