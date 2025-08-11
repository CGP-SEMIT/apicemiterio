// src/components/layout/Navbar.js - Versão final otimizada
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../assets/img/logo-cemi.png';
import styles from './Navbar.module.css'; 
import { Context } from '../../context/UserContext'
import { useContext } from 'react'
import api from '../../utils/api'

function Navbar() {
  const { authenticated, logout } = useContext(Context)
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const searchRef = useRef(null)
  const suggestionsRef = useRef(null)
  const abortControllerRef = useRef(null)

  // Debounce otimizado para sugestões
  useEffect(() => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        fetchSuggestions(searchTerm.trim())
      } else {
        setSuggestions([])
        setShowSuggestions(false)
        setLoading(false)
      }
    }, 300)

    return () => {
      clearTimeout(timeoutId)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [searchTerm])

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = async (term) => {
    setLoading(true)
    
    // Criar novo AbortController para esta requisição
    abortControllerRef.current = new AbortController()
    
    try {
      // Tentar usar endpoint otimizado de sugestões primeiro
      let response
      try {
        response = await api.get(`/sepultados/sugestoes?q=${encodeURIComponent(term)}`, {
          signal: abortControllerRef.current.signal
        })
        setSuggestions(response.data.suggestions || [])
      } catch (error) {
        if (error.name === 'AbortError') return
        
        // Fallback para endpoint de pesquisa geral
        try {
          response = await api.get(`/sepultados/pesquisa?q=${encodeURIComponent(term)}&suggestions=true`, {
            signal: abortControllerRef.current.signal
          })
          setSuggestions(response.data.sepultado?.slice(0, 5) || [])
        } catch (fallbackError) {
          if (fallbackError.name === 'AbortError') return
          
          // Último fallback: buscar todos e filtrar no frontend
          response = await api.get('/sepultados', {
            signal: abortControllerRef.current.signal
          })
          const allSepultados = response.data.sepultado || []
          const filtered = allSepultados.filter(sepultado => 
            sepultado.nome.toLowerCase().includes(term.toLowerCase()) ||
            (sepultado.rua && sepultado.rua.toLowerCase().includes(term.toLowerCase())) ||
            (sepultado.quadra && sepultado.quadra.toLowerCase().includes(term.toLowerCase())) ||
            (sepultado.chapa && sepultado.chapa.toLowerCase().includes(term.toLowerCase()))
          ).slice(0, 5)
          setSuggestions(filtered)
        }
      }
      
      setShowSuggestions(true)
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Erro ao buscar sugestões:', error)
        setSuggestions([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/sepultados/pesquisa?q=${encodeURIComponent(searchTerm.trim())}`)
      setSearchTerm('')
      setShowSuggestions(false)
    }
  }

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSuggestionClick = (sepultado) => {
    navigate(`/sepultados/${sepultado._id}`)
    setSearchTerm('')
    setShowSuggestions(false)
  }

  const handleInputFocus = () => {
    if (suggestions.length > 0 && searchTerm.trim().length >= 2) {
      setShowSuggestions(true)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
    // Adicionar navegação por teclado nas sugestões
    if (e.key === 'ArrowDown' && showSuggestions && suggestions.length > 0) {
      e.preventDefault()
      // Focar no primeiro item da lista
      const firstSuggestion = suggestionsRef.current?.querySelector('.suggestion_item')
      if (firstSuggestion) {
        firstSuggestion.focus()
      }
    }
  }

  const highlightMatch = (text, searchTerm) => {
    if (!text || !searchTerm) return text
    
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className={styles.highlight}>{part}</mark> : 
        part
    )
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbar_logo}>
        <img src={Logo} alt='Cemiterio'/>
        <h1>Cemitério Santa Faustina</h1>
      </div>

      {/* Campo de pesquisa dinâmica */}
      <div className={styles.search_container} ref={searchRef}>
        <form onSubmit={handleSearch} className={styles.search_form}>
          <input
            type="text"
            placeholder="Pesquisar sepultados..."
            value={searchTerm}
            onChange={handleSearchInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            className={styles.search_input}
            autoComplete="off"
          />
          <button 
            type="submit" 
            className={styles.search_button}
            disabled={!searchTerm.trim()}
            title="Pesquisar"
          >
            {loading ? '⏳' : '🔍'}
          </button>
        </form>

        {/* Sugestões dinâmicas */}
        {showSuggestions && (
          <div className={styles.suggestions_container} ref={suggestionsRef}>
            {suggestions.length > 0 ? (
              <>
                {suggestions.map((sepultado, index) => (
                  <div
                    key={sepultado._id || index}
                    className={`${styles.suggestion_item} suggestion_item`}
                    onClick={() => handleSuggestionClick(sepultado)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSuggestionClick(sepultado)
                      }
                    }}
                  >
                    <div className={styles.suggestion_content}>
                      <div className={styles.suggestion_name}>
                        {highlightMatch(sepultado.nome, searchTerm)}
                      </div>
                      <div className={styles.suggestion_details}>
                        {sepultado.rua && (
                          <>Rua: {highlightMatch(sepultado.rua, searchTerm)}</>
                        )}
                        {sepultado.quadra && (
                          <> • Quadra: {highlightMatch(sepultado.quadra, searchTerm)}</>
                        )}
                        {sepultado.chapa && (
                          <> • Placa: {highlightMatch(sepultado.chapa, searchTerm)}</>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {searchTerm.trim() && (
                  <div 
                    className={styles.suggestion_see_all}
                    onClick={() => handleSearch({ preventDefault: () => {} })}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch({ preventDefault: () => {} })
                      }
                    }}
                  >
                    Ver todos os resultados para "{searchTerm}"
                  </div>
                )}
              </>
            ) : (
              searchTerm.trim().length >= 2 && !loading && (
                <div className={styles.suggestion_no_results}>
                  Nenhum resultado encontrado
                </div>
              )
            )}
          </div>
        )}
      </div>

      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>

        {authenticated ? 
        (
          <>
            <li><Link to="/sepultados/meumemorial">Memorial Familiar</Link></li>
            <li><Link to="/user/profile">Perfil</Link></li>
            <li onClick={logout}>Sair</li>
          </>
        ) : 
        (
          <>
            <li>
              <Link to="/login">Entrar</Link>
            </li>
            <li>
              <Link to="/register">Cadastre-se</Link>
            </li>
          </>
        )  
        }
      </ul>
    </nav>
  );
}

export default Navbar;
