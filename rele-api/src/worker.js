import { connect } from 'nats';
import dotenv from 'dotenv';


dotenv.config(); // carrega variáveis do .env

const TOKEN = process.env.TOKEN;
const DEVICE_IP = process.env.DEVICE_IP;
const SUBJECT = process.env.SUBJECT;
const NATS_URL = process.env.NATS_URL;

async function start() {
  try {
    const nc = await connect({ servers: NATS_URL });
    console.log('Conectado ao NATS');

    const sub = nc.subscribe(SUBJECT);
    console.log(`Aguardando mensagens em [${SUBJECT}]`);

    for await (const msg of sub) {
      try {
        const comando = JSON.parse(msg.data.toString());
        console.log('Recebido comando:', comando);

        // const url = `http://${DEVICE_IP}/api/prd0025/command`;

        const url = `http://${DEVICE_IP}/api/prd0025/command`;

        const resposta = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`,
          },
          body: JSON.stringify(comando),
        });

        const text = await resposta.text();

        try {
          const data = JSON.parse(text);
          console.log('Resposta do módulo:', data);
        } catch {
          console.log('Resposta (não JSON):', text);
        }
      } catch (err) {
        console.error('Erro ao processar comando:', err);
      }
    }
  } catch (err) {
    console.error('Erro ao conectar ao NATS:', err);
  }
}




start();
