
const mongoose = require('../db/conn') // ajuste se necessário
const Sepultado = require('../models/Sepultado') // ajuste o caminho se necessário
const { Types } = require('mongoose')

function limparIdade(idade) {
  if (!idade) return ""
  const somenteNumeros = idade.replace(/\D/g, '') // remove tudo que não for número
  return somenteNumeros || ""
}

async function padronizarSepultados() {
  try {
    const sepultados = await Sepultado.find()

    for (const sep of sepultados) {
      const update = {}

      // Campos string
      const camposString = ['nome', 'cemiterio', 'chapa', 'dtFal', 'dtNasc', 'mae', 'nacionalidade', 'pai', 'quadra', 'tipoSepultura', 'rua', 'epitafio']
      const valoresPadraoString = {
        tipoSepultura: "",
        epitafio: "Descanse em paz",
      }

      for (const campo of camposString) {
        if (sep[campo] === undefined || sep[campo] === null || sep[campo] === '') {
          update[campo] = valoresPadraoString[campo] || ""
        }
      }

      // Campo idade tratado para conter só números
      const idadeLimpa = limparIdade(sep.idade)
      if (sep.idade !== idadeLimpa) {
        update.idade = idadeLimpa
      }
      if (sep.idade === undefined) {
        update.idade = ""
      }

      // Booleanos
      if (sep.moderacao === undefined) update.moderacao = false
      if (sep.available === undefined) update.available = true

      // Arrays
      if (!Array.isArray(sep.comentarios)) update.comentarios = []
      if (!Array.isArray(sep.images) || sep.images.length === 0) update.images = ['default.jpg']

      // Campo user
      if (typeof sep.user !== 'object' || sep.user === null) {
        update.user = {
          _id: new Types.ObjectId(),
          name: "",
          image: "",
          phone: ""
        }
      } else {
        const userUpdate = {}
        if (!sep.user._id) userUpdate._id = new Types.ObjectId()
        if (!sep.user.name) userUpdate.name = ""
        if (!sep.user.image) userUpdate.image = ""
        if (!sep.user.phone) userUpdate.phone = ""
        if (Object.keys(userUpdate).length > 0) {
          update.user = {...sep.user, ...userUpdate}
        }
      }

      if (Object.keys(update).length > 0) {
        await Sepultado.updateOne({_id: sep._id}, {$set: update})
        console.log(`✔ Atualizado: ${sep.nome || sep._id}`)
      } else {
        console.log(`↪ Sem alterações: ${sep.nome || sep._id}`)
      }
    }

    console.log('✅ Padronização finalizada.')
    mongoose.connection.close()
  } catch (error) {
    console.error('❌ Erro ao padronizar:', error)
    mongoose.connection.close()
  }
}

padronizarSepultados()
