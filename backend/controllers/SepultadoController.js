const Sepultado = require("../models/Sepultado") // Importa o model Mongoose do Sepultado
const mongoose = require("mongoose") // Importa o mongoose para usar ObjectId e conexões

//helpers
const getToken = require("../helpers/get-token-js") // Função que extrai o token da requisição
const getUserBytoken = require("../helpers/get-user-by-token") // Função que obtém usuário com base no token
const ObjectId = require("mongoose").Types.ObjectId // Atalho para validar ObjectId do MongoDB

module.exports = class SepultadoController {
    // Método para criar um novo sepultado
    static async createSepultado(req, res) {
        // Logs de debug para verificar o que está chegando no body e nos arquivos
        console.log("req.body:", req.body);
        console.log("req.files:", req.files);
        console.log("Content-Type:", req.headers["content-type"]);

        // Verifica se o body foi enviado corretamente
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(422).json({
                message: "Nenhum dado foi enviado. Por favor, preencha o formulário."
            });
        }

        // Extrai os campos do corpo da requisição
        const {id, cemiterio, chapa, dtFal, dtNasc, idade, mae, nacionalidade, nome, pai, quadra, rua, image, epitafio,tipoSepultura,latitude,longitude } = req.body
        const images = req.files?.images || [] // Verifica se há imagens enviadas no req.files

        const available = true // Define o sepultado como disponível por padrão

        // Validações obrigatórias de campos
        if (!nome) {
            res.status(422).json({ message: "O nome é obrigatório!" })
            return
        }
        if (!chapa) {
            res.status(422).json({ message: "A chapa é obrigatória!" })
            return
        }
        if (!dtFal) {
            res.status(422).json({ message: "A data de falecimento é obrigatória!" })
            return
        }
        if (!dtNasc) {
            res.status(422).json({ message: "A data de nascimento é obrigatória!" })
            return
        }
        if (!idade) {
            res.status(422).json({ message: "A idade é obrigatória!" })
            return
        }
        if (!quadra) {
            res.status(422).json({ message: "A quadra é obrigatória!" })
            return
        }
        if (!mae) {
            res.status(422).json({ message: "Mãe é um campo obrigatório!" })
            return
        }
        if (!pai) {
            res.status(422).json({ message: "Pai é um campo obrigatório!" })
            return
        }
        

        // Recupera o usuário logado através do token
        const token = getToken(req)
        const user = await getUserBytoken(token)
        console.log("Usuário recuperado:", user);

        // Cria um novo objeto do tipo Sepultado
        const sepultado = new Sepultado({
            id,
            cemiterio,
            nome,
            chapa,
            dtFal,
            dtNasc,
            idade,
            quadra,
            mae,
            pai,
            nacionalidade,
            latitude,
            longitude,
            rua,
            epitafio,
            available,
            images: [],
            user: {
                _id: user._id,
                name: user.name,
                image: user.image,
                phone: user.phone
            }
        })

        // Adiciona os nomes dos arquivos de imagem ao array `image`
        if (images && Array.isArray(images)) {
            images.forEach((image) => {
                sepultado.images.push(image.filename)
            })
        }

        try {
            // Salva no banco e responde com sucesso
            const newSepultado = await sepultado.save()
            res.status(201).json({
                message: "Sepultado cadastrado com sucesso!",
                newSepultado,
            })
        } catch (error) {
            // Trata erros internos do servidor
            res.status(500).json({ message: error.message })
        }
    }

    // Retorna os últimos 20 sepultados cadastrados (ordenados do mais recente ao mais antigo)
    static async getAll(req, res) {
        try {
            const sepultado = await Sepultado.find()
                .sort("-createdAt") // Ordena por data de criação, do mais novo ao mais antigo
                .limit(20);         // Limita a 20 registros

            res.status(200).json({ sepultado });
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar os sepultados", error: error.message });
        }
    }

    //-----------------------------comentários públicos------------------------------------------

    // Adiciona um comentário público a um sepultado específico
    static async adicionarComentario(req, res) {
        const sepultadoId = req.params.id;
        const { mensagem } = req.body;

        // Verifica se a mensagem foi enviada
        if (!mensagem) {
            return res.status(422).json({ message: "A mensagem é obrigatória." });
        }

        try {
            const token = getToken(req);
            const user = await getUserBytoken(token); // <- verifique se nome da função é `getUserByToken` ou `getUserBytoken`

            const sepultado = await Sepultado.findById(sepultadoId);

            if (!sepultado) {
                return res.status(404).json({ message: "Sepultado não encontrado." });
            }

            // Adiciona o comentário
            sepultado.comentarios.push({
                nome: user.name,
                mensagem
            });

            await sepultado.save();

            res.status(201).json({
                message: "Comentário adicionado com sucesso!",
                comentarios: sepultado.comentarios
            });
        } catch (error) {
            res.status(500).json({ message: "Erro ao adicionar comentário.", error: error.message });
        }
    }

    // Retorna todos os sepultados criados pelo usuário logado
    static async getAllUserSepultados(req,res){
        const token = getToken(req)
        const user = await getUserBytoken(token)

        const sepults = await Sepultado.find({"user._id": user._id}).sort("-createdAt")

        res.status(200).json({
            sepults,
        })
    }

    // Endpoint opcional — parece ser um esboço para futuras funcionalidades
    static async getAllInformacoes(req,res){
        const token = getToken(req)
        const user = await getUserBytoken(token)

        // const sepults =await Sepultado.find({"solicitante._id": user._id}).sort("-createdAt") // comentado

        res.status(200).json({
            sepults,
        })
    }

    // Busca um sepultado por ID (ObjectId ou UUID alternativo)
    static async getSepById(req, res) {
        const id = req.params.id;
        let sepultado = null;

        try {
            // Primeiro tenta buscar usando o ObjectId padrão do MongoDB
            if (mongoose.Types.ObjectId.isValid(id)) {
                sepultado = await Sepultado.findOne({ _id: id });
            }

            // Se não encontrou, tenta buscar por campo 'id' (possivelmente UUID)
            if (!sepultado) {
                sepultado = await Sepultado.findOne({ id: id });
            }

            if (!sepultado) {
                return res.status(404).json({ message: "Sepultado não encontrado." });
            }

            res.status(200).json(sepultado);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao buscar sepultado." });
        }
    }


    //*****************remover************************************************************************************************************************ */

    // Remove um sepultado por ID
