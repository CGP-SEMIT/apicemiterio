const jwt = require('jsonwebtoken')
const getToken = require('./get-token-js');

//middleware to validate token
const chektoken = (req,res,next) =>{

    if(!req.headers.authorization){
       return res.status(401).json({message:'Acesso Negado!'})  
    }

    console.log(req.headers)
    const token = getToken(req)

    if(!token){
        return res.status(401).json({message:'Acesso Negado!'})
    }

  try {

    const verified = jwt.verify(token, 'nossosecret')
   req.user = verified // ✅ nome correto

    next()
    
  } catch (err) {
     return res.status(400).json({message:'Token Inválido!'})  
  }



}
module.exports = chektoken;
