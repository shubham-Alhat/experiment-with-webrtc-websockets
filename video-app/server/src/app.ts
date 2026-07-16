import express from "express";
import http from "http";

const app = express();

app.use(express.json({ limit: "60kb" }));
app.use(express.urlencoded({ extended: true, limit: "60kb" }));
app.use(express.static("public"));

const server = http.createServer(app);

export default server;
