import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Função para listar as ordens de carga com a consulta SQL específica
const listarOrdemCarga = async (req, res) => {
  const token = process.env.SANKHYA_BEARER_TOKEN; // Bearer Token
  const appkey = process.env.SANKHYA_APPKEY; // AppKey

  try {
    // Consulta SQL corrigida
    const sqlQuery = `
      SELECT 
          TO_CHAR(CAB.DTNEG, 'DD/MM/YYYY') AS "Data",
          CAB.NUNOTA AS "Nro_Unico",
          PAR.RAZAOSOCIAL || ' - ' || CAB.CODPARC AS "Cliente",
          NVL(CAB.AD_ORDEMCARGANEW, 0) AS "Ordem_Carga",
          CAB.QTDVOL AS "Qtd_Vol",
          TRA.RAZAOSOCIAL || ' - ' || CAB.CODPARCTRANSP AS "Transportadora",
          EMP.RAZAOSOCIAL AS "Nome_Empresa",
          CASE 
              WHEN CAB.AD_STATUSDACONFERENCIA = '1' THEN 'Aguardando Conferência'
              WHEN CAB.AD_STATUSDACONFERENCIA = '7' THEN 'Conferência Iniciada'
              WHEN CAB.AD_STATUSDACONFERENCIA = '3' THEN 'Divergência Encontrada'
              ELSE 'Outro Status'
          END AS "Status",
          CAB.AD_DS_MOTIVODIV AS "Motivo",
          TOP.DESCROPER || ' - ' || CAB.CODTIPOPER AS "Top",
          PRODUTOS.CODPRODS AS "Codigo_Produtos", 
          CAB.NUNOTA,
          CAB.NUMCONTRATO
      FROM TGFCAB CAB
          INNER JOIN TSIEMP EMP ON EMP.CODEMP = CAB.CODEMP
          INNER JOIN TGFPAR PAR ON PAR.CODPARC = CAB.CODPARC
          LEFT JOIN TGFPAR TRA ON TRA.CODPARC = CAB.CODPARCTRANSP
          INNER JOIN TGFTOP TOP ON TOP.CODTIPOPER = CAB.CODTIPOPER AND TOP.DHALTER = CAB.DHTIPOPER
          LEFT JOIN (
              SELECT ITE.NUNOTA,
                  LISTAGG(PRO.CODPROD, ', ') WITHIN GROUP (ORDER BY PRO.CODPROD) AS CODPRODS  
              FROM TGFITE ITE
              INNER JOIN TGFPRO PRO ON PRO.CODPROD = ITE.CODPROD
              GROUP BY ITE.NUNOTA
          ) PRODUTOS ON PRODUTOS.NUNOTA = CAB.NUNOTA
      WHERE CAB.CODTIPOPER IN (1000, 1003, 1005)
        AND CAB.PENDENTE = 'S'
    `;

    // Corpo da requisição
    const requestBody = {
      serviceName: 'DbExplorerSP.executeQuery',
      mgeSession: 'jsessionid',
      requestBody: {
        sql: sqlQuery
      }
    };

    // Requisição para a API da Sankhya
    const response = await axios.post(
      'https://api.sandbox.sankhya.com.br/gateway/v1/mge/service.sbr?serviceName=DbExplorerSP.executeQuery&outputType=json',
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'appkey': appkey
        }
      }
    );

    // Log da resposta para depuração
    console.log('Resposta da API:', response.data);

    // Verifica se a resposta possui o corpo esperado
    if (response.data?.status === '1' && response.data.responseBody) {
      const { rows } = response.data.responseBody;

      // Loga as linhas para verificação
      console.log('Linhas retornadas:', rows);

      if (Array.isArray(rows) && rows.length > 0) {
        // Mapeia as linhas retornadas corretamente
        const result = rows.map((row) => ({
          DTNEG: row[0] || null,        // Data
          NUNOTA: row[1] || null,       // Número único
          CLIENTE: row[2] || null,      // Cliente
          ORDEM_CARGA: row[3] || null,  // Ordem de carga
          QTDVOL: row[4] || null,       // Quantidade de volumes
          TRANSPORTADORA: row[5] || null, // Transportadora
          NOME_EMPRESA: row[6] || null,   // Nome da empresa
          STATUS: row[7] || null,       // Status da conferência
          MOTIVO: row[8] || null,       // Motivo
          TOP: row[9] || null,          // Tipo de operação
          CODIGO_PRODUTOS: row[10] || null, // Código dos produtos
          NUNOTA_DUPLA: row[11] || null, // Número único (duplicado)
          NUMCONTRATO: row[12] || null  // Número do contrato
        }));

        // Retorna as ordens
        return res.json({ ordens: result });
      } else {
        // Caso não haja resultados
        console.log('Nenhuma ordem de carga encontrada');
        return res.status(404).json({ error: 'Nenhuma ordem de carga encontrada' });
      }
    } else {
      // Se a resposta não for a esperada ou não tiver o status correto
      console.error('Erro na resposta da API:', response.data?.statusMessage || 'Desconhecido');
      return res.status(500).json({ error: 'Erro ao processar a resposta da API' });
    }
  } catch (error) {
    // Loga o erro detalhadamente
    console.error('Erro ao listar ordens de carga:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Erro ao listar ordens de carga' });
  }
};

export { listarOrdemCarga };
