import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  data: String,
  horario: String,
  tipoAcionamento: String,
});

const Log = mongoose.model("logs", LogSchema);

export async function saveLog(logData) {
  try {
    const log = new Log(logData);
    await log.save();
    console.log("🗒️ Log inserido no MongoDB:", log);
  } catch (err) {
    console.error("❌ Erro ao inserir log:", err.message);
  }
}
