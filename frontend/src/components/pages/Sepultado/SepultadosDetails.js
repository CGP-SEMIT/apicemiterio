import styles from './SepultadoDetails.module.css'
import api from '../../../utils/api'

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import useFlashMessage from '../../../hooks/useFlashMessage'

function SepultadoDetails() {
  const [sep, setSep] = useState({})
  const { id } = useParams()
  const { setFlashMessage } = useFlashMessage()
  const [token] = useState(localStorage.getItem('token') || '')

  useEffect(() => {
    api.get(`/sepultados/${id}`).then((response) => {
      console.log('Resposta da API:', response.data)
      setSep(response.data)
    }).catch((error) => {
      console.error('Erro ao buscar sepultado:', error)
    })
  }, [id])

  return (
    <section className={styles.sepultado_details_container}>
      <div className={styles.sepultado_details_header}>
        <h2>{sep.nome}</h2>
      </div>

      {Array.isArray(sep.images) && sep.images.length > 0 && (
        <div className= {styles.sepultado_images}>
          {sep.images.map((image, index) => (
            <img
              src={`${process.env.REACT_APP_API}/images/sepultados/${image || 'default.jpg'}`}
              alt={sep.nome}
              key={index}
            />
          ))}
        </div>
      )}
      
                           <p>
                             <span className='bold'>Falecimento:  </span> {sep.dtFal}
                            </p>
                           <p>
                            <span className='bold'>Nascimento: </span>{sep.dtNasc || "Desconhecido"}
                            </p>
                            <p>
                            <span className='bold'>Idade : </span>{sep.idade || "Desconhecida"}
                            </p>
                            <p>
                            <span className='bold'>Naturalidade: </span>{sep.nacionalidade || "Desconhecida"}
                            </p>
                              <p>
                            <span className='bold'>Pai : </span>{sep.pai || "Inform. desconhecida"}
                            </p>
                             <p>
                            <span className='bold'>Mãe : </span>{sep.mae || "Inform. desconhecida"}
                            </p>
                             <p>
                            <span className='bold'>Cemiterio : </span>{sep.cemiterio || "Inform. desconhecida"}
                            </p>
                             <p>
                            <span className='bold'>Rua : </span>{sep.rua || "Inform. desconhecida"}
                            </p>
                             <p>
                            <span className='bold'>Quadra : </span>{sep.quadra || "Inform. desconhecida"}
                             </p>
                              <p>
                            <span className='bold'>Placa : </span>{sep.chapa || "Inform. desconhecida"}
                            </p>
                             <p>
                            <span className='bold'>Tipo de Sepultura : </span>{sep.tipoSepultura || "Inform. desconhecida"}
                            </p>
                             <p>
                            <span className='bold'>Epitáfio : </span>{sep.epitafio || "Descanse em paz"}
                            </p>

                          
      
    </section>
  )
}

export default SepultadoDetails
