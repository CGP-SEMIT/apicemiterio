const mongoose = require('../db/conn')
const { Schema } = mongoose

const Sepultado = mongoose.model(
  'Sepultado',
  
  new Schema({


 id: {
      type: String,
      required: false
    },

    nome: {
      type: String,
      required: true
    },
    cemiterio: {
      type: String,
      required: false
    },
    chapa: {
      type: String,
      required: true
    },
     idade: {
      type: String,
    
    },
    dtFal: {
      type: String,
      required: true
    },
    dtNasc: {
      type: String,
      required: true
    },
    mae: {
      type: String,
      required: true
    },
    nacionalidade: {
      type: String,
      required: true
    },
    pai: {
      type: String,
      required: true
    },
    moderacao: {
      type: Boolean,
    
    },
    latitude: {
      type: Number,
      required: false
    },
    longitude: {
      type: Number,
     required: false
    },
    quadra: {
      type: String,
      required: true
    },
    tipoSepultura:{
      type: String,
      required:false
    },
    rua: {
      type: String,
      required: true
    },
    epitafio: {
      type: String,
      required: false, // pode ser opcional
      trim: true,
    },
    comentarios: [
      {
        nome: {
          type: String,
          required: true,
          trim: true
        },
        mensagem: {
          type: String,
          required: true,
          trim: true,
          maxlength: 1000
        },
        data: {
          type: Date,
          default: Date.now
        }
      }
    ]
    ,

     available:{
      type:Boolean
     },

    images: {
      type: [String], // agora aceita array de strings
      required: false
    }
    ,
    user: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      image: {
        type: String
      },
      phone: {
        type: String
      }
    },



  }, { timestamps: true })
)

module.exports = Sepultado