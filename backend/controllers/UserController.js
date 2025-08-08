const User = require('../models/User'); // Importa o model User do Mongoose
const bcrypt = require('bcrypt'); // Biblioteca para hashing de senha
const jwt = require('jsonwebtoken'); // Biblioteca para manipular JSON Web Tokens (JWT)
const mongoose = require('mongoose'); // Biblioteca para manipulação do MongoDB e validação de ObjectId

// helpers
const createUserToken = require('../helpers/create-user-token'); // Função auxiliar para criar e enviar token ao usuário
const getToken = require('../helpers/get-token-js'); 
const getUserByToken = require('../helpers/get-user-by-token');// Função auxiliar para extrair token do cabeçalho da requisição


module.exports = class UserController {

  //////////////////////////////////// Método para registrar um novo usuário///////////////////////////////////////////////////////////////
  static async register(req, res) {
    const { name, email, phone, password, confirmpassword, cpf } = req.body; // Desestrutura dados enviados pelo cliente

    // Verifica se o corpo da requisição existe
    if (!req.body) {
      return res.status(400).json({ message: "Corpo da requisição não enviado." });
    }

    // Validações dos campos obrigatórios
    if (!name) return res.status(422).json({ message: 'O nome é obrigatório' });
    if (!cpf) return res.status(422).json({ message: 'O CPF é obrigatório' });
    if (!email) return res.status(422).json({ message: 'O email é obrigatório' });
    if (!phone) return res.status(422).json({ message: 'O phone é obrigatório' });
    if (!password) return res.status(422).json({ message: 'A senha é obrigatória' });
    if (!confirmpassword) return res.status(422).json({ message: 'A confirmação de senha é obrigatória' });

    // Verifica se as senhas conferem
    if (password !== confirmpassword) {
      return res.status(422).json({ message: 'As senhas não conferem' });
    }

    // Verifica se o e-mail já está cadastrado no banco
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      return res.status(422).json({ message: 'E-mail em uso, digite outro e-mail' });
    }

    // Gera um salt para a senha e cria o hash da senha
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Cria um novo objeto User com os dados e a senha criptografada
    const user = new User({
      name: name,
      cpf: cpf,
      email: email,
      phone: phone,
      password: passwordHash
    });

    try {
      // Salva o novo usuário no banco de dados
      const newUser = await user.save();
      // Cria o token e envia a resposta ao cliente
      await createUserToken(newUser, req, res);
    } catch (error) {
      // Em caso de erro no servidor, envia status 500 com a mensagem de erro
      res.status(500).json({ message: error });
    }
  }



  ///////////////////////////// Método para login do usuário/////////////////////////////////////////
  static async login(req, res) {
    // Verifica se o corpo da requisição está presente e não está vazio
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Corpo da requisição ausente!' });
    }

    const { email, password } = req.body;

    // Validações dos campos obrigatórios
    if (!email) {
      return res.status(422).json({ message: 'O e-mail é obrigatório' });
    }
    if (!password) {
      return res.status(422).json({ message: 'A senha é obrigatória' });
    }

    // Procura o usuário no banco pelo e-mail
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(422).json({ message: 'Não há usuário cadastrado com este e-mail' });
    }

    // Compara a senha informada com a senha armazenada no banco (hash)
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(422).json({ message: 'A senha é inválida!' });
    }

    // Se estiver tudo certo, cria e envia o token para o cliente
    await createUserToken(user, req, res);


  }

  //////////////////////// Método para verificar o usuário logado a partir do token////////////////////////////////////////////
  static async checkUser(req, res) {
    let currentUser;

    // Verifica se o cabeçalho Authorization existe
    if (req.headers.authorization) {
      // Extrai o token do cabeçalho Authorization
      const token = getToken(req);

      // Se o token não existir ou estiver mal formatado, retorna erro 401 (não autorizado)
      if (!token) {
        return res.status(401).json({ message: 'Token inválido ou mal formatado' });
      }

      // Decodifica o token usando a chave secreta
      const decoded = jwt.verify(token, 'nossosecret');

      // Busca o usuário no banco pelo ID obtido no token
      currentUser = await User.findById(decoded.id);

      // Remove a senha da resposta para segurança
      currentUser.password = undefined;

    } else {
      // Se não existir token, currentUser fica nulo
      currentUser = null;
    }

    // Envia o usuário atual (ou nulo) na resposta
    res.status(200).send(currentUser);
  }

  ////////////////////BUSCAR USUÁRIO PELO ID /////////////////////////////////////////////////////////////////

  // Método para buscar um usuário pelo ID (parâmetro da URL)
  static async getUserById(req, res) {
    const id = req.params.id; // Pega o ID da URL

    // Valida se o ID tem formato válido de ObjectId do MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(422).json({ message: 'ID inválido' });
    }

    try {
      // Busca o usuário pelo ID no banco
      const user = await User.findById(id).select('-password');

      // Se não achar, retorna erro 404 (não encontrado)
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado!' });
      }

      // Se achar, retorna o usuário com status 200
      res.status(200).json({ user });
    } catch (err) {
      // Em caso de erro no servidor, retorna erro 500 com a mensagem
      res.status(500).json({ message: 'Erro no servidor', error: err.message });
    }
  }


  ///////////////////////EDITAR USUÁRIO//////////////////////////////////////////////////////////////////////


    // editar usuário
 // Método para editar usuário
  static async editUser(req, res) {


    
    // Obtém o ID do usuário da URL (não é usado, pois vamos identificar o usuário pelo token)
    const id = req.params.id;

    // Recupera o token do cabeçalho da requisição
    const token = getToken(req);

    // Obtém os dados do usuário associado ao token
    const user = await getUserByToken(token);

    // Verifica se o corpo da requisição está presente
    if (!req.body) {
      return res.status(400).json({ message: 'Requisição inválida-provavelmente vazia!' });
    }

    // Desestrutura os dados enviados no corpo da requisição
    const { name, email, phone, password, confirmpassword, cpf } = req.body;

    

     if(req.file){
      user.image = req.file.filename
     }







    // Validação: nome é obrigatório
    if (!name) {
      return res.status(422).json({ message: 'O nome é obrigatório' });
    }

    // Validação: e-mail é obrigatório
    if (!email) {
      return res.status(422).json({ message: 'O email é obrigatório' });
    }

    // Verifica se o e-mail já está em uso por outro usuário
    const userExists = await User.findOne({ email: email });
    if (user.email !== email && userExists) {
      return res.status(422).json({ message: 'Email já está em uso por outro usuário!' });
    }

    // Validação: telefone é obrigatório
    if (!phone) {
      return res.status(422).json({ message: 'O telefone é obrigatório' });
    }

    // Validação: CPF é obrigatório
    if (!cpf) {
      return res.status(422).json({ message: 'O CPF é obrigatório' });
    }

    // Validação: senha é obrigatória
    if (!password) {
      return res.status(422).json({ message: 'A senha é obrigatória' });
    }
      if (!confirmpassword) return res.status(422).json({ message: 'A confirmação de senha é obrigatória' });

    // Validação: senha e confirmação devem coincidir
    if (password !== confirmpassword) {
      return res.status(422).json({ message: 'As senhas não coincidem' });
    }

    // Atribui os novos valores ao usuário
    user.name = name;
    user.email = email;
    user.phone = phone;
    user.cpf = cpf;

    // Gera o hash da nova senha
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    user.password = passwordHash;

    // Tenta salvar as alterações no banco de dados
    try {
      await user.save();
      res.status(200).json({ message: 'Usuário atualizado com sucesso!' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar usuário', error: error.message });
    }
  }
}