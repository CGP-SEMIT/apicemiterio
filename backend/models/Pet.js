 const mongoose = require('../db/conn')
 const {Schema} = mongoose

 const Pet = mongoose.model(
    'Pet',
    new Schema({
        name:{
            type:String,
            required: true
        }, 
        age:{
            type:number,
            required: true
        },
         weight:{
            type:number,
            required: true
        },
         color:{
            type:String,
            required:true
            
        },
         image:{
            type:Array,
            required: true
        },
        name:{
            type:Boolean,
            
        }, 
        user: Object,
        adopter: Object

    },{timestamps:true})
 )

  module.exports = User