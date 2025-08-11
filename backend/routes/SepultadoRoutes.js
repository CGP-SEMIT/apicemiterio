// routes/sepultados.js - Versão otimizada para pesquisa dinâmica

const express = require('express');
const router = express.Router();

const SepultadoController = require('../controllers/SepultadoController')

//middlewares
const verifyToken = require('../helpers/verify-token')
const {imageUpload} = require("../helpers/image-upload")

// Rotas de pesquisa (devem vir antes da rota /:id para evitar conflitos)
router.get('/pesquisa', SepultadoController.searchSepultados)
router.get('/sugestoes', SepultadoController.getSuggestions)
router.get('/autocomplete', SepultadoController.getAutocomplete)

// Rotas existentes
router.post('/create', verifyToken, imageUpload.fields([{ name: 'images', maxCount: 5 }]), SepultadoController.createSepultado)
router.get('/',SepultadoController.getAll)
router.get('/meussepultados',verifyToken, SepultadoController.getAllUserSepultados)
router.get('/:id', SepultadoController.getSepById)
router.delete('/:id', verifyToken, SepultadoController.removeSepById)
router.patch('/:id',verifyToken,imageUpload.array('images'),SepultadoController.updateSep)
router.patch('/schedule/:id',verifyToken, SepultadoController.schedule)
router.patch('/conclude/:id',verifyToken, SepultadoController.concludeAdoption)

//rota para possiveis comentários
router.post(
  '/:id/comentario',
  verifyToken,
  SepultadoController.adicionarComentario
);

module.exports = router;
