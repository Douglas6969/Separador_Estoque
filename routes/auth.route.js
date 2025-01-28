// auth.route.js
import express from 'express';
import { authController } from '../controllers/auth.controller.js'; // Importação correta

const router = express.Router();

// login Sankhya 
router.post('/login', async (req, res) => {
  try {
    const token = await authController.loginToSankhya(); // Utiliza o método de authController

    if (!token) {
      return res.status(401).json({ error: 'Falha na autenticação' });
    }

    res.json({ message: 'Autenticado com sucesso', token });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});


//logout 
router.post('/logout', authController.logoutFromSankhya);

export default router;
