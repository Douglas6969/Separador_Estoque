import bcryptjs from 'bcryptjs'
import { usuarioModel } from "../models/users.model.js";
import jwt from 'jsonwebtoken'
import { authController } from '../controllers/auth.controller.js'; // Importa a função de login na Sankhya




// /api/v1/users/register
const register = async(req, res)=>{
    try{
        
        const {ds_usuario, ds_senha, ds_email}= req.body
        
        // criar uma validacao melhor 
        if(!ds_usuario || !ds_senha || !ds_email){
            return res.status(400).json({ok: false , msg:"algo esta errado"})
        }

        const user = await usuarioModel.findOneByUsuario(ds_usuario)
        if(user){
            return res.status(409).json({ok:false, msg:"User ja existe"})
        }
            //contra senha 
            const salt = await bcryptjs.genSalt(10)
            const hashedPassword = await bcryptjs.hash(ds_senha, salt)


            const newUser = await usuarioModel.create({ds_usuario, ds_senha: hashedPassword, ds_email})

            //jwt segurança revisar mais tarde
            const token = jwt.sign({ ds_usuario: newUser.ds_usuario },
            process.env.JWT_SECRET,
            //expira token 
            {
                expiresIn:"1h"
            }    
        )

        return res.status(201).json({ok: true, msg:token})     
    }catch(error){
        console.log(error)
        return res.status(500).json({
            ok:false,
            meg:'error serve'
        })
    }
}

// /api/v1/users/register/login
const login = async (req, res) => {
    try {
        const { ds_usuario, ds_senha } = req.body;

        if (!ds_usuario || !ds_senha) {
            return res.status(400).json({ error: "Campos em branco: usuário, senha" });
        }

        // 1️⃣ Verifica se o usuário existe no banco
        const user = await usuarioModel.findOneByUsuario(ds_usuario);
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        // 2️⃣ Compara a senha
        const isMatch = await bcryptjs.compare(ds_senha, user.ds_senha);
        if (!isMatch) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        // 3️⃣ Gera o JWT local
        const token = jwt.sign(
            { ds_usuario: user.ds_usuario },
            process.env.JWT_SECRET,
            { expiresIn: "1h" } // Token local expira em 1 hora
        );

        // 4️⃣ Faz login na Sankhya
        let bearerToken;
        try {
            bearerToken = await authController.loginToSankhya();
        } catch (err) {
            console.error("Erro ao autenticar na Sankhya:", err);
            return res.status(500).json({ error: "Erro ao autenticar na Sankhya" });
        }

        // 5️⃣ Retorna os tokens (local + Sankhya)
        return res.json({
            ok: true,
            msg: "Login realizado com sucesso",
            token,         // Token JWT local
            bearerToken    // Token da Sankhya
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: "Erro no servidor"
        });
    }
}

const deletar = async (req, res) => {
    try {
        const { id_usuario } = req.body;

        // Excluindo o usuário usando o método do modelo (ajuste conforme necessário)
        const user = await usuarioModel.deletarUser(id_usuario);

        if (!user) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }

        return res.status(200).json({
            mensagem: "Sucesso ao deletar usuário"
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            mensagem: "Erro ao deletar usuário"
        });
    }
};



export const usuarioController = {
    register,
    login,
    deletar
}