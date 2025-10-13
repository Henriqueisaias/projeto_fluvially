import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connect } from "./db/conn.js";
dotenv.config();


const app = express();

app.use(express.json());
//parse de json

app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL }));
//erro de cors

await connect()

app.listen(process.env.PORT, () => {
    console.log(`servidor rodando na porta ${process.env.PORT}`)
});