import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config(); // Carrega as variáveis de ambiente

let storedBearerToken = ''; // Variável para armazenar o bearerToken

const loginToSankhya = async () => {
  const token = process.env.SANKHYA_TOKEN;
  const appkey = process.env.SANKHYA_APPKEY;
  const username = process.env.SANKHYA_USERNAME;
  const password = process.env.SANKHYA_PASSWORD;

  console.log('Parâmetros da requisição:', {
    token,
    appkey,
    username,
    password
  });

  try {
    const response = await axios.post('https://api.sandbox.sankhya.com.br/login', {}, {
      headers: {
        'token': token,
        'appkey': appkey,
        'username': username,
        'password': password
      }
    });

    console.log(response.data); // Exibe a resposta completa

    // Captura o bearerToken
    storedBearerToken = response.data.bearerToken;
    console.log('Bearer Token Armazenado:', storedBearerToken);

    // Atualiza o .env com o novo Bearer Token
    updateEnvFile(storedBearerToken);

    return storedBearerToken;
  } catch (error) {
    if (error.response) {
      console.error('Erro na requisição:', error.response.data);
    } else {
      console.error('Erro:', error.message);
    }
    throw error; // Propaga o erro para quem chamar a função
  }
};

// Função para atualizar o .env com o Bearer Token
const updateEnvFile = (bearerToken) => {
  const envFilePath = '.env';

  // Lê o conteúdo atual do arquivo .env
  fs.readFile(envFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo .env', err);
      return;
    }

    // Adiciona ou atualiza o Bearer Token no arquivo .env
    const newEnvData = data.replace(/SANKHYA_BEARER_TOKEN=.*/, `SANKHYA_BEARER_TOKEN=${bearerToken}`);

    // Caso a variável não exista no .env, adiciona ela
    if (!newEnvData.includes('SANKHYA_BEARER_TOKEN=')) {
      newEnvData += `\nSANKHYA_BEARER_TOKEN=${bearerToken}`;
    }

    // Grava o novo conteúdo no arquivo .env
    fs.writeFile(envFilePath, newEnvData, 'utf8', (err) => {
      if (err) {
        console.error('Erro ao escrever no arquivo .env', err);
      } else {
        console.log('Bearer Token atualizado no arquivo .env');
      }
    });
  });
};

export { loginToSankhya };


const logoutFromSankhya = async () => {
  if (!storedBearerToken) {
    console.log('Erro: Nenhum token encontrado, faça login primeiro.');
    return;
  }

  try {
    const response = await axios.post(
      'https://api.sandbox.sankhya.com.br/gateway/v1/mge/service.sbr?serviceName=MobileLoginSP.logout&outputType=json',
      {}, // Corpo da requisição vazio
      {
        headers: {
          'appkey': process.env.SANKHYA_APPKEY,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedBearerToken}` // Token armazenado
        }
      }
    );

    console.log('Logout realizado com sucesso:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao fazer logout da Sankhya:', error.response?.data || error.message);
    throw error;
  }
};

const authController = {
  loginToSankhya,
  logoutFromSankhya
};

export { authController };
