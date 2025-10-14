import { connect } from 'nats';

async function sendTestCommand() {
  const nc = await connect({ servers: "nats://localhost:4222" });
  
  const comando = {
    action: "relay",
    mode: "pulse",
    position: 1,
    value: 500
  };

  nc.publish("comandos.rele", JSON.stringify(comando));
  console.log("✅ Comando publicado no NATS");

  await nc.flush();
  await nc.close();
}

sendTestCommand();
