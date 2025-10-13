import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { connect } from "./src/db/conn.js";
import { User } from "./src/models/User.js";

dotenv.config();
// conecta ao banco usando o helper

await connect();

const [,, command, ...args] = process.argv;

switch (command) {
  case "create":
    await createUser();
    break;
  case "update":
    await updateUser();
    break;
  case "delete":
    await deleteUser();
    break;
  case "list":
    await listUsers();
    break;
  default:
    console.log(`
Comandos disponíveis:
  create     → Cadastrar usuário
  update     → Atualizar usuário
  delete     → Deletar usuário
  list       → Listar todos os usuários
`);
    break;
}

process.exit(0);

// ---------------- FUNÇÕES ----------------

async function createUser() {
  const [user, password, permission] = args;
  if (!user || !password || !permission)
    return console.log("Uso: node cli.js create <user> <senha> <admin|basic>");

  const exists = await User.findOne({ user });
  if (exists) return console.log("❌ Usuário já existe.");

  const hash = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    user,
    password: hash,
    permision: permission,
  });

  console.log("✅ Usuário criado:", newUser.user);
}

async function updateUser() {
  const [user, newPassword, newPermission] = args;
  if (!user)
    return console.log("Uso: node cli.js update <user> [novaSenha] [novaPermissão]");

  const target = await User.findOne({ user });
  if (!target) return console.log("❌ Usuário não encontrado.");

  const updates = {};
  if (newPassword) updates.password = await bcrypt.hash(newPassword, 10);
  if (newPermission) updates.permision = newPermission;

  await User.updateOne({ user }, updates);
  console.log("✅ Usuário atualizado com sucesso.");
}

async function deleteUser() {
  const [user] = args;
  if (!user) return console.log("Uso: node cli.js delete <user>");

  await User.deleteOne({ user });
  console.log("✅ Usuário deletado:", user);
}

async function listUsers() {
  const users = await User.find();
  if (!users.length) return console.log("Nenhum usuário encontrado.");
  console.log("👥 Usuários cadastrados:");
  users.forEach(u => console.log(`- ${u.user} (${u.permision})`));
}
