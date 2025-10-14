// src/controllers/moduleController.js
import { Module } from "../models/Module.js";

export class ModuleController {
  // Criar novo
  static async create(req, res) {
    try {
      const { name, token, ip } = req.body;

      if (!name || name.length !== 4)
        return res.status(400).json({ error: "O campo 'name' deve conter 4 nomes (um para cada porta)." });

      const newModule = await Module.create({ name, token, ip });
      res.status(201).json(newModule);
    } catch (err) {
      console.error("Erro ao criar módulo:", err);
      res.status(500).json({ error: "Erro interno ao criar módulo." });
    }
  }

  // Buscar todos
  static async getAll(req, res) {
    try {
      const modules = await Module.find();
      res.status(200).json(modules);
    } catch (err) {
      console.error("Erro ao listar módulos:", err);
      res.status(500).json({ error: "Erro interno ao listar módulos." });
    }
  }

  // Buscar pelo id
  static async getById(req, res) {
    try {
      const module = await Module.findById(req.params.id);
      if (!module) return res.status(404).json({ error: "Módulo não encontrado." });
      res.status(200).json(module);
    } catch (err) {
      console.error("Erro ao buscar módulo:", err);
      res.status(500).json({ error: "Erro interno ao buscar módulo." });
    }
  }

  // atualizar
  static async update(req, res) {
    try {
      const { name, token, ip } = req.body;
      const updatedModule = await Module.findByIdAndUpdate(
        req.params.id,
        { name, token, ip },
        { new: true }
      );
      if (!updatedModule) return res.status(404).json({ error: "Módulo não encontrado." });
      res.status(200).json(updatedModule);
    } catch (err) {
      console.error("Erro ao atualizar módulo:", err);
      res.status(500).json({ error: "Erro interno ao atualizar módulo." });
    }
  }

//   deletar
  static async delete(req, res) {
    try {
      const deletedModule = await Module.findByIdAndDelete(req.params.id);
      if (!deletedModule) return res.status(404).json({ error: "Módulo não encontrado." });
      res.status(200).json({ message: "Módulo removido com sucesso." });
    } catch (err) {
      console.error("Erro ao excluir módulo:", err);
      res.status(500).json({ error: "Erro interno ao excluir módulo." });
    }
  }

  // Gener comando
  static generateCommand(req, res) {
    try {
      const { mode, position, value } = req.body;

      if (!["pulse", "set"].includes(mode))
        return res.status(400).json({ error: "Modo inválido, use 'pulse' ou 'set'." });
      if (position < 1 || position > 4)
        return res.status(400).json({ error: "A posição deve estar entre 1 e 4." });
      if (![0, 1].includes(value))
        return res.status(400).json({ error: "O valor deve ser 0 ou 1." });

      const command = {
        action: "relay",
        mode,
        position,
        value,
      };

      res.status(200).json(command);
    } catch (err) {
      console.error("Erro ao gerar comando:", err);
      res.status(500).json({ error: "Erro interno ao gerar comando." });
    }
  }
}
