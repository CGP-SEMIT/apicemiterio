import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../utils/api';

import styles from './AddSepultado.module.css';

import SepultadoForm from '../../form/SepultadoForm.js';
import useFlashMessage from '../../../hooks/useFlashMessage.js';

function EditSepultado() {
  const [sep, setSep] = useState({});
  const { id } = useParams();
  const { setFlashMessage } = useFlashMessage();

  // Busca os dados do sepultado
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error("Token não encontrado");
      return;
    }

    api.get(`/sepultados/${id}`, {
      headers: {
        Authorization: `Bearer ${JSON.parse(token)}`
      }
    })
    .then((response) => {
      setSep(response.data);
    })
    .catch((error) => {
      console.error("Erro ao buscar sepultado:", error);
    });
  }, [id]); // ← REMOVIDO 'token' das dependências

  async function updateSep(sep) {
    const token = localStorage.getItem('token'); // ← Obter token aqui também
    
    if (!token) {
      setFlashMessage("Token não encontrado", "error");
      return;
    }

    let msgType = 'success';
    const formData = new FormData();

    await Object.keys(sep).forEach((key) => {
      if (key === 'images') {
        for (let i = 0; i < sep[key].length; i++) {
          formData.append('images', sep[key][i]);
        }
      } else {
        formData.append(key, sep[key]);
      }
    });

    const data = await api.patch(`sepultados/${sep._id}`, formData, {
      headers: {
        Authorization: `Bearer ${JSON.parse(token)}`,
        'Content-Type': 'multipart/form-data'
      }
    }).then((response) => {
      return response.data;
    }).catch((err) => {
      msgType = 'error';
      return err.response.data;
    });

    setFlashMessage(data.message, msgType);
  }

  return (
    <section>
      <div className={styles.addsep_header}>
        <h2>Editando as informações de: {sep.nome}</h2>
        <p>Depois da edição, os dados serão atualizados no sistema.</p>
      </div>
      {sep.nome && (
        <SepultadoForm handleSubmit={updateSep} btnText="Atualizar" sepultadoData={sep} />
      )}
    </section>
  );
}

export default EditSepultado;