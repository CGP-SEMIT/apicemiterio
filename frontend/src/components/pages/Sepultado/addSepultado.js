import styles from './AddSepultado.module.css'
import api from '../../../utils/api'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom' // 

//components
import SepultadoForm from '../../form/SepultadoForm'

//hooks
import useFlashMessage from '../../../hooks/useFlashMessage'

function AddSepultado() {
  const [token] = useState(localStorage.getItem('token') || '')
  const { setFlashMessage } = useFlashMessage()
  const navigate = useNavigate() // 

  async function registerSepultado(sepultado) {
    let msgType = 'success'
    const formData = new FormData()

    Object.keys(sepultado).forEach((key) => {
      if (key === 'images') {
        for (let i = 0; i < sepultado[key].length; i++) {
          formData.append('images', sepultado[key][i])
        }
      } else {
        formData.append(key, sepultado[key])
      }
    })

    const data = await api
      .post('sepultados/create', formData, {
        headers: {
          Authorization: `Bearer ${JSON.parse(token)}`,
        
        },
      })
      .then((response) => {
        return response.data
      })
      .catch((err) => {
        msgType = 'error'
        return err.response.data
      })

    setFlashMessage(data.message, msgType)

    if (msgType !== 'error') {
      navigate('/sepultados/meussepultados') //  correção da navegação
    }
  }

  return (
    <section className={styles.addsep_header}>
      <div>
        <h2>Criação de Memorial</h2>
        <p>
          Após o registro, o ente ficará disponível para localização dentro do
          cemitério e poderá receber futuras homenagens de amigos e familiares.
        </p>
      </div>

      <SepultadoForm handleSubmit={registerSepultado} btnText="Cadastrar" />
    </section>
  )
}

export default AddSepultado
