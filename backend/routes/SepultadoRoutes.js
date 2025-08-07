const express = require('express');
const router = express.Router();

const SepultadoController = require('../controllers/SepultadoController')

//middlewares
const verifyToken = require('../helpers/verify-token')
const {imageUpload} = require("../helpers/image-upload")

//  CORRIGIDO: Mudado de 'create' para 'createSepultado'
router.post('/create', verifyToken, imageUpload.fields([{ name: 'images', maxCount: 5 }]), SepultadoController.createSepultado)

router.get('/',SepultadoController.getAll)
router.get('/meussepultados',verifyToken, SepultadoController.getAllUserSepultados)
router.get('/:id', SepultadoController.getSepById)
router.delete('/:id', verifyToken, SepultadoController.removeSepById)
router.patch('/:id',verifyToken,imageUpload.array('images'),SepultadoController.updateSep)
router.patch('/schedule/:id',verifyToken, SepultadoController.schedule)
router.patch('/conclude/:id',verifyToken, SepultadoController.concludeAdoption)

//router.get('/informacoes',verifyToken, SepultadoController.getAllInformacoes)   // em avaliação

//rota para possiveis comentários
router.post(
  '/:id/comentario',
  verifyToken,
  SepultadoController.adicionarComentario
);

module.exports = router;