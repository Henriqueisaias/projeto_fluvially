import dotenv from "dotenv";
import { initNats } from "./nats/natsClient.js";

dotenv.config();

async function main() {
  const nc = await initNats();

  const comandoTeste = {
    action: "relay",
    mode: "pulse",
    position: 3,
    value: 2000
  };

  console.log("📝 Publicando comando no NATS...");
  await nc.publish("command", JSON.stringify(comandoTeste));

  console.log("✅ Comando publicado!");
  process.exit(0);
}

main();
