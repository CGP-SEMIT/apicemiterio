import api from '../../utils/api' 
import {Link} from 'react-router-dom'
import {useState, useEffect} from 'react'
import styles from './Home.module.css'
 
function Home(){
    const [seps, setSeps] = useState([])

    useEffect(()=>{
        api.get('/sepultados').then((response) =>{
            console.log('Response:', response.data);
            setSeps(response.data.sepultado) // Mudança aqui!
        }).catch((error) => {
            console.error('Erro na API:', error);
            setSeps([]);
        })
    },[])

    return(
        <section>
            <div className={styles.sepultado_home_header}>
                <h2>Galeria dos Nomes</h2>
                <h5>Recentes</h5>
            </div>
            <div className={styles.sepultado_container}>
                {seps.length > 0 && 
                    seps.map((sepultado, index) =>(
                        <div key={sepultado.id || index} className={styles.sepultado_card}>
                            
                            <div  style={{backgroundImage:`url(${process.env.REACT_APP_API}/images/sepultados/${sepultado.images[0]})`}}
                             className={styles.sepultado_card_image}>

                            </div>




                            <h3>{sepultado.nome}</h3>
                         
                            <h4> Informações da sepultura</h4>
                              <p>
                            <span className='bold'>Rua : </span>{sepultado.rua || "Inform. desconhecida"}
                            </p>
                              <p>
                            <span className='bold'>Quadra : </span>{sepultado.quadra || "Inform. desconhecida"}
                            </p>
                               <p>
                            <span className='bold'>Placa : </span>{sepultado.chapa || "Inform. desconhecida"}
                            </p>


                    <Link to={`sepultados/${sepultado._id}`}>Mais detalhes</Link>
                        </div>  
                    ))
                }
                {seps.length === 0 && (
                    <p>Não há sepultados cadastrados no momento</p>
                )}
            </div>
        </section>
    )
}

export default Home