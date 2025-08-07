import api from '../../../utils/api.js'
import { useState,useEffect } from "react"
import {Link} from 'react-router-dom'
import styles from './Dashboard.module.css'

// Assumindo que RoundedImage é um componente local. Ajuste o caminho se for diferente.
import RoundedImage from  '../../layout/RoundedImage'

//hooks
import useFlashMessage from "../../../hooks/useFlashMessage.js"

function MeusSepultados(){
   const [seps, setSeps] = useState([])
   const [token] = useState(localStorage.getItem('token')|| '')
   const {setFlashMessage} = useFlashMessage() // Mantido para evitar aviso, mas pode ser removido se não for usado.

   useEffect(()=>{
     api.get('/sepultados/meussepultados',{
        headers:{
           Authorization: `Bearer ${JSON.parse(token)}`
        }
     })
     .then((response)=>{
        // A API retorna um objeto com a propriedade 'sepults'
        // Verifique se response.data e response.data.sepults existem e se response.data.sepults é um array
        if (response.data && Array.isArray(response.data.sepults)) {
            setSeps(response.data.sepults)
        } else {
            console.error("Formato de dados inesperado da API:", response.data);
            setSeps([]); // Define como array vazio para evitar erros
            setFlashMessage("Formato de dados inesperado da API.", "error");
        }
     })
   }, []) 


   async function removeSepultado(id) {
      let msgType = 'success'

      const data = await api.delete(`/sepultados/${id}`,{
         headers:{
            Authorization: `Bearer ${JSON.parse(token)}`
         }
      } )
      .then((response)=>{
         const updateSepultados = seps.filter((sepultado)=> sepultado._id !==id)
         setSeps(updateSepultados)
         return response.data
      })
      .catch((err)=>{
         msgType = 'error'
         return err.response.data
      })

      setFlashMessage(data.message,msgType)
   }




return(
   <section >
        <div className={styles.petlist_header}>
             <h2>Memorial Familiar</h2>
             <Link to="/sepultados/add">Transforme saudade em homenagem. Registre aqui quem você ama.</Link>
        </div>

       <div className={styles.petlist_container}>  
         {seps.map((sepultado) => (
  <div   className={styles.petlist_row} key={sepultado._id}>
    <RoundedImage
      src={`${process.env.REACT_APP_API}/images/sepultados/${sepultado.images?.[0] || 'default.jpg'}`}

      alt={sepultado.nome}
      width="px75"
    />
    <span className="bold">{sepultado.nome}</span>
    <div className={styles.actions}>
      <Link to={`/sepultados/edit/${sepultado._id}`}>Editar</Link>
      <button onClick={()=>{
         removeSepultado(sepultado._id)
      }}>Excluir</button>
    </div>
  </div>
))}





       </div>
   </section>
)

}

export default MeusSepultados