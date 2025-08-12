// src/components/pages/SearchResults.js
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../../../utils/api';
import styles from './SearchResults.module.css';

function SearchResults() {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const location = useLocation();

  // Extrair termo de pesquisa da URL
  const searchParams = new URLSearchParams(location.search);
  const searchTerm = searchParams.get('q') || '';

  useEffect(() => {
    if (searchTerm && searchTerm.trim() !== '') {
      performSearch(searchTerm);
    } else {
      setSearchResults([]);
      setTotalResults(0);
      setError('');
    }
  }, [searchTerm]);

  const performSearch = async (term) => {
    if (!term || term.trim() === '') {
      setSearchResults([]);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await api.get('/sepultados/search?q=' + encodeURIComponent(term.trim()) + '&limit=50');
      
      if (response.data && Array.isArray(response.data.sepultado)) {
        setSearchResults(response.data.sepultado);
        setTotalResults(response.data.total || response.data.sepultado.length);
      } else {
        console.warn('Formato de resposta inesperado:', response.data);
        setSearchResults([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error('Erro na pesquisa:', error);
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setError('Termo de pesquisa inválido. Por favor, digite algo para pesquisar.');
            break;
          case 404:
            setError('Nenhum resultado encontrado.');
            break;
          case 500:
            setError('Erro interno do servidor. Tente novamente em alguns minutos.');
            break;
          default:
            setError('Erro ao realizar a pesquisa. Tente novamente.');
        }
      } else if (error.request) {
        setError('Sem conexão com o servidor. Verifique sua internet.');
      } else {
        setError('Erro inesperado. Tente novamente.');
      }
      
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (sepultado) => {
    if (sepultado.images && sepultado.images.length > 0 && sepultado.images[0]) {
      return process.env.REACT_APP_API + '/images/sepultados/' + sepultado.images[0];
    }
    return null;
  };

  const highlightSearchTerm = (text, term) => {
    if (!text || !term) return text;
    
    const lowerText = text.toLowerCase();
    const lowerTerm = term.toLowerCase();
    const index = lowerText.indexOf(lowerTerm);
    
    if (index === -1) return text;
    
    const beforeMatch = text.substring(0, index);
    const match = text.substring(index, index + term.length);
    const afterMatch = text.substring(index + term.length);
    
    return (
      <span>
        {beforeMatch}
        <mark style={{ backgroundColor: '#fff3cd', padding: '2px 4px', borderRadius: '3px' }}>
          {match}
        </mark>
        {afterMatch}
      </span>
    );
  };

  return (
    <section className={styles.search_results_container}>
      <div className={styles.search_header}>
        <h2>Resultados da Pesquisa</h2>
        {searchTerm && (
          <p className={styles.search_term}>
            Pesquisando por: "<strong>{searchTerm}</strong>"
          </p>
        )}
      </div>

      {loading && (
        <div className={styles.loading}>
          <p>Pesquisando...</p>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && searchTerm && (
        <>
          <div className={styles.results_count}>
            <p>
              {totalResults > 0 ? (
                totalResults + ' resultado' + (totalResults !== 1 ? 's' : '') + ' encontrado' + (totalResults !== 1 ? 's' : '')
              ) : (
                'Nenhum resultado encontrado'
              )}
            </p>
          </div>

          <div className={styles.sepultado_container}>
            {searchResults.length > 0 ? (
              searchResults.map((sepultado, index) => (
                <div key={sepultado._id || sepultado.id || index} className={styles.sepultado_card}>
                  <div 
                    className={styles.sepultado_card_image}
                    style={{
                      backgroundImage: getImageUrl(sepultado) ? 'url(' + getImageUrl(sepultado) + ')' : 'none'
                    }}
                  >
                  </div>

                  <h3>{highlightSearchTerm(sepultado.nome, searchTerm)}</h3>
                  
                  <h4>Informações da sepultura</h4>
                  <p>
                    <span className="bold">Rua: </span>
                    {sepultado.rua ? highlightSearchTerm(sepultado.rua, searchTerm) : "Inform. desconhecida"}
                  </p>
                  <p>
                    <span className="bold">Quadra: </span>
                    {sepultado.quadra ? highlightSearchTerm(sepultado.quadra, searchTerm) : "Inform. desconhecida"}
                  </p>
                  <p>
                    <span className="bold">Placa: </span>
                    {sepultado.chapa ? highlightSearchTerm(sepultado.chapa, searchTerm) : "Inform. desconhecida"}
                  </p>

                  <Link to={'/sepultados/' + sepultado._id}>Mais detalhes</Link>
                </div>
              ))
            ) : (
              searchTerm && (
                <div className={styles.no_results}>
                  <p>Nenhum sepultado encontrado para "{searchTerm}"</p>
                  <p>Tente pesquisar por:</p>
                  <ul>
                    <li>Nome completo ou parte do nome</li>
                    <li>Rua da sepultura</li>
                    <li>Quadra</li>
                    <li>Número da placa</li>
                  </ul>
                </div>
              )
            )}
          </div>
        </>
      )}

      {!searchTerm && !loading && (
        <div className={styles.no_results}>
          <p>Digite algo na barra de pesquisa para encontrar sepultados.</p>
        </div>
      )}
    </section>
  );
}

export default SearchResults;