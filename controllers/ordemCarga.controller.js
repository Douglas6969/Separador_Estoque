import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Função para listar as ordens de carga
const listarOrdemCarga = async (req, res) => {
  const token = process.env.SANKHYA_BEARER_TOKEN; // Agora pegando o bearer token do .env
  const appkey = process.env.SANKHYA_APPKEY;

  if (!token) {
    return res.status(400).json({ error: 'Bearer token não encontrado no arquivo .env' });
  }

  try {
    // Exemplo de corpo da requisição para a API Sankhya
    const requestBody = {
      "serviceName": "CRUDServiceProvider.loadRecords",
      "requestBody": {
        "dataSet": {
          "rootEntity": "CabecalhoNota",
          "includePresentationFields": "S",
          "offsetPage": "0",
          "criteria": {
            "expression": {
              "$": "(this.DTNEG = ? )" // Exemplo de filtro pela data
            },
            "parameter": {
              "$": "16/08/2024", // Exemplo de data, você pode ajustar conforme necessário
              "type": "D"
            }
          },
          "entity": {
            "fieldset": {
              "list": "NUNOTA,CODEMP,CODPARC,DTNEG,QTDVOL" // Seleção de campos
            }
          }
        }
      }
    };

    const response = await axios.post(
      'https://api.sandbox.sankhya.com.br/gateway/v1/mge/service.sbr?serviceName=CRUDServiceProvider.loadRecords&outputType=json',
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'appkey': appkey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Exibe a resposta completa para depuração
    console.log('Resposta da API:', response.data);
    
    // Verifica se a resposta contém a estrutura correta
    if (response.data && response.data.responseBody && response.data.responseBody.entities) {
      const ordens = response.data.responseBody.entities.entity; // Acessa a lista de ordens
      console.log('Ordens de carga:', ordens);
      return res.json({ ordens });
    } else {
      console.error('Resposta inesperada:', response.data);
      return res.status(500).json({ error: 'Erro ao listar ordens de carga' });
    }
    
   } catch{}}

export { listarOrdemCarga };


