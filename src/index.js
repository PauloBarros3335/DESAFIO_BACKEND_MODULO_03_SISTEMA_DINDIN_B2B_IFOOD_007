const express = require("express");
const rotas = require("./rotas/rotas");
const app = express();
require("dotenv").config();
app.use(express.json());

app.use(rotas);

app.listen(process.env.SERVER_PORT, () => {
  console.log(
    `servidor rodando na porta http://localhost:${process.env.SERVER_PORT}`
  );
});
