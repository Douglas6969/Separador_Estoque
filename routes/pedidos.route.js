import express from 'express';
import { listarOrdemCarga } from '../controllers/ordemCarga.controller.js'; // Importe o controlador

const router = express.Router();

// Rota para listar a ordem de carga
router.get('/ordem-carga', listarOrdemCarga);

export default router; // Exporte o router
