import { createContext } from "react";
import useAuth from '../hooks/usuAuth'


const Context = createContext()

function Userprovider({children}){
   const {authenticated,register,logout,login} =useAuth()

   return <Context.Provider value={{authenticated,register,logout,login}}>{children}</Context.Provider>
}

export {Context, Userprovider}


