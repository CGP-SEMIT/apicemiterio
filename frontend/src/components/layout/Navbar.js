// src/components/layout/Navbar.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../../assets/img/logo-cemi.png';
import styles from './Navbar.module.css'; 
import { Context } from '../../context/UserContext'
import { useContext } from 'react'
import api from '../../utils/api';

function Navbar() {
  const { authenticated, logout } = useContext(Context)
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Rotas onde o filtro de pesquisa não deve aparecer
  const hiddenSearchRoutes = ['/login', '/register', '/sepultados/add']
  
  // Verificar se a rota atual é uma rota de edição (contém /sepultados/edit/)
  const isEditRoute = location.pathname.includes('/sepultados/edit/')
  
  // Determinar se deve mostrar o filtro de pesquisa
  const shouldShowSearch = authenticated && !hiddenSearchRoutes.includes(location.pathname) && !isEditRoute

  // Debounce para otimizar as requisições
  useEffect(() => {
    if (!shouldShowSearch) return

    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        fetchSuggestions(searchTerm)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, shouldShowSearch])

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = async (term) => {
    setLoading(true)
    try {
      const response = await api.get(`/sepultados/pesquisa?q=${encodeURIComponent(term)}&suggestions=true`)
      setSuggestions(response.data.sepultado || [])
      setShowSuggestions(true)
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/sepultados/pesquisa?q=${encodeURIComponent(searchTerm.trim())}`)
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (sepultado) => {
    navigate(`/sepultados/${sepultado._id}`)
    setSearchTerm('')
    setShowSuggestions(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value)
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbar_logo}>
        <img src={Logo} alt='Cemiterio'/>
        <h1>Cemitério Santa Faustina</h1>
      </div>

      {/* Campo de pesquisa - só aparece se shouldShowSearch for true */}
      {shouldShowSearch && (
        <div className={styles.search_container} ref={searchRef}>
          <form onSubmit={handleSearch} className={styles.search_form}>
            <input
              type="text"
              placeholder="Pesquisar sepultados..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              onKeyDown={handleKeyDown}
              className={styles.search_input}
            />
            <button 
              type="submit" 
              className={styles.search_button}
              disabled={!searchTerm.trim()}
            >
              🔍
            </button>
          </form>

          {/* Dropdown de sugestões */}
          {showSuggestions && (
            <div className={styles.suggestions_dropdown}>
              {loading && (
                <div className={styles.suggestion_item}>
                  <span>Pesquisando...</span>
                </div>
              )}
              
              {!loading && suggestions.length > 0 && (
                <>
                  {suggestions.map((sepultado, index) => (
                    <div
                      key={sepultado._id || index}
                      className={styles.suggestion_item}
                      onClick={() => handleSuggestionClick(sepultado)}
                    >
                      <div className={styles.suggestion_content}>
                        <strong>{sepultado.nome}</strong>
                        {sepultado.rua && <span> - {sepultado.rua}</span>}
                        {sepultado.quadra && <span>, Quadra {sepultado.quadra}</span>}
                      </div>
                    </div>
                  ))}
                  
                  {searchTerm.trim() && (
                    <div 
                      className={styles.suggestion_item_all}
                      onClick={handleSearch}
                    >
                      Ver todos os resultados para "{searchTerm}"
                    </div>
                  )}
                </>
              )}
              
              {!loading && suggestions.length === 0 && searchTerm.trim().length >= 2 && (
                <div className={styles.suggestion_item}>
                  <span>Nenhuma sugestão encontrada</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
