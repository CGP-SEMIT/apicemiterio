const express = require('express');
const router = express.Router(); // Correto: usa o `Router` do `express`

const UserController = require('../controllers/UserController');


//middleware
const verifyToken = require('../helpers/verify-token')
const {imageUpload} = require("../helpers/image-upload")



// Rotas
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/checkuser', UserController.checkUser);
router.get('/:id', UserController.getUserById);
router.patch('/edit/:id', verifyToken, imageUpload.single("image"), UserController.editUser)



module.exports = router;
