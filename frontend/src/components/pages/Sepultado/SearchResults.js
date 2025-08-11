
// src/components/pages/SearchResults.js
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../../../utils/api';
import styles from './SearchResults.module.css';

function SearchResults() {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();

  // Extrair termo de pesquisa da URL
  const searchParams = new URLSearchParams(location.search);
  const searchTerm = searchParams.get('q') || '';

  useEffect(() => {
    if (searchTerm) {
      performSearch(searchTerm);
    }
  }, [searchTerm]);

  const performSearch = async (term) => {
    setLoading(true);
    setError('');
    
    try {
      // Fazer requisição para buscar sepultados
      const response = await api.get('/sepultados');
      const allSepultados = response.data.sepultado || [];
      
      // Filtrar resultados baseado no termo de pesquisa
      const filteredResults = allSepultados.filter(sepultado => 
        sepultado.nome.toLowerCase().includes(term.toLowerCase()) ||
        (sepultado.rua && sepultado.rua.toLowerCase().includes(term.toLowerCase())) ||
        (sepultado.quadra && sepultado.quadra.toLowerCase().includes(term.toLowerCase())) ||
        (sepultado.chapa && sepultado.chapa.toLowerCase().includes(term.toLowerCase()))
      );
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Erro na pesquisa:', error);
      setError('Erro ao realizar a pesquisa. Tente novamente.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
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

      {!loading && !error && (
        <>
          <div className={styles.results_count}>
            <p>{searchResults.length} resultado(s) encontrado(s)</p>
          </div>

          <div className={styles.sepultado_container}>
            {searchResults.length > 0 ? (
              searchResults.map((sepultado, index) => (
                <div key={sepultado.id || index} className={styles.sepultado_card}>
                  <div 
                    style={{
                      backgroundImage: `url(${process.env.REACT_APP_API}/images/sepultados/${sepultado.images[0]})`
                    }}
                    className={styles.sepultado_card_image}
                  >
                  </div>

                  <h3>{sepultado.nome}</h3>
                  
                  <h4>Informações da sepultura</h4>
                  <p>
                    <span className="bold">Rua: </span>
                    {sepultado.rua || "Inform. desconhecida"}
                  </p>
                  <p>
                    <span className="bold">Quadra: </span>
                    {sepultado.quadra || "Inform. desconhecida"}
                  </p>
                  <p>
                    <span className="bold">Placa: </span>
                    {sepultado.chapa || "Inform. desconhecida"}
                  </p>

                  <Link to={`/sepultados/${sepultado._id}`}>Mais detalhes</Link>
                </div>
              ))
            ) : (
              !loading && searchTerm && (
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
    </section>
  );
}

export default SearchResults;
