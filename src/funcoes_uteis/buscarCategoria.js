const conexao = require("../bancodedados/conexao");

const buscarCategoriaPorNome = async (categoria_nome) => {
  const categoria = await conexao.query(
    "select id from categorias where descricao = $1",
    [categoria_nome]
  );
  if (categoria.rowCount < 1) {
    return { mensagem: "Categoria não encontrada." };
  }
  return categoria.rows[0];
};

const buscarCategoriaPorId = async (categoria_id) => {
  const categoria = await conexao.query(
    "select descricao from categorias where id = $1",
    [categoria_id]
  );
  if (categoria.rowCount < 1) {
    return res.status(400).json({ mensagem: "Categoria não encontrada." });
  }
  return categoria;
};

module.exports = {
  buscarCategoriaPorNome,
  buscarCategoriaPorId,
};
