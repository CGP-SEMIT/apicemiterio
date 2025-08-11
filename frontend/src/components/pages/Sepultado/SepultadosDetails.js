import styles from './SepultadoDetails.module.css'
import api from '../../../utils/api'

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import useFlashMessage from '../../../hooks/useFlashMessage'

function SepultadoDetails() {
  const [sep, setSep] = useState({})
  const [comentarios, setComentarios] = useState([])
  const [novoComentario, setNovoComentario] = useState('')
  const [carregandoComentarios, setCarregandoComentarios] = useState(false)
  const { id } = useParams()
  const { setFlashMessage } = useFlashMessage()
  const [token] = useState(localStorage.getItem('token') || '')

  useEffect(() => {
    // Buscar dados do sepultado
    api.get(`/sepultados/${id}`).then((response) => {
      console.log('Resposta da API:', response.data)
      setSep(response.data)
    }).catch((error) => {
      console.error('Erro ao buscar sepultado:', error)
    })

    // Buscar comentários
    buscarComentarios()
  }, [id])

  const buscarComentarios = async () => {
    setCarregandoComentarios(true)
    try {
      const response = await api.get(`/sepultados/${id}/comentarios`)
      setComentarios(response.data || [])
    } catch (error) {
      console.error('Erro ao buscar comentários:', error)
    } finally {
      setCarregandoComentarios(false)
    }
  }

  const adicionarComentario = async (e) => {
    e.preventDefault()
    if (!novoComentario.trim()) return

    try {
      const response = await api.post(`/sepultados/${id}/comentarios`, {
        comentario: novoComentario,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      setComentarios([...comentarios, response.data])
      setNovoComentario('')
      setFlashMessage('Comentário adicionado com sucesso!', 'success')
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error)
      setFlashMessage('Erro ao adicionar comentário. Tente novamente.', 'error')
    }
  }

  const formatarData = (dataString) => {
    if (!dataString) return 'Desconhecida'
    try {
      return new Date(dataString).toLocaleDateString('pt-BR')
    } catch {
      return dataString
    }
  }

  return (
    <section className={styles.sepultado_details_container}>
      {/* Header */}
      <div className={styles.sepultado_details_header}>
        <h1>{sep.nome || 'Carregando...'}</h1>
      </div>

      {/* Imagens */}
      {Array.isArray(sep.images) && sep.images.length > 0 && (
        <div className={styles.sepultado_images}>
          {sep.images.map((image, index) => (
            <img
              src={`${process.env.REACT_APP_API}/images/sepultados/${image || 'default.jpg'}`}
              alt={sep.nome}
              key={index}
            />
          ))}
        </div>
      )}

      {/* Conteúdo principal em duas colunas */}
      <div className={styles.main_content}>
        {/* Coluna da esquerda - Dados */}
        <div className={styles.left_column}>
          {/* Dados Pessoais */}
          <div className={styles.info_section}>
            <h3>Dados Pessoais</h3>
            <div className={styles.info_grid}>
              <div className={styles.info_item}>
                <span className={styles.label}>Falecimento:</span>
                <span className={styles.value}>{formatarData(sep.dtFal)}</span>
              </div>
              <div className={styles.info_item}>
                <span className={styles.label}>Nascimento:</span>
                <span className={styles.value}>{formatarData(sep.dtNasc)}</span>
              </div>
              <div className={styles.info_item}>
                <span className={styles.label}>Idade:</span>
                <span className={styles.value}>{sep.idade || "Desconhecida"}</span>
              </div>
              <div className={styles.info_item}>
                <span className={styles.label}>Naturalidade:</span>
                <span className={styles.value}>{sep.nacionalidade || "Desconhecida"}</span>
              </div>
              <div className={styles.info_item}>
                <span className={styles.label}>Pai:</span>
                <span className={styles.value}>{sep.pai || "Informação desconhecida"}</span>
              </div>
              <div className={styles.info_item}>
                <span className={styles.label}>Mãe:</span>
                <span className={styles.value}>{sep.mae || "Informação desconhecida"}</span>
              </div>
            </div>
          </div>

          {/* Dados da Sepultura */}
          <div className={styles.info_section}>
            <h3>Dados da Sepultura</h3>
            <div className={styles.info_grid}>
              <div className={styles.info_item}>
                <span className={styles.label}>Cemitério:</span>
                <span className={styles.value}>{sep.cemiterio || "Informação desconhecida"}</span>
              </div>
              <div className={styles.info_item}>
                <span className={styles.label}>Rua:</span>
                <span className={styles.value}>{sep.rua || "Informação desconhecida"}</span>
              </div>
              <div className={styles.info_item}>
                <span className={styles.label}>Quadra:</span>
                <span className={styles.value}>{sep.quadra || "Informação desconhecida"}</span>
              </div>
              <div className={styles.info_item}>
                <span className={styles.label}>Placa:</span>
                <span className={styles.value}>{sep.chapa || "Informação desconhecida"}</span>
              </div>
              <div className={styles.info_item}>
                <span className={styles.label}>Tipo de Sepultura:</span>
                <span className={styles.value}>{sep.tipoSepultura || "Informação desconhecida"}</span>
              </div>
            </div>
          </div>

          {/* Epitáfio */}
          <div className={styles.epitafio_section}>
            <h3>Epitáfio</h3>
            <div className={styles.epitafio_content}>
              <p>"{sep.epitafio || "Descanse em paz"}"</p>
            </div>
          </div>
        </div>

        {/* Coluna da direita - Comentários */}
        <div className={styles.right_column}>
          <div className={styles.comments_section}>
            <h3>Homenagens</h3>
            
            {/* Formulário para novo comentário */}
            <form onSubmit={adicionarComentario} className={styles.comment_form}>
              <textarea
                placeholder="Deixe sua homenagem..."
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                className={styles.comment_textarea}
                rows="4"
              />
              <button type="submit" className={styles.submit_button}>
                Adicionar Homenagem
              </button>
            </form>

            {/* Lista de comentários */}
            <div className={styles.comments_list}>
              {carregandoComentarios ? (
                <div className={styles.loading}>Carregando comentários...</div>
              ) : comentarios.length > 0 ? (
                comentarios.map((comentario, index) => (
                  <div key={index} className={styles.comment_item}>
                    <div className={styles.comment_header}>
                      <span className={styles.comment_author}>
                        {comentario.autor || 'Anônimo'}
                      </span>
                      <span className={styles.comment_date}>
                        {formatarData(comentario.createdAt)}
                      </span>
                    </div>
                    <p className={styles.comment_text}>{comentario.texto}</p>
                  </div>
                ))
              ) : (
                <div className={styles.no_comments}>
                  <p>Seja o primeiro a deixar uma homenagem.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SepultadoDetails