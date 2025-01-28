import dotenv from 'dotenv';

import express from 'express';
import cors from 'cors';

// Importar as rotas de usuários e empresas
import useRouter from './routes/users.route.js';
import authRoutes from './routes/auth.route.js'; 
import { listarOrdemCarga } from './controllers/ordemCarga.controller.js';

dotenv.config();
const app = express();



app.use(cors()); // Habilitar CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota para /api/v1/users
app.use('/api/v1/users', useRouter);



app.use('/api', authRoutes);

// Rota para listar a ordem de carga
app.get('/api/ordem-carga', listarOrdemCarga);

const PORT = process.env.PORT || 5000;

// Inicializar o servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
