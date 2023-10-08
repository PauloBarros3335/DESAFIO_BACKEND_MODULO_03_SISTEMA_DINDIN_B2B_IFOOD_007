const express = require("express");
const {
  cadastrarUsuario,
  fazerLogin,
  perfilUsuarioLogado,
  editarUsuarioLogado,
} = require("../controladores/usuarios");
const {
  detalharTransacao,
  cadastrarTransacao,
  editarTransacao,
  excluirTransacao,
  obterExtrato,
  listarTransacoes,
} = require("../controladores/transacoes");
const { listarCategorias } = require("../controladores/categorias");
const { validarAutenticacao } = require("../intermediarios/autenticacao");
const rotas = express();

rotas.post("/usuario", cadastrarUsuario);
rotas.post("/login", fazerLogin);

rotas.use(validarAutenticacao);

//Categorias

rotas.get("/categoria", listarCategorias);
//Transacoes
rotas.post("/transacao", cadastrarTransacao);

//Transacoes
rotas.get("/transacao/extrato", obterExtrato);
rotas.post("/transacao", cadastrarTransacao);
rotas.get("/transacao", listarTransacoes);
rotas.get("/transacao?filtro[]=roupas&filtro[]=salários", listarTransacoes);
rotas.get("/transacao/:id", detalharTransacao);
rotas.delete("/transacao/:id", excluirTransacao);
rotas.put("/transacao/:id", editarTransacao);

rotas.get("/usuario", perfilUsuarioLogado);

rotas.put("/usuario", editarUsuarioLogado);

module.exports = rotas;
