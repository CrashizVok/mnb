import express from "express";
import handler from "./api/rates.js";

const app = express();
app.get("/api/rates", handler);
app.listen(3001, () => console.log("API: http://localhost:3001/api/rates"));
