import api from '../../utils/api' 
import {Link} from 'react-router-dom'
import {useState, useEffect} from 'react'
import styles from './Home.module.css'
 
function Home(){
    const [seps, setSeps] = useState([])
    const [expandedImage, setExpandedImage] = useState(null)

    useEffect(()=>{
        api.get('/sepultados').then((response) =>{
            console.log('Response:', response.data);
            setSeps(response.data.sepultado) // Mudança aqui!
        }).catch((error) => {
            console.error('Erro na API:', error);
            setSeps([]);
        })
    },[])

    const handleImageClick = (imageUrl) => {
        setExpandedImage(imageUrl)
    }

    const handleCloseModal = () => {
        setExpandedImage(null)
    }

    return(
        <section>
            <div className={styles.sepultado_home_header}>
              
                <h5>Recentes</h5>
            </div>
            <div className={styles.sepultado_container}>
                {seps.length > 0 && 
                    seps.map((sepultado, index) =>(
                        <div key={sepultado.id || index} className={styles.sepultado_card}>
                            
                            <div  
                                style={{backgroundImage:`url(${process.env.REACT_APP_API}/images/sepultados/${sepultado.images[0]})`}}
                                className={styles.sepultado_card_image}
                                onClick={() => handleImageClick(`${process.env.REACT_APP_API}/images/sepultados/${sepultado.images[0]}`)}
                            >
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

            {/* Modal para imagem expandida */}
            {expandedImage && (
                <div className={styles.image_modal} onClick={handleCloseModal}>
                    <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
                        <img 
                            src={expandedImage} 
                            alt="Imagem expandida" 
                            className={styles.expanded_image}
                            onClick={handleCloseModal}
                        />
                        <button 
                            className={styles.close_button}
                            onClick={handleCloseModal}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </section>
    )
}

export default Home
