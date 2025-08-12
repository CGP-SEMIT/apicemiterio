const Sepultado = require("../models/Sepultado") // Importa o model Mongoose do Sepultado
const mongoose = require("mongoose") // Importa o mongoose para usar ObjectId e conexões

//helpers
const getToken = require("../helpers/get-token-js") // Função que extrai o token da requisição
const getUserBytoken = require("../helpers/get-user-by-token") // Função que obtém usuário com base no token
const ObjectId = require("mongoose").Types.ObjectId // Atalho para validar ObjectId do MongoDB

// Função auxiliar para remover acentos e caracteres especiais - CORRIGIDA
const removeAccents = (str) => {
  if (!str) return '';
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacríticos
    .toLowerCase()
    .trim();
};

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
            const user = await getUserBytoken(token);

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
        try {
            const token = getToken(req)
            const user = await getUserBytoken(token)

            const sepults = await Sepultado.find({"user._id": user._id}).sort("-createdAt")

            res.status(200).json({
                sepults,
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    // Endpoint opcional — parece ser um esboço para futuras funcionalidades
    static async getAllInformacoes(req,res){
        try {
            const token = getToken(req)
            const user = await getUserBytoken(token)

            // const sepults =await Sepultado.find({"solicitante._id": user._id}).sort("-createdAt") // comentado

            res.status(200).json({
                sepults: [], // Array vazio por enquanto
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
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

        try {
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

            // Recupera o usuário autenticado com base no token
            const user = await getUserBytoken(token);

            // Logs de debug para verificar o ID do usuário do sepultado e o usuário atual autenticado
            console.log("Sepultado user ID:", sepultado.user._id.toString());
            console.log("Current user ID:", user._id.toString());

            // Verifica se o usuário autenticado é o dono do sepultado
            if (sepultado.user._id.toString() !== user._id.toString()) {
                return res.status(403).json({ 
                    message: "Acesso negado. Você não tem permissão para excluir este sepultado."
                });
            }

            // Remove o sepultado do banco de dados
            await Sepultado.findByIdAndDelete(id);

            // Retorna sucesso na exclusão
            res.status(200).json({ message: "Sepultado removido com sucesso!" });
        } catch (error) {
            console.error("Erro ao remover sepultado:", error);
            // Em caso de erro interno, retorna erro 500
            res.status(500).json({ message: error.message });
        }
    }

    // *****************************************EDITAR*************************************************************************************************************

    static async updateSep(req,res){
        const id = req.params.id

        try {
            console.log(id)

            // Extrai os campos do corpo da requisição
            const { cemiterio, chapa, dtFal, dtNasc, idade, mae, nacionalidade, nome, pai, quadra, rua, image, available, tipoSepultura, epitafio, latitude, longitude } = req.body
            const images = req.files || [];

            const updatedData = {}

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
                updatedData.nome = nome
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
                updatedData.mae = mae
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
            
            // Processa imagens se enviadas
            if (images && Array.isArray(images) && images.length > 0) {
                updatedData.images = images.map(image => image.filename);
            }

            await Sepultado.findByIdAndUpdate(id, updatedData, { new: true });

            res.status(200).json({ message: "Registro atualizado com sucesso!" });

        } catch (error) {
            console.error("Erro ao atualizar sepultado:", error);
            res.status(500).json({ message: error.message });
        }
    }

    static async schedule(req,res){
        try {
            const id = req.params.id

            // Verifica que o sepultado existe
            const sepultado = await Sepultado.findOne({_id:id})
            if(!sepultado){
                res.status(404).json({message: "Registro não encontrado!"})
                return
            }

            const token = getToken(req)
            const user = await getUserBytoken(token)

            // Verifica se o sepultado ja esta registrado no usuario
            if(sepultado.user._id.equals(user._id)){
                res.status(422).json({
                message:"Você já é o usuário responsavel por este sepultado"
                })
                return
            }

            // Verifica se há uma outra requisição 
            if(sepultado.adopter){
                if(sepultado.adopter._id.equals(user._id)){
                    res.status(422).json({
                        message: "Você já solicitou a adoção de responsabilidade sobre este sepultado!"
                    })
                    return
                }
            }

            // Adicionando usuario como responsavel do sepultado
            sepultado.adopter = {
                _id: user._id,
                name: user.name,
                image: user.image
            }

            await Sepultado.findByIdAndUpdate(id,sepultado)
            res.status(200).json({
                message: `A visita foi agendada com sucesso, entre em contato com o ${sepultado.cemiterio}, pelo telefone (14) 3471-0233`
            })

        } catch (error) {
            console.error("Erro ao agendar visita:", error);
            res.status(500).json({ message: error.message });
        }
    }

    static async concludeAdoption(req, res) {
        const id = req.params.id;

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
            console.error("Erro ao concluir adoção:", error);
            res.status(500).json({ message: "Erro ao concluir a adoção." });
        }
    }

    // Método otimizado para pesquisa dinâmica com sugestões - CORRIGIDO
    static async searchSepultados(req, res) {
        const { q, limit = 10, suggestions = false } = req.query

        if (!q || q.trim() === "") {
            res.status(400).json({ message: "Termo de pesquisa é obrigatório!" })
            return
        }

        try {
            const searchTerm = removeAccents(q.trim());
            const originalTerm = q.trim(); // Manter termo original também
            
            // Para sugestões, limitamos a 5 resultados. Para pesquisa completa, usar o limit
            const limitNum = suggestions === "true" ? 5 : parseInt(limit);
            
            // Definir a projeção para os campos que você precisa retornar
            const projection = {
                nome: 1,
                rua: 1,
                quadra: 1,
                chapa: 1,
                images: { $slice: 1 }, // Apenas a primeira imagem
                dtFal: 1,
                dtNasc: 1,
                idade: 1,
                mae: 1,
                pai: 1,
                cemiterio: 1,
                epitafio: 1
            }

            // Construir a query de busca - MELHORADA para capturar acentos
            const searchQuery = {
                $or: [
                    // Busca com termo original (com acentos)
                    { nome: { $regex: originalTerm, $options: "i" } },
                    { rua: { $regex: originalTerm, $options: "i" } },
                    { quadra: { $regex: originalTerm, $options: "i" } },
                    { chapa: { $regex: originalTerm, $options: "i" } },
                    { mae: { $regex: originalTerm, $options: "i" } },
                    { pai: { $regex: originalTerm, $options: "i" } },
                    
                    // Busca com termo sem acentos
                    { nome: { $regex: searchTerm, $options: "i" } },
                    { rua: { $regex: searchTerm, $options: "i" } },
                    { quadra: { $regex: searchTerm, $options: "i" } },
                    { chapa: { $regex: searchTerm, $options: "i" } },
                    { mae: { $regex: searchTerm, $options: "i" } },
                    { pai: { $regex: searchTerm, $options: "i" } }
                ]
            }

            let query = Sepultado.find(searchQuery, projection)
                .sort({ nome: 1 })
            
            // Aplicar limite se especificado
            if (limitNum > 0) {
                query = query.limit(limitNum)
            }

            const sepultados = await query.exec();

            // Para sugestões, adicionar score de relevância
            if (suggestions === "true") {
                const scoredResults = sepultados.map(sep => {
                    let score = 0
                    const lowerSearchTerm = searchTerm
                    const lowerOriginalTerm = originalTerm.toLowerCase()
                    const lowerNome = removeAccents(sep.nome)
                    const originalNome = sep.nome.toLowerCase()
                    
                    // Score mais alto para matches exatos no início
                    if (originalNome.startsWith(lowerOriginalTerm) || lowerNome.startsWith(lowerSearchTerm)) {
                        score += 15
                    } else if (originalNome.includes(lowerOriginalTerm) || lowerNome.includes(lowerSearchTerm)) {
                        score += 10
                    }
                    
                    // Score adicional para matches em outros campos
                    const fieldsToCheck = ['rua', 'quadra', 'chapa', 'mae', 'pai'];
                    fieldsToCheck.forEach(field => {
                        if (sep[field]) {
                            const fieldValue = sep[field].toLowerCase();
                            const fieldValueNoAccent = removeAccents(sep[field]);
                            if (fieldValue.includes(lowerOriginalTerm) || fieldValueNoAccent.includes(lowerSearchTerm)) {
                                score += 3;
                            }
                        }
                    });
                    
                    return { ...sep.toObject(), _score: score }
                })
                
                // Remover duplicatas baseado no _id
                const uniqueResults = scoredResults.filter((item, index, self) => 
                    index === self.findIndex(t => t._id.toString() === item._id.toString())
                );
                
                // Ordenar por score
                uniqueResults.sort((a, b) => b._score - a._score)
                
                res.status(200).json({
                    sepultado: uniqueResults,
                    total: uniqueResults.length,
                    searchTerm: originalTerm,
                    suggestions: true
                })
            } else {
                // Remover duplicatas para pesquisa normal também
                const uniqueResults = sepultados.filter((item, index, self) => 
                    index === self.findIndex(t => t._id.toString() === item._id.toString())
                );
                
                res.status(200).json({
                    sepultado: uniqueResults,
                    total: uniqueResults.length,
                    searchTerm: originalTerm,
                    suggestions: false
                })
            }

        } catch (error) {
            console.error("Erro na pesquisa:", error)
            res.status(500).json({ message: "Erro interno do servidor" })
        }
    }

    // Método para busca rápida de sugestões - CORRIGIDO
    static async getSuggestions(req, res) {
        const { q } = req.query

        if (!q || q.trim() === "" || q.trim().length < 2) {
            res.status(200).json({ suggestions: [] })
            return
        }

        try {
            const searchTerm = removeAccents(q.trim());
            const originalTerm = q.trim();
            
            // Busca otimizada com ambos os termos
            const suggestions = await Sepultado.find({
                $or: [
                    { nome: { $regex: `^${originalTerm}`, $options: "i" } }, // Começar com o termo original
                    { nome: { $regex: `^${searchTerm}`, $options: "i" } },   // Começar com termo sem acento
                    { nome: { $regex: originalTerm, $options: "i" } },       // Contém termo original
                    { nome: { $regex: searchTerm, $options: "i" } }          // Contém termo sem acento
                ]
            }, {
                nome: 1,
                rua: 1,
                quadra: 1,
                chapa: 1,
                images: { $slice: 1 }
            })
            .sort({ nome: 1 })
            .limit(8) // Buscar um pouco mais para depois remover duplicatas

            // Remover duplicatas
            const uniqueSuggestions = suggestions.filter((item, index, self) => 
                index === self.findIndex(t => t._id.toString() === item._id.toString())
            ).slice(0, 5); // Limitar a 5 após remoção de duplicatas

            res.status(200).json({
                suggestions: uniqueSuggestions,
                total: uniqueSuggestions.length,
                searchTerm: originalTerm
            })

        } catch (error) {
            console.error("Erro ao buscar sugestões:", error)
            res.status(500).json({ suggestions: [] })
        }
    }

    // Método para busca com autocomplete mais avançado - CORRIGIDO
    static async getAutocomplete(req, res) {
        const { q } = req.query

        if (!q || q.trim() === "" || q.trim().length < 2) {
            res.status(200).json({ autocomplete: [] })
            return
        }

        try {
            const searchTerm = removeAccents(q.trim());
            const originalTerm = q.trim();
            
            // Buscar termos únicos para autocomplete com ambas as versões
            const nomes = await Sepultado.distinct("nome", {
                $or: [
                    { nome: { $regex: searchTerm, $options: "i" } },
                    { nome: { $regex: originalTerm, $options: "i" } }
                ]
            })
            
            const ruas = await Sepultado.distinct("rua", {
                $and: [
                    { rua: { $ne: null, $ne: "" } },
                    {
                        $or: [
                            { rua: { $regex: searchTerm, $options: "i" } },
                            { rua: { $regex: originalTerm, $options: "i" } }
                        ]
                    }
                ]
            })
            
            const quadras = await Sepultado.distinct("quadra", {
                $and: [
                    { quadra: { $ne: null, $ne: "" } },
                    {
                        $or: [
                            { quadra: { $regex: searchTerm, $options: "i" } },
                            { quadra: { $regex: originalTerm, $options: "i" } }
                        ]
                    }
                ]
            })

            // Combinar e limitar resultados, removendo duplicatas
            const allTerms = [
                ...nomes.slice(0, 4),
                ...ruas.slice(0, 3),
                ...quadras.slice(0, 3)
            ];
            
            // Remover duplicatas e limitar
            const autocomplete = [...new Set(allTerms)].slice(0, 8);

            res.status(200).json({
                autocomplete: autocomplete,
                searchTerm: originalTerm
            })

        } catch (error) {
            console.error("Erro no autocomplete:", error)
            res.status(500).json({ autocomplete: [] })
        }
    }
}