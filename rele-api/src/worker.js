import express from "express";
import { connect as connectNats } from "nats";
import dotenv from "dotenv";
import axios from "axios";
import mongoose from "mongoose";
import { connect as connectMongo } from "./db/conn.js"; // sua conexão MongoDB

dotenv.config();

const app = express();
app.use(express.json());

const TOKEN = process.env.TOKEN;
const DEVICE_IP = process.env.DEVICE_IP;
const NATS_URL = process.env.NATS_URL || "nats://localhost:4222";

// === Modelo MongoDB para logs ===
const LogSchema = new mongoose.Schema({
  id: String,
  data: String,
  horario: String,
  tipoAcionamento: String,
});
const Log = mongoose.model("logs", LogSchema);

async function main() {
  // conecta no MongoDB
  await connectMongo();
  console.log("Conectado ao MongoDB");

  // conecta no NATS
  const nc = await connectNats({ servers: NATS_URL });
  console.log("Conectado ao NATS");

  // injeta conexão NATS nas rotas
  app.use((req, res, next) => {
    req.nc = nc;
    next();
  });

  // === 1️⃣ Subscriber command → envia comando pro módulo ===
  (async () => {
    const sub = nc.subscribe("command");
    console.log("Aguardando comandos em [command]");

    for await (const msg of sub) {
      try {
        const comando = JSON.parse(msg.data.toString());
        const url = `http://${DEVICE_IP}/api/prd0025/command`;

        const resposta = await axios.post(url, comando, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });

        const data = resposta.data;

        console.log("Comando enviado e resposta:", data);

        // log opcional no NATS
        await nc.publish(
          "logs",
          JSON.stringify({ tipo: "command_sent", comando, resposta: data, timestamp: new Date().toISOString() })
        );
      } catch (err) {
        console.error("Erro ao processar comando:", err.message);
        await nc.publish(
          "logs",
          JSON.stringify({ tipo: "error", erro: err.message, timestamp: new Date().toISOString() })
        );
      }
    }
  })();

  // === 2️⃣ Rota POST /recebe-entradas → salva log no MongoDB ===
  app.post("/recebe-entradas", async (req, res) => {
    const dataAtual = new Date();
    const dataFormatada = `${dataAtual.getDate()}/${dataAtual.getMonth()+1}/${dataAtual.getFullYear()}`;
    const horaFormatada = `${dataAtual.getHours()}:${dataAtual.getMinutes()}:${dataAtual.getSeconds()}`;

    const obj = req.body;

    for (const evento of obj) {
      const status = JSON.parse(evento);

      let tipoAcionamento;
      switch (status.position) {
        case 1:
          tipoAcionamento = "liberar reservatorio";
          break;
        case 2:
          tipoAcionamento = "irrigação sustentável";
          break;
        case 3:
          tipoAcionamento = "irrigação comum";
          break;
        default:
          tipoAcionamento = "desconhecido";
      }

      const logEntry = new Log({
        id: status.id,
        data: dataFormatada,
        horario: horaFormatada,
        tipoAcionamento,
      });

      try {
        await logEntry.save();
        console.log("Log inserido no MongoDB:", logEntry);
      } catch (err) {
        console.error("Erro ao inserir log no MongoDB:", err);
      }
    }

    res.sendStatus(200);
  });

  // === 3️⃣ Função GET status do módulo → publica no tópico status ===
  app.get("/status", async (req, res) => {
    try {
      const url = `http://${DEVICE_IP}/api/prd0025/status`;
      const resposta = await axios.get(url, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });

      const rawText = resposta.data; // ex: "0,1,1,0"
      const formatted = {
        action: "input",
        value: rawText.split(","),
      };

      console.log("Status do módulo:", formatted);
      await nc.publish("status", JSON.stringify(formatted));

      res.json(formatted);
    } catch (err) {
      console.error("Erro ao consultar estado do módulo:", err.message);
      res.status(500).json({ erro: err.message });
    }
  });

  // inicia o Express
  app.listen(3001, () => console.log("Servidor rodando na porta 3001"));
}

main().catch(console.error);
