import { useState,useEffect } from 'react'
import api from '../utils/api'
import useFlashMessage from './useFlashMessage' 
import { useNavigate } from 'react-router-dom'

export default function useAuth() {
  const [authenticated, setAuthenticated] = useState(false)
  const { setFlashMessage } = useFlashMessage()
  const navigate = useNavigate()

  useEffect(()=>{

    const token = localStorage.getItem('token')

    if(token){
      api.defaults.headers.Authorization = `Bearer ${JSON.parse(token)}`
      setAuthenticated(true)
    }
  },[])

  async function register(user) {
    let msgText = 'Cadastro realizado com sucesso!'
    let msgType = 'success'

    try {
      const response = await api.post('/users/register', user)
      const data = response.data
      await authUser(data)
    } catch (error) {
      if (error.response && error.response.data) {
        msgText = error.response.data.message || 'Erro ao cadastrar usuário'
      } else {
        msgText = 'Erro na comunicação com o servidor'
      }
      msgType = 'error'
    }

    setFlashMessage(msgText, msgType)
  }

 


   async function login(user) {
       let msgText = 'Login realizado!'
       let msgType = 'success'

     try {
      const data = await api.post('/users/login', user).then((response)=>{
        return response.data
      })

      await authUser(data)
      
     } catch (error) {
        msgText = error.response.data.message
        msgType = 'error'
     }
     setFlashMessage(msgText, msgType)
   }

    async function authUser(data) {
    setAuthenticated(true)
    localStorage.setItem('token', JSON.stringify(data.token))
    navigate('/') //  useNavigate é uma função, não possui .push
  }


  function logout(){
    const msgText = 'Você saiu do sistema '
    const msgType = 'success'

    setAuthenticated(false)
    localStorage.removeItem('token')
    api.defaults.headers.Authorization = undefined
     navigate('/')

     setFlashMessage(msgText, msgType)

  }

  return {authenticated, register,logout,login }
}
