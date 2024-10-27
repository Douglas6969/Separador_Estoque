import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Importar as rotas de usuários e empresas
import useRouter from './routes/users.route.js';
import empresaRouter from './routes/empresa.route.js';

const app = express();

app.use(cors()); // Habilitar CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota para /api/v1/users
app.use('/api/v1/users', useRouter);

// Rota para /api/v1/empresas
app.use('/api/v1/empresa', empresaRouter);

const PORT = process.env.PORT || 5000;

// Inicializar o servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