static async removeSepById(req, res) {
    // Obtém o ID do sepultado a partir dos parâmetros da requisição
    const id = req.params.id;

    // Verifica se o ID fornecido é válido
    if (!ObjectId.isValid(id)) {
        return res.status(422).json({ message: "ID inválido!" });
    }

    // Procura o sepultado no banco de dados pelo ID
    const sepultado = await Sepultado.findById(id);

    // Se o sepultado não for encontrado, retorna erro 404
    if (!sepultado) {
        return res.status(404).json({ message: "Sepultado não encontrado!" });
    }

    // Obtém o token do cabeçalho da requisição
    const token = getToken(req);

    // Logs de debug para verificar o token recebido e o esperado
    console.log("Token recebido:", token);
    console.log("Token esperado:", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiUGF0eSAiLCJpZCI6IjY4N2UyMzU5MTUzZmI5NzA5ZWNlMmQ5NSIsImlhdCI6MTc1MzIxMjExMX0.BzsVByb_nYJaQk2bSsUYv0s-Jvlr9k-NlW13DnoU2Ho");

    // Recupera o usuário autenticado com base no token
    const user = await getUserBytoken(token);

    // Logs de debug para verificar o ID do usuário do sepultado e o usuário atual autenticado
    console.log("Sepultado user ID:", sepultado.user._id.toString());
    console.log("Current user ID:", user._id.toString());

    // Verifica se o usuário autenticado é o dono do sepultado
    if (sepultado.user._id.toString() !== user._id.toString()) {
        return res.status(403).json({ 
            message: "Acesso negado. Você não tem permissão para excluir este sepultado.",
            debug: {
                sepultadoUserId: sepultado.user._id.toString(),
                currentUserId: user._id.id.toString()
            }
        });
    }

    try {
        // Remove o sepultado do banco de dados
        await Sepultado.findByIdAndDelete(id);

        // Retorna sucesso na exclusão
        res.status(200).json({ message: "Sepultado removido com sucesso!" });
    } catch (error) {
        // Em caso de erro interno, retorna erro 500
        res.status(500).json({ message: error.message });
    }
}
  // *****************************************EDITAR*************************************************************************************************************

         static async updateSep(req,res){

            const id = req.params.id

            console.log(id)

          // Extrai os campos do corpo da requisição
        const { cemiterio, chapa, dtFal, dtNasc, idade, mae, nacionalidade, nome, pai, quadra, rua, image, available, tipoSepultura, epitafio } = req.body
       const images = req.files || [];




        const updatedData ={}

        const sep = await Sepultado.findOne({_id : id})
        console.log(sep)

        if(!sep){
          res.status(404).json({message: "Registro não encontrado!"})
          return
        }

 

      const token = getToken(req)
      const user = await getUserBytoken(token)

// Verifica se o usuário autenticado é o dono do sepultado
 if (sep.user._id.toString() !== user._id.toString()) {
      res.status(422).json({
        message:"Houve um problema em processar a sua solicitação, tente novamente mais tarde!"
      })
      return
    }
     // Validações obrigatórias de campos
        if (!nome) {
            res.status(422).json({ message: "O nome é obrigatório!" })
            return
        }else{
            updatedData.nome =nome
        }
        if (!chapa) {
            res.status(422).json({ message: "A chapa é obrigatória!" })
            return
        }else{
            updatedData.chapa = chapa
        }
        if (!dtFal) {
            res.status(422).json({ message: "A data de falecimento é obrigatória!" })
            return
        }else{
            updatedData.dtFal = dtFal;
        }
        if (!dtNasc) {
            res.status(422).json({ message: "A data de nascimento é obrigatória!" })
            return
        }else{
            updatedData.dtNasc = dtNasc
        }
        if (!idade) {
            res.status(422).json({ message: "A idade é obrigatória!" })
            return
        }else{
            updatedData.idade = idade
        }
        if (!quadra) {
            res.status(422).json({ message: "A quadra é obrigatória!" })
            return
        }else{
            updatedData.quadra = quadra
        }
        if (!mae) {
            res.status(422).json({ message: "Mãe é um campo obrigatório!" })
            return
        }else{
            updatedData.mae =mae
        }
        if (!pai) {
            res.status(422).json({ message: "Pai é um campo obrigatório!" })
            return
        }else{
            updatedData.pai = pai
        }

         if (cemiterio !== undefined) {
             updatedData.cemiterio = cemiterio;
         }
          if (rua !== undefined) {
             updatedData.rua = rua;
         }


        if (epitafio !== undefined) {
             updatedData.epitafio = epitafio;
         }
          if (nacionalidade !== undefined) {
             updatedData.nacionalidade = nacionalidade;
         }
          if (tipoSepultura !== undefined) {
             updatedData.tipoSepultura = tipoSepultura;
         }
         if(latitude !== undefined){
            updatedData.latitude = latitude
         }
         if(longitude !== undefined){
            updatedData.longitude = longitude
         }
       
       
       
       
       
       if (images) {
 updatedData.images = images.map(image => image.filename);
}

updatedData.images = images.map(image => image.filename);

await Sepultado.findByIdAndUpdate(id, updatedData, { new: true });

res.status(200).json({ message: "Registro atualizado com sucesso!" });



 }
        

     static async schedule(req,res){
       
        const id = req.params.id

     //   Verifica que o sepultado existe
        const sepultado = await Sepultado.findOne({_id:id})
            if(!sepultado){
            res.status(404).json({message: "Registro não encontrado!"})
        }


        
      const token = getToken(req)
      const user = await getUserBytoken(token)
   //verifica se o sepultado ja esta registrado no usuario
       if(sepultado.user._id.equals(user._id)){
        res.status(422).json({
           message:"Você já é o usuário responsavel por este sepultado"

        })
       }

  /// verifica se há uma outra requisição 
       if(sepultado.adopter){
        if(sepultado.adopter.id.equals(user._id)){
            res.status(422).json({
                message: "Você já solicitou a adoção de responsabilidade sobre este sepultado!"
            })
        }
       }


   //adicionando usuario como responsavel do sepultado
         sepultado.adopter ={
            _id: user._id,
            name: user.name,
            image: user.image
         }

          await Sepultado.findByIdAndUpdate(id,sepultado)
            res.status(200).json({
                message: `A visita foi agendada com sucesso, entre em contato com o ${sepultado.cemiterio}, pelo telefone (14) 3471-0233`
                
            })

     }
static async concludeAdoption(req, res) {
  const id = req.params.id; // ou use req.body.id, conforme o caso

  try {
    const sepultado = await Sepultado.findOne({ _id: id });

    if (!sepultado) {
      return res.status(404).json({ message: "Sepultado não encontrado" });
    }

    const token = getToken(req);
    const user = await getUserBytoken(token);

    // Verifica se o usuário autenticado é o dono do sepultado
    if (sepultado.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({
        message: "Acesso negado. Você não tem permissão para concluir esta adoção.",
      });
    }

    sepultado.available = false;

    await Sepultado.findByIdAndUpdate(id, sepultado);

    res.status(200).json({
      message: `Você agora é o responsável pelo sepultado: ${sepultado.nome}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao concluir a adoção." });
  }
}

// Método otimizado para pesquisa dinâmica com sugestões
static async searchSepultados(req, res) {
  const { q, limit = 10, suggestions = false } = req.query

  if (!q || q.trim() === '') {
    res.status(400).json({ message: 'Termo de pesquisa é obrigatório' })
    return
  }

  try {
    const searchTerm = q.trim()
    const limitNum = suggestions === 'true' ? 5 : parseInt(limit) || 10
    
    // Busca otimizada usando regex case-insensitive
    const searchQuery = {
      $or: [
        { nome: { $regex: searchTerm, $options: 'i' } },
        { rua: { $regex: searchTerm, $options: 'i' } },
        { quadra: { $regex: searchTerm, $options: 'i' } },
        { chapa: { $regex: searchTerm, $options: 'i' } }
      ]
    }

    // Para sugestões, retornar apenas campos essenciais
    const projection = suggestions === 'true' 
      ? { nome: 1, rua: 1, quadra: 1, chapa: 1, images: { $slice: 1 } }
      : {}

    const sepultados = await Sepultado.find(searchQuery, projection)
      .sort({ 
        // Priorizar matches exatos no nome
        nome: 1 
      })
      .limit(limitNum)

    // Para sugestões, adicionar score de relevância
    if (suggestions === 'true') {
      const scoredResults = sepultados.map(sep => {
        let score = 0
        const lowerSearchTerm = searchTerm.toLowerCase()
        const lowerNome = sep.nome.toLowerCase()
        
        // Score mais alto para matches no início do nome
        if (lowerNome.startsWith(lowerSearchTerm)) {
          score += 10
        } else if (lowerNome.includes(lowerSearchTerm)) {
          score += 5
        }
        
        // Score adicional para matches em outros campos
        if (sep.rua && sep.rua.toLowerCase().includes(lowerSearchTerm)) score += 2
        if (sep.quadra && sep.quadra.toLowerCase().includes(lowerSearchTerm)) score += 2
        if (sep.chapa && sep.chapa.toLowerCase().includes(lowerSearchTerm)) score += 2
        
        return { ...sep.toObject(), _score: score }
      })
      
      // Ordenar por score
      scoredResults.sort((a, b) => b._score - a._score)
      
      res.status(200).json({
        sepultado: scoredResults,
        total: scoredResults.length,
        searchTerm: searchTerm,
        suggestions: true
      })
    } else {
      res.status(200).json({
        sepultado: sepultados,
        total: sepultados.length,
        searchTerm: searchTerm,
        suggestions: false
      })
    }

  } catch (error) {
    console.error('Erro na pesquisa:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
}

// Método para busca rápida de sugestões (endpoint separado para melhor performance)
static async getSuggestions(req, res) {
  const { q } = req.query

  if (!q || q.trim() === '' || q.trim().length < 2) {
    res.status(200).json({ suggestions: [] })
    return
  }

  try {
    const searchTerm = q.trim()
    
    // Busca otimizada apenas nos campos mais relevantes
    const suggestions = await Sepultado.find({
      $or: [
        { nome: { $regex: `^${searchTerm}`, $options: 'i' } }, // Começar com o termo
        { nome: { $regex: searchTerm, $options: 'i' } }
      ]
    }, {
      nome: 1,
      rua: 1,
      quadra: 1,
      chapa: 1,
      images: { $slice: 1 }
    })
    .sort({ nome: 1 })
    .limit(5)

    res.status(200).json({
      suggestions: suggestions,
      total: suggestions.length,
      searchTerm: searchTerm
    })

  } catch (error) {
    console.error('Erro ao buscar sugestões:', error)
    res.status(500).json({ suggestions: [] })
  }
}

// Método para busca com autocomplete mais avançado
static async getAutocomplete(req, res) {
  const { q } = req.query

  if (!q || q.trim() === '' || q.trim().length < 2) {
    res.status(200).json({ autocomplete: [] })
    return
  }

  try {
    const searchTerm = q.trim()
    
    // Buscar termos únicos para autocomplete
    const nomes = await Sepultado.distinct('nome', {
      nome: { $regex: searchTerm, $options: 'i' }
    })
    
    const ruas = await Sepultado.distinct('rua', {
      rua: { $regex: searchTerm, $options: 'i' },
      rua: { $ne: null, $ne: '' }
    })
    
    const quadras = await Sepultado.distinct('quadra', {
      quadra: { $regex: searchTerm, $options: 'i' },
      quadra: { $ne: null, $ne: '' }
    })

    // Combinar e limitar resultados
    const autocomplete = [
      ...nomes.slice(0, 3),
      ...ruas.slice(0, 2),
      ...quadras.slice(0, 2)
    ].slice(0, 5)

    res.status(200).json({
      autocomplete: autocomplete,
      searchTerm: searchTerm
    })

  } catch (error) {
    console.error('Erro no autocomplete:', error)
    res.status(500).json({ autocomplete: [] })
  }
}



}

