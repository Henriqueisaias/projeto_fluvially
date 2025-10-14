import { Router } from "express";
import ModuleController from "../controllers/ModuleController.js";

const router = Router();

router.post("/create", ModuleController.create);

router.get("/getAll", ModuleController.getAll);

router.get("/get", ModuleController.getById);

router.put("/update", ModuleController.update);

router.delete("/delete", ModuleController.delete);

router.post("/generateCommand", ModuleController.generateCommand);

export default router;
